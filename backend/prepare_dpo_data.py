"""
Prepare DPO dataset from existing synthetic_yoga_instructions_10000_v2.json.
"""

import json
import os
import sys

# Add current directory to path to import from generate_synthetic_dataset
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generate_synthetic_dataset import (
    generate_encouraging_instruction,
    generate_frustration_instruction
)

def prepare_dpo_data(input_file: str, output_file: str):
    print(f"Loading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    dpo_dataset = []
    
    for item in raw_data:
        metadata = item['metadata']
        pose = metadata['pose']
        joint = metadata['joint']
        confidence = metadata['confidence']
        current_angle = metadata['current_angle']
        target_range = metadata['target_range']
        is_single = metadata['is_single_sentence']
        
        # Calculate deviation and direction
        deviation = current_angle - ((target_range[0] + target_range[1]) / 2)
        
        if deviation > 5:
            direction = "straighten" if "elbow" in joint or "knee" in joint else "extend"
        elif deviation < -5:
            direction = "bend" if "elbow" in joint or "knee" in joint else "flex"
        else:
            direction = None
            
        # Format for generation functions
        pose_display = pose.replace('_', ' ')
        joint_display = joint.replace('_', ' ').title()
        
        # Determine Chosen and Rejected
        original_output = item['output']
        
        if metadata.get('is_frustration'):
            # Original is Rejected
            rejected = original_output
            # Generate Chosen (Encouraging)
            chosen = generate_encouraging_instruction(
                pose_display, joint_display, direction, confidence, is_single, deviation
            )
        elif metadata.get('is_encouraging'):
            # Original is Chosen
            chosen = original_output
            # Generate Rejected (Frustrated)
            rejected = generate_frustration_instruction(
                pose_display, joint_display, direction, confidence, is_single
            )
        else:
            # If neither (Neutral), let's skip or treat as Chosen and generate Rejected
            # For this task, let's treat Neutral as Chosen compared to Frustrated
            chosen = original_output
            rejected = generate_frustration_instruction(
                pose_display, joint_display, direction, confidence, is_single
            )
            
        # Format Prompt
        # "### Instruction: Analyze this yoga pose.\n### Input: {input}\n### Response: "
        prompt = f"### Instruction: Analyze this yoga pose.\n### Input: {item['input']}\n### Response: "
        
        dpo_dataset.append({
            "prompt": prompt,
            "chosen": chosen + "<|endoftext|>",
            "rejected": rejected + "<|endoftext|>",
            "metadata": metadata
        })
        
    print(f"Generated {len(dpo_dataset)} DPO pairs.")
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dpo_dataset, f, indent=2, ensure_ascii=False)
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    input_path = "synthetic_yoga_instructions_10000_v2.json"
    output_path = "dpo_yoga_dataset.json"
    prepare_dpo_data(input_path, output_path)
