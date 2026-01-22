"""
Generate 100 synthetic instruction pairs for empathetic yoga coaching model training.

Based on:
- Joint angle deviations from target angles
- Confidence scores from pose classification
- Various yoga poses and correction scenarios
"""

import json
import random
from typing import List, Dict

# Joint names from TargetAngleProfile.py
JOINTS = ['left_elbow', 'right_elbow', 'left_shoulder', 'right_shoulder', 
          'left_hip', 'right_hip', 'left_knee', 'right_knee']

# Pose names from server.py
POSES = [
    "Boat", "Bow", "Bridge", "Camel", "Cat", "Chair", "Cobra", "Corpse",
    "Crane", "Dancer", "Diamond", "Downward_Facing_Dog", "Eagle", "Garland",
    "Goddess", "Half_Moon", "Lotus", "Plank", "Plow", "Seated_Forward_Fold",
    "Side_Plank", "Staff", "Standing_Forward_Bend", "Tree", "Triangle",
    "Upward_Salute", "Warrior_I", "Warrior_II", "Warrior_III", "Wheel"
]

POSE_GUIDE_DATA = {
  "Half_Moon": {
    "benefits": [
      "Improves balance and coordination",
      "Strengthens ankles, legs, and glutes",
      "Opens chest and shoulders",
      "Engages core and spinal stabilizers"
    ],
    "steps": [
      "From Triangle Pose, bend the front knee and place front-hand fingertips ~12\" ahead of the foot",
      "Shift weight into the front foot and hand; lift the back leg parallel to the floor",
      "Stack hips vertically; rotate chest open while extending top arm upward",
      "Engage standing leg and press through lifted heel",
      "Gaze forward, sideways, or up; maintain steady breath"
    ]
  },
  "Butterfly": {
    "benefits": [
      "Opens hips and groins",
      "Improves circulation in pelvic region",
      "Encourages upright seated posture",
      "Calms the nervous system with forward fold variation"
    ],
    "steps": [
      "Sit tall with legs extended, then bend knees and bring soles of feet together",
      "Let knees drop toward the floor; hold feet or ankles",
      "Lengthen spine upward, broadening collarbones",
      "Option: hinge forward from hips while keeping spine long",
      "Breathe evenly without forcing knees down"
    ]
  },
  "Downward_Facing_Dog": {
    "benefits": [
      "Lengthens hamstrings, calves, and spine",
      "Builds strength in shoulders and arms",
      "Energizes the body and improves circulation",
      "Can relieve mild back tension with proper alignment"
    ],
    "steps": [
      "Start on hands and knees; wrists under shoulders, knees under hips",
      "Spread fingers; tuck toes and lift knees",
      "Press hips up and back, aiming for a long spine",
      "Gently straighten legs without locking knees",
      "Press heels toward (not necessarily to) the floor; relax neck"
    ]
  },
  "Dancer": {
    "benefits": [
      "Enhances balance and focus",
      "Opens chest and shoulders",
      "Stretches quadriceps and hip flexors",
      "Strengthens standing leg and core"
    ],
    "steps": [
      "Stand tall; shift weight into one foot",
      "Bend opposite knee and grasp inside of foot or ankle",
      "Inhale, lift chest; exhale, press foot back and up",
      "Reach free arm forward or upward for balance",
      "Keep hips square; gaze (drishti) steady"
    ]
  },
  "Triangle": {
    "benefits": [
      "Stretches hamstrings, hips, and side body",
      "Opens chest and shoulders",
      "Improves spinal mobility",
      "Builds postural awareness"
    ],
    "steps": [
      "From a wide stance, turn front foot out 90° and back foot slightly in",
      "Extend arms to shoulder height",
      "Hinge at front hip, reaching forward",
      "Lower front hand to shin, block, or floor; lift top arm",
      "Stack shoulders; lengthen both sides of torso; steady breath"
    ]
  },
  "Goddess": {
    "benefits": [
      "Strengthens legs, glutes, and core",
      "Opens hips and chest",
      "Builds lower-body endurance",
      "Improves hip external rotation"
    ],
    "steps": [
      "Take a wide stance; toes turned out ~45°",
      "Inhale tall; exhale bend knees tracking over toes",
      "Lower hips toward knee height (not below if new)",
      "Engage core and lengthen spine upright",
      "Hold arms bent (cactus) or extended; steady breath"
    ]
  },
  "Warrior_II": {
    "benefits": [
      "Builds leg and hip strength",
      "Opens hips and chest",
      "Improves stamina and focus",
      "Enhances proprioception in lower body"
    ],
    "steps": [
      "From a wide stance, turn front foot out 90°, back foot slightly in",
      "Align front heel with back arch (or wider for stability)",
      "Bend front knee over ankle toward 90°",
      "Extend arms parallel to floor; soften shoulders",
      "Gaze past front fingertips; engage core"
    ]
  },
  "Tree": {
    "benefits": [
      "Improves balance and ankle stability",
      "Strengthens standing leg and core",
      "Promotes focus and calm",
      "Opens hips (external rotation)"
    ],
    "steps": [
      "Stand tall; shift weight into one foot",
      "Place sole of opposite foot at ankle, calf, or inner thigh (avoid knee)",
      "Press foot and leg together to engage",
      "Bring hands to heart or overhead",
      "Maintain steady gaze and smooth breath"
    ]
  }
}

