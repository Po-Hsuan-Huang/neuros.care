import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import os

# Configuration
BASE_MODEL_ID = "Qwen/Qwen3-0.6B"
LORA_ADAPTER_DIR = "./qwen-yoga-finetune"
MERGED_MODEL_DIR = "./qwen-yoga-merged"

def merge_lora():
    print(f"Loading base model: {BASE_MODEL_ID}...")
    # Load base model in FP16/BF16 for merging (don't use 4-bit/8-bit for merging)
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_ID,
        torch_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        device_map="cpu", # Use CPU to avoid OOM if GPU memory is tight, or "auto"
        trust_remote_code=True
    )

    print(f"Loading LoRA adapters from: {LORA_ADAPTER_DIR}...")
    model = PeftModel.from_pretrained(base_model, LORA_ADAPTER_DIR)

    print("Merging weights...")
    merged_model = model.merge_and_unload()

    print(f"Saving merged model to: {MERGED_MODEL_DIR}...")
    merged_model.save_pretrained(MERGED_MODEL_DIR)
    
    # Also save the tokenizer
    tokenizer = AutoTokenizer.from_pretrained(LORA_ADAPTER_DIR)
    tokenizer.save_pretrained(MERGED_MODEL_DIR)

    print("Done!")

if __name__ == "__main__":
    merge_lora()
