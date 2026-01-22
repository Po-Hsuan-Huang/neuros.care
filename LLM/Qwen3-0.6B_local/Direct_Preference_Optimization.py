import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig
from trl import DPOTrainer, DPOConfig
import os
import sys

print(f"Python version: {sys.version}")
print(f"PyTorch version: {torch.__version__}")
print(f"Is CUDA available: {torch.cuda.is_available()}")

# 1. Configuration
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
device_map = {"": 0}

# Paths
# We use the SFT model as the base for DPO
# Assuming SFT model is saved at ./qwen-yoga-finetune
MODEL_ID = "./qwen-yoga-finetune" 
DATASET_PATH = os.path.expanduser("../../backend/dpo_yoga_dataset.json")
OUTPUT_DIR = "./qwen-yoga-dpo"

# 2. Load Dataset
print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH)
# Split dataset
split_dataset = dataset["train"].train_test_split(test_size=0.1, seed=42)
train_dataset = split_dataset["train"]
eval_dataset = split_dataset["test"]

print(f"Train size: {len(train_dataset)}")
print(f"Eval size: {len(eval_dataset)}")

# 3. Load Tokenizer & Model
print(f"Loading model from {MODEL_ID}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token

# Load model in 4-bit
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

# Load the SFT model
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    quantization_config=bnb_config,
    device_map=device_map,
    trust_remote_code=True,
    attn_implementation="flash_attention_2"
)

# Reference model is usually the same as the model being trained (initially)
# DPOTrainer handles loading the reference model automatically if not provided, 
# usually by loading the same model again. 
# However, with PEFT/LoRA, we train adapters on top of the base model.
# For DPO with LoRA, we can just pass the model and peft_config.

# 4. Define LoRA Config for DPO
peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
)

# 5. Define Training Arguments
training_args = DPOConfig(
    output_dir=OUTPUT_DIR,
    beta=0.1, # The beta parameter for DPO
    per_device_train_batch_size=2, # DPO uses more memory, so lower batch size
    gradient_accumulation_steps=8,
    learning_rate=5e-6, # Lower learning rate for DPO
    warmup_ratio=0.1,
    lr_scheduler_type="cosine",
    num_train_epochs=1, # DPO often converges quickly
    logging_steps=10,
    save_steps=100,
    bf16=torch.cuda.is_bf16_supported(),
    fp16=not torch.cuda.is_bf16_supported(),
    save_strategy="steps",
    eval_steps=50,
    optim="paged_adamw_32bit",
    report_to="none",
    max_length=1024,
    max_prompt_length=512,
    max_target_length=512,
)

# 6. Initialize DPOTrainer
trainer = DPOTrainer(
    model=model,
    ref_model=None, # None because we use peft_config
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    tokenizer=tokenizer,
    peft_config=peft_config,
)

# 7. Train
print("Starting DPO training...")
trainer.train()

# 8. Save
print(f"Saving model to {
    
}...")
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print("Done!")