def generate_input_context(pose: str, joint: str, current_angle: float, 
                          target_range: tuple, confidence: float) -> str:
    """Generate input context for the model."""
    deviation = current_angle - ((target_range[0] + target_range[1]) / 2)
    
    return f"""Pose: {pose}
Joint: {joint}
Current Angle: {current_angle:.1f}°
Target Range: {target_range[0]:.1f}° - {target_range[1]:.1f}°
Deviation: {deviation:+.1f}°
Confidence: {confidence:.1f}%"""


def generate_synthetic_dataset(num_samples: int = 100) -> List[Dict]:
    """Generate synthetic instruction pairs."""
    dataset = []
    
    # Distribution targets: 80% single sentence, 80% encouraging, 20% frustration, 20% multi-sentence
    num_single_sentence = int(num_samples * 0.8)  # 80
    num_encouraging = int(num_samples * 0.8)  # 80
    num_frustration = int(num_samples * 0.2)  # 20
    num_multi_sentence = int(num_samples * 0.2)  # 20
    
    # Create indices for each category
    single_sentence_indices = set(random.sample(range(num_samples), num_single_sentence))
    encouraging_indices = set(random.sample(range(num_samples), num_encouraging))
    frustration_indices = set(random.sample(range(num_samples), num_frustration))
    multi_sentence_indices = set(random.sample(range(num_samples), num_multi_sentence))
    
    for i in range(num_samples):
        # Randomly select pose and joint
        pose = random.choice(POSES)
        joint = random.choice(JOINTS)
        
        # Generate realistic angle scenarios
        target_mid = random.uniform(30, 150)
        target_range = (target_mid - 15, target_mid + 15)
        
        # Vary confidence and deviation scenarios
        scenario_type = random.choice(['good', 'moderate', 'poor', 'excellent'])
        
        if scenario_type == 'excellent':
            confidence = random.uniform(85, 98)
            current_angle = random.uniform(target_range[0], target_range[1])
        elif scenario_type == 'good':
            confidence = random.uniform(70, 85)
            current_angle = target_mid + random.uniform(-25, 25)
        elif scenario_type == 'moderate':
            confidence = random.uniform(50, 70)
            current_angle = target_mid + random.uniform(-40, 40)
        else:  # poor
            confidence = random.uniform(30, 50)
            current_angle = target_mid + random.uniform(-60, 60)
        
        # Generate input
        input_text = generate_input_context(pose, joint, current_angle, target_range, confidence)
        
        # Generate output based on distributions
        is_single = i in single_sentence_indices
        is_encouraging = i in encouraging_indices
        is_frustration = i in frustration_indices
        is_multi = i in multi_sentence_indices
        
        output_text = generate_instruction(
            pose, joint, current_angle, target_range, confidence,
            is_single, is_encouraging, is_frustration
        )
        
        dataset.append({
            "input": input_text,
            "output": output_text,
            "metadata": {
                "pose": pose,
                "joint": joint,
                "current_angle": round(current_angle, 1),
                "target_range": [round(target_range[0], 1), round(target_range[1], 1)],
                "confidence": round(confidence, 1),
                "is_single_sentence": is_single,
                "is_encouraging": is_encouraging,
                "is_frustration": is_frustration,
                "is_multi_sentence": is_multi
            }
        })
    
    return dataset


