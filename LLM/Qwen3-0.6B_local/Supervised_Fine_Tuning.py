import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig
from trl import SFTTrainer, SFTConfig
import json
import os
import sys

print(f"Python version: {sys.version}")
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA version (used by Torch): {torch.version.cuda}")
print(f"Is CUDA available: {torch.cuda.is_available()}")
print(torch._C._GLIBCXX_USE_CXX11_ABI)
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
# 1. Configuration
device_map = {"": 0} #  the 3090.
MODEL_ID = "Qwen/Qwen3-0.6B"
OUTPUT_DIR = "./qwen-yoga-finetune"
DATASET_PATH = os.path.expanduser("../../backend/synthetic_yoga_instructions_10000_v2.json")

# 2. Prepare the Dataset (Using the structure we defin
# ed previously)
# We assume you have your data in a list of dicts called `data`
dataset = load_dataset("json", data_files=DATASET_PATH)


def preprocess_yoga_data(example):
    # Create the structured string manually
    text = (
        f"### Instruction: Analyze this yoga pose.\n"
        f"### Input: {example['input']}\n"
        f"### Response: {example['output']}<|endoftext|>"
    )
    return {"text": text}


split_dataset = dataset["train"].train_test_split(test_size=0.3, seed=42)
split_dataset = split_dataset.map(preprocess_yoga_data)

# Accessing your new sets:
train_dataset = split_dataset["train"]
eval_dataset = split_dataset["test"]
# Print all column names
print(train_dataset.column_names)

# 3. Load Tokenizer & Model
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# Load model in 4-bit to save memory (optional for 0.6B, but full precision is recommended)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    attn_implementation="flash_attention_2",
    quantization_config=bnb_config,
    device_map=device_map,
    trust_remote_code=True
)

# 4. Define LoRA Config
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
)


# 5. Define Training Arguments
training_args = SFTConfig(
    output_dir=OUTPUT_DIR,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    warmup_ratio=0.05,
    lr_scheduler_type="cosine",
    num_train_epochs=3,
    logging_steps=10,
    save_steps=100,
    bf16=torch.cuda.is_bf16_supported(),
    fp16=not torch.cuda.is_bf16_supported(),
    save_strategy="steps",
    eval_steps=10,
    optim="paged_adamw_32bit",
    report_to="none",
    max_length=512,
    completion_only_loss=True,
    packing=True
)


def formatting_func(example):
    # Standard format to help the model distinguish input vs output
    text = f"### Instruction: Analyze this yoga pose.\n### Input: {example['input']}\n### Response: {example['output']}<|endoftext|>"
    return text


trainer = SFTTrainer(
    model=model,
    peft_config=peft_config,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    processing_class=tokenizer,
)

# 7. Train
print("Starting training...")
trainer.train()

# 8. Save
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"Model saved to {OUTPUT_DIR}")