import json
import os
from datasets import Dataset
from pathlib import Path
DATASET_PATH = Path("../../backend/synthetic_yoga_instructions_10000_v2.json").resolve()
print(DATASET_PATH)
if not os.path.exists(DATASET_PATH):
    # Fallback check if path is relative to script location
    DATASET_PATH = os.path.join(DATASET_PATH)

print(f"Checking dataset at: {DATASET_PATH}")

try:
    with open(DATASET_PATH, "r") as f:
        data = json.load(f)
    print(f"Successfully loaded {len(data)} samples.")
    
    # Check first sample
    sample = data[0]
    print(f"First sample keys: {list(sample.keys())}")
    
    def format_instruction(sample):
        return f"### Instruction:\nAnalyze the following yoga pose data and provide empathetic, instructional feedback.\n\n{sample['input']}\n\n### Response:\n{sample['output']}"

    formatted = format_instruction(sample)
    print("\nFormatted example:")
    print(formatted)
    
    dataset = Dataset.from_list(data)
    print("\nDataset object created successfully.")

except Exception as e:
    print(f"Error: {e}")