def generate_instruction(pose: str, joint: str, current_angle: float, 
                        target_range: tuple, confidence: float,
                        is_single: bool, is_encouraging: bool, is_frustration: bool) -> str:
    """Generate instruction based on context and tone requirements."""
    
    deviation = current_angle - ((target_range[0] + target_range[1]) / 2)
    joint_display = joint.replace('_', ' ').title()
    pose_display = pose.replace('_', ' ')
    
    # Determine direction
    if deviation > 5:
        direction = "straighten" if "elbow" in joint or "knee" in joint else "extend"
        comparison = "too bent"
    elif deviation < -5:
        direction = "bend" if "elbow" in joint or "knee" in joint else "flex"
        comparison = "too straight"
    else:
        direction = None
        comparison = "aligned"
    
    # Generate based on tone
    if is_frustration:
        return generate_frustration_instruction(pose_display, joint_display, direction, confidence, is_single)
    elif is_encouraging:
        return generate_encouraging_instruction(pose_display, joint_display, direction, confidence, is_single, deviation)
    else:
        return generate_neutral_instruction(pose_display, joint_display, direction, confidence, is_single)


def generate_encouraging_instruction(pose: str, joint: str, direction: str, 
                                    confidence: float, is_single: bool, deviation: float) -> str:
    """Generate encouraging instruction."""
    
    # Get pose data if available
    pose_data = POSE_GUIDE_DATA.get(pose, {})
    benefit = random.choice(pose_data['benefits']) if 'benefits' in pose_data else "it builds strength and flexibility"
    
    if direction is None:
        templates_single = [
            f"Perfect {pose}! Your {joint} alignment is spot on.",
            f"Excellent form! Your {joint} is beautifully aligned in this {pose}.",
            f"You've mastered this {pose}! Your {joint} position is ideal.",
            f"Outstanding! Your {joint} is perfectly positioned for this {pose}.",
        ]
        templates_multi = [
            f"Absolutely perfect! Your {pose} is textbook, and your {joint} alignment is exactly where it should be. Remember that this pose {benefit.lower()}.",
            f"You've really mastered this pose! Your {joint} is in the ideal position. Hold this beautiful {pose} to {benefit.lower().replace('builds', 'build').replace('improves', 'improve')}.",
        ]
    else:
        templates_single = [
            f"Great work on your {pose}! Try to {direction} your {joint} just a bit more.",
            f"You're doing wonderfully—gently {direction} your {joint} to deepen the pose.",
            f"Excellent effort! Focus on {direction}ing your {joint} for perfect alignment.",
            f"Beautiful {pose}! Just {direction} your {joint} slightly to enhance the stretch.",
            f"You're so close! {direction.capitalize()} your {joint} a touch more for optimal form.",
            f"Fantastic progress! Let's {direction} that {joint} to refine your {pose}.",
            f"You're nailing it! A small adjustment to {direction} your {joint} will perfect this.",
            f"Wonderful alignment! Try {direction}ing your {joint} to deepen the benefits.",
            f"You've got this! Gently {direction} your {joint} for even better posture.",
            f"Impressive {pose}! Just {direction} your {joint} a bit to maximize the stretch.",
        ]
        
        templates_multi = [
            f"You're doing an amazing job with your {pose}! To get even more out of this pose, try to {direction} your {joint} just a little bit more. This will help as the pose {benefit.lower()}.",
            f"Beautiful work! Your {pose} is looking strong. Focus on {direction}ing your {joint} to achieve perfect alignment. Remember, this pose {benefit.lower()}.",
            f"Excellent effort on this {pose}! I can see you're really trying. Let's {direction} that {joint} slightly to enhance the pose and {benefit.lower().replace('builds', 'build').replace('improves', 'improve')}.",
            f"You're making wonderful progress! Your form is improving with each breath. Try {direction}ing your {joint} gently. This is great because it {benefit.lower()}.",
            f"Great job holding this {pose}! You're building strength. A small adjustment to {direction} your {joint} will help you {benefit.lower().replace('builds', 'build').replace('improves', 'improve')}.",
        ]
    
    if is_single:
        return random.choice(templates_single)
    else:
        return random.choice(templates_multi)


