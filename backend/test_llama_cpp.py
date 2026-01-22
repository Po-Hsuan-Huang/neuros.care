try:
    from llama_cpp import Llama
    import llama_cpp
    from pathlib import Path
    print(f"llama-cpp-python version: {llama_cpp.__version__}")
    
    # Check if it can initialize (this doesn't require a model file)
    print("Library loaded successfully!")
    
    # If you want to check if CUDA is enabled (since you installed with GGML_CUDA=on)
    # Note: llama-cpp-python doesn't have a direct 'is_cuda_available' but it will log 
    # 'ggml_cuda_init: found ...' when loading a model if built correctly.
    

    path_obj = Path("../LLM/Qwen3-0.6B_local/qwen-yoga-merged/Qwen-Yoga-Merged-596M-Q8_0.gguf").resolve()

    # Load the model
    llm = Llama(
        model_path=str(path_obj),
        n_ctx=40960,  # Context window
        n_threads=4 # Number of CPU threads to use
    )
    def generate_response(instruction, input_text):
        prompt = f"### Instruction: {instruction}\n### Input: {input_text}\n### Response: "
        
        output = llm(
            prompt,
            max_tokens=256,
            stop=["<|endoftext|>", "###"],
            echo=False
        )
        
        return output['choices'][0]['text']
    # Example usage
    instruction = "Analyze this yoga pose."
    input_data = "Pose: Crane\nJoint: right_knee\nCurrent Angle: 113.2°\nTarget Range: 66.4° - 96.4°\nDeviation: +31.8°\nConfidence: 47.2%."
    response = generate_response(instruction, input_data)
    print(f"Model Response:\n{response}")

    # Example usage
    instruction = ''' Give yoga instruction following the guidelines: 1. Emotional Safety Architecture 
    - Progress Celebration: Focus on effort over perfection ("You showed up today - that's what matters")
    - Failure Reframing: "This is challenging" instead of "You're doing it wrong\"
    ### **2. Positive Language Templates**
    **Instead of problematic phrases:**
    - No "Your form is wrong" 
    - Yes "Let's explore a gentle adjustment"

    - No "You need to improve"
    - Yes "You're building strength beautifully"

    - No "Try harder"
    - Yes "Trust your body's wisdom"

    ### **3. LLM Output Constraints**

    **Mandatory Inclusion Rules:**
    - Every correction must include validation ("You're doing great, and here's a way to feel even better...")
    - Effort acknowledgment before any suggestion
    - Optional language ("If it feels right, you might try...")
    - Body autonomy reinforcement ("Listen to your body")

    **Prohibited Content Categories:**
    - Pain normalization ("Push through the pain")
    - Body comparisons or idealization
    - Medical advice or injury diagnosis
    - Rushed pacing or impatience
    - Absolute statements ("You must...")'''
    input_data = "Pose: Crane\nJoint: right_knee\nCurrent Angle: 113.2°\nTarget Range: 66.4° - 96.4°\nDeviation: +31.8°\nConfidence: 47.2%."
    response = generate_response(instruction, input_data)
    print(f"Model Response:\n{response}")

    instruction = "Analyze this yoga pose."
    input_data ="Pose: Plow\nJoint: right_hip\nCurrent Angle: 116.3°\nTarget Range: 86.7° - 116.7°\nDeviation: +14.6°\nConfidence: 57.2%"
    response = generate_response(instruction, input_data)
    print(f"Model Response:\n{response}")

    instruction = ''' Give yoga instruction following the guidelines: 1. Emotional Safety Architecture 
    - Progress Celebration: Focus on effort over perfection ("You showed up today - that's what matters")
    - Failure Reframing: "This is challenging" instead of "You're doing it wrong\"
    ### **2. Positive Language Templates**
    **Instead of problematic phrases:**
    - NO: "Your form is wrong" 
    - YES: "Let's explore a gentle adjustment"

    - NO: "You need to improve"
    - YES: "You're building strength beautifully"

    - NO: "Try harder"
    - YES: "Trust your body's wisdom"

    ### **3. LLM Output Constraints**

    **Mandatory Inclusion Rules:**
    - Every correction must include validation ("You're doing great, and here's a way to feel even better...")
    - Effort acknowledgment before any suggestion
    - Optional language ("If it feels right, you might try...")
    - Body autonomy reinforcement ("Listen to your body")

    **Prohibited Content Categories:**
    - Pain normalization ("Push through the pain")
    - Body comparisons or idealization
    - Medical advice or injury diagnosis
    - Rushed pacing or impatience
    - Absolute statements ("You must...")'''
    input_data ="Pose: Plow\nJoint: right_hip\nCurrent Angle: 116.3°\nTarget Range: 86.7° - 116.7°\nDeviation: +14.6°\nConfidence: 57.2%"
    response = generate_response(instruction, input_data)
    print(f"Model Response:\n{response}")

except ImportError as e:
    print(f"Failed to import llama-cpp-python: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