def generate_frustration_instruction(pose: str, joint: str, direction: str, 
                                    confidence: float, is_single: bool) -> str:
    """Generate frustrated/corrective instruction."""
    
    # Get pose data if available
    pose_data = POSE_GUIDE_DATA.get(pose, {})
    step = random.choice(pose_data['steps']) if 'steps' in pose_data else "maintain proper alignment"
    
    if direction is None:
        # Even when aligned, frustrated tone can be about confidence or stability
        templates_single = [
            f"Your {joint} is aligned, but you need to hold the {pose} more steadily.",
            f"The position is correct, but your {pose} lacks stability—focus harder.",
            f"Your {joint} is fine, but the overall {pose} needs more commitment.",
            f"Technically correct, but you're not holding this {pose} with enough confidence.",
        ]
        templates_multi = [
            f"While your {joint} is in the right position, your overall {pose} is shaky. You need to engage your core and hold this with more stability. Concentrate!",
            f"The {joint} alignment is acceptable, but I'm not seeing enough confidence in your {pose}. Hold it steady and breathe through it.",
        ]
    else:
        templates_single = [
            f"Your {joint} needs more attention—really focus on {direction}ing it properly.",
            f"The {joint} alignment is off in your {pose}; you need to {direction} it more.",
            f"I'm not seeing enough {direction} in your {joint} for this {pose}.",
            f"Your {joint} position isn't quite right—work on {direction}ing it.",
            f"Let's fix that {joint}—it needs to {direction} significantly more.",
            f"Your {pose} won't be effective until you properly {direction} your {joint}.",
            f"That {joint} is still not in the right position—{direction} it more deliberately.",
            f"You're missing the mark with your {joint}—focus harder on {direction}ing it.",
            f"The {joint} needs correction; {direction} it to match the proper form.",
            f"Your {joint} alignment is preventing a good {pose}—{direction} it now.",
        ]
        
        templates_multi = [
            f"Your {joint} isn't in the right position for this {pose}. You really need to focus on {direction}ing it properly. Remember: {step}.",
            f"I'm seeing significant misalignment in your {joint}. Let's work on {direction}ing it correctly. Without this adjustment, you won't get the full benefits. Recall the step: {step}.",
            f"The {joint} position is quite off. You must {direction} it more deliberately to achieve proper form. Take a moment to reset: {step}.",
            f"Your {pose} needs work, particularly with your {joint}. Focus on {direction}ing it properly. This is fundamental. {step}.",
            f"That {joint} alignment is concerning. Please {direction} it significantly to avoid strain. Let's get this right: {step}.",
        ]
    
    if is_single:
        return random.choice(templates_single)
    else:
        return random.choice(templates_multi)


def generate_neutral_instruction(pose: str, joint: str, direction: str, 
                                confidence: float, is_single: bool) -> str:
    """Generate neutral/informative instruction."""
    
    # Get pose data if available
    pose_data = POSE_GUIDE_DATA.get(pose, {})
    info = random.choice(pose_data['benefits']) if 'benefits' in pose_data else "proper form is key"
    
    if direction is None:
        templates_single = [
            f"Your {joint} is well-aligned in this {pose}.",
            f"Good {joint} positioning for your {pose}.",
            f"The {joint} is correctly placed in this {pose}.",
            f"Your {joint} alignment is appropriate for this {pose}.",
        ]
        templates_multi = [
            f"Your {joint} is in good position for this {pose}. Maintain this alignment. Remember, this pose {info.lower()}.",
            f"The {joint} positioning looks correct in your {pose}. Hold this form and concentrate on stability. It helps to {info.lower().replace('builds', 'build').replace('improves', 'improve')}.",
        ]
    else:
        templates_single = [
            f"Adjust your {joint} by {direction}ing it slightly in your {pose}.",
            f"For better alignment, {direction} your {joint} in this {pose}.",
            f"Focus on {direction}ing your {joint} to improve your {pose}.",
            f"Your {pose} would benefit from {direction}ing the {joint} more.",
            f"Try {direction}ing your {joint} to refine this {pose}.",
            f"The {joint} should {direction} more for proper {pose} form.",
            f"Modify your {joint} position by {direction}ing it in this {pose}.",
            f"To enhance this {pose}, {direction} your {joint} slightly.",
        ]
        
        templates_multi = [
            f"In your current {pose}, your {joint} needs adjustment. Try {direction}ing it to achieve better alignment. This will help as the pose {info.lower()}.",
            f"Let's work on your {joint} positioning. {direction.capitalize()} it gradually to match the target form. This is important because it {info.lower()}.",
            f"Your {pose} is coming along. To improve it further, focus on {direction}ing your {joint}. This adjustment will help {info.lower().replace('builds', 'build').replace('improves', 'improve')}.",
            f"Notice how your {joint} is positioned. Try {direction}ing it to align with the proper form for {pose}. Small adjustments make a big difference.",
        ]
    
    if is_single:
        return random.choice(templates_single)
    else:
        return random.choice(templates_multi)


def main():
    """Generate and save the synthetic dataset."""
    print("Generating 100 synthetic instruction pairs...")
    dataset = generate_synthetic_dataset(10000)
    
    # Save to JSON file
    output_path = "synthetic_yoga_instructions_100.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Dataset saved to {output_path}")
    
    # Print statistics
    single_count = sum(1 for d in dataset if d['metadata']['is_single_sentence'])
    encouraging_count = sum(1 for d in dataset if d['metadata']['is_encouraging'])
    frustration_count = sum(1 for d in dataset if d['metadata']['is_frustration'])
    multi_count = sum(1 for d in dataset if d['metadata']['is_multi_sentence'])
    
    print(f"\nDataset Statistics:")
    print(f"  Total samples: {len(dataset)}")
    print(f"  Single sentence: {single_count} ({single_count/len(dataset)*100:.1f}%)")
    print(f"  Multi-sentence: {multi_count} ({multi_count/len(dataset)*100:.1f}%)")
    print(f"  Encouraging tone: {encouraging_count} ({encouraging_count/len(dataset)*100:.1f}%)")
    print(f"  Frustration tone: {frustration_count} ({frustration_count/len(dataset)*100:.1f}%)")
    
    # Print a few examples
    print(f"\n=== Sample Instructions ===\n")
    for i, sample in enumerate(random.sample(dataset, 3), 1):
        print(f"Example {i}:")
        print(f"INPUT:\n{sample['input']}\n")
        print(f"OUTPUT:\n{sample['output']}\n")
        print(f"Metadata: {sample['metadata']}\n")
        print("-" * 80 + "\n")


if __name__ == "__main__":
    main()
