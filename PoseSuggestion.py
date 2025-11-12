import numpy as np
from typing import Dict, List, Tuple, Optional

# ------------------------------
# Geometry & keypoint utilities
# ------------------------------

def _angle_between(p1: Dict, p2: Dict, p3: Dict) -> Optional[float]:
    """Compute the angle (in degrees) at point p2 formed by points p1-p2-p3.
    Returns angle in [0, 180] or None if not computable.
    """
    try:
        a = np.array([p1['x'] - p2['x'], p1['y'] - p2['y']], dtype=np.float32)
        b = np.array([p3['x'] - p2['x'], p3['y'] - p2['y']], dtype=np.float32)
        na = np.linalg.norm(a)
        nb = np.linalg.norm(b)
        if na == 0 or nb == 0:
            return None
        cosang = np.dot(a, b) / (na * nb)
        cosang = np.clip(cosang, -1.0, 1.0)
        ang = float(np.degrees(np.arccos(cosang)))
        return ang
    except Exception:
        return None


def _keypoints_by_name(keypoints: List[Dict]) -> Dict[str, Dict]:
    """Map list of keypoints to a dict by name using COCO order fallback."""
    names = [
        'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
        'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
        'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ]
    by_name: Dict[str, Dict] = {}
    has_name = len(keypoints) > 0 and all('name' in kp for kp in keypoints)
    if has_name:
        for kp in keypoints:
            by_name[kp['name']] = kp
    else:
        for i, kp in enumerate(keypoints):
            if i < len(names):
                by_name[names[i]] = kp
    return by_name


# ------------------------------
# Angle computation
# ------------------------------

def compute_joint_angles(keypoints: List[Dict]) -> Dict[str, Optional[float]]:
    """Compute common joint angles from keypoints (degrees)."""
    kp = _keypoints_by_name(keypoints)
    angles: Dict[str, Optional[float]] = {}
    # Elbows: shoulder-elbow-wrist
    angles['left_elbow'] = _angle_between(kp.get('left_shoulder', {}), kp.get('left_elbow', {}), kp.get('left_wrist', {})) if kp.get('left_elbow') else None
    angles['right_elbow'] = _angle_between(kp.get('right_shoulder', {}), kp.get('right_elbow', {}), kp.get('right_wrist', {})) if kp.get('right_elbow') else None
    # Shoulders: elbow-shoulder-hip
    angles['left_shoulder'] = _angle_between(kp.get('left_elbow', {}), kp.get('left_shoulder', {}), kp.get('left_hip', {})) if kp.get('left_shoulder') else None
    angles['right_shoulder'] = _angle_between(kp.get('right_elbow', {}), kp.get('right_shoulder', {}), kp.get('right_hip', {})) if kp.get('right_shoulder') else None
    # Hips: shoulder-hip-knee
    angles['left_hip'] = _angle_between(kp.get('left_shoulder', {}), kp.get('left_hip', {}), kp.get('left_knee', {})) if kp.get('left_hip') else None
    angles['right_hip'] = _angle_between(kp.get('right_shoulder', {}), kp.get('right_hip', {}), kp.get('right_knee', {})) if kp.get('right_hip') else None
    # Knees: hip-knee-ankle
    angles['left_knee'] = _angle_between(kp.get('left_hip', {}), kp.get('left_knee', {}), kp.get('left_ankle', {})) if kp.get('left_knee') else None
    angles['right_knee'] = _angle_between(kp.get('right_hip', {}), kp.get('right_knee', {}), kp.get('right_ankle', {})) if kp.get('right_knee') else None
    return angles


# ------------------------------
# Target pose angle profiles (heuristics)
# Each entry is angle ranges per joint.
# Example: { 'left_knee': (170, 185) } means aim ~straight.
# ------------------------------
TARGET_ANGLE_PROFILES: Dict[str, Dict[str, Tuple[float, float]]] = {
    # 0 Boat Pose (Navasana)
    'boat': {
        'left_knee': (80, 120), 'right_knee': (80, 120),
        'left_hip': (70, 110), 'right_hip': (70, 110),
        'left_shoulder': (70, 120), 'right_shoulder': (70, 120),
    },
    # 1 Bow Pose (Dhanurasana)
    'bow': {
        'left_knee': (80, 130), 'right_knee': (80, 130),
        'left_shoulder': (30, 80), 'right_shoulder': (30, 80),
        'left_hip': (120, 180), 'right_hip': (120, 180),
    },
    # 2 Bridge Pose (Setu Bandhasana)
    'bridge': {
        'left_knee': (80, 110), 'right_knee': (80, 110),
        'left_hip': (140, 185), 'right_hip': (140, 185),
        'left_shoulder': (150, 185), 'right_shoulder': (150, 185),
    },
    # 3 Camel Pose (Ustrasana)
    'camel': {
        'left_hip': (150, 185), 'right_hip': (150, 185),
        'left_shoulder': (30, 80), 'right_shoulder': (30, 80),
    },
    # 4 Cat Pose (Marjaryasana)
    'cat': {
        'left_hip': (60, 120), 'right_hip': (60, 120),
        'left_shoulder': (80, 130), 'right_shoulder': (80, 130),
        'left_elbow': (160, 185), 'right_elbow': (160, 185),
    },
    # 5 Chair Pose (Utkatasana)
    'chair': {
        'left_knee': (80, 110), 'right_knee': (80, 110),
        'left_hip': (70, 110), 'right_hip': (70, 110),
        'left_shoulder': (150, 185), 'right_shoulder': (150, 185),
    },
    # 6 Cobra Pose (Bhujangasana)
    'cobra': {
        'left_elbow': (160, 185), 'right_elbow': (160, 185),
        'left_shoulder': (30, 80), 'right_shoulder': (30, 80),
        'left_hip': (150, 185), 'right_hip': (150, 185),
    },
    # 7 Corpse Pose (Savasana)
    'corpse': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (165, 185), 'right_hip': (165, 185),
        'left_shoulder': (165, 185), 'right_shoulder': (165, 185),
    },
    # 8 Crane Pose (Bakasana)
    'crane': {
        'left_elbow': (70, 110), 'right_elbow': (70, 110),
        'left_knee': (30, 80), 'right_knee': (30, 80),
        'left_hip': (60, 110), 'right_hip': (60, 110),
    },
    # 9 Dancer's Pose (Natarajasana)
    'dancer': {
        'left_knee': (30, 80), 'right_knee': (165, 185),
        'left_shoulder': (60, 120), 'right_shoulder': (60, 120),
        'left_hip': (120, 185), 'right_hip': (150, 185),
    },
    # 10 Diamond Pose (Vajrasana)
    'diamond': {
        'left_knee': (40, 90), 'right_knee': (40, 90),
        'left_hip': (60, 110), 'right_hip': (60, 110),
    },
    # 11 Downward-Facing Dog (Adho Mukha Svanasana)
    'downward_facing_dog': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (160, 185), 'right_hip': (160, 185),
        'left_shoulder': (160, 185), 'right_shoulder': (160, 185),
    },
    # 12 Eagle Pose (Garudasana)
    'eagle': {
        'left_knee': (40, 100), 'right_knee': (40, 100),
        'left_elbow': (50, 100), 'right_elbow': (50, 100),
        'left_hip': (70, 110), 'right_hip': (70, 110),
    },
    # 13 Garland Pose (Malasana)
    'garland': {
        'left_knee': (30, 80), 'right_knee': (30, 80),
        'left_hip': (40, 90), 'right_hip': (40, 90),
    },
    # 14 Goddess Pose (Utkata Konasana)
    'goddess': {
        'left_knee': (70, 110), 'right_knee': (70, 110),
        'left_hip': (60, 110), 'right_hip': (60, 110),
        'left_shoulder': (100, 160), 'right_shoulder': (100, 160),
    },
    # 15 Half Moon Pose (Ardha Chandrasana)
    'half_moon': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (120, 170), 'right_hip': (120, 170),
        'left_shoulder': (120, 170), 'right_shoulder': (120, 170),
    },
    # 16 Lotus Pose (Padmasana)
    'lotus': {
        'left_knee': (30, 80), 'right_knee': (30, 80),
        'left_hip': (40, 90), 'right_hip': (40, 90),
    },
    # 17 Plank Pose (Phalakasana)
    'plank': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (165, 185), 'right_hip': (165, 185),
        'left_shoulder': (160, 185), 'right_shoulder': (160, 185),
        'left_elbow': (165, 185), 'right_elbow': (165, 185),
    },
    # 18 Plow Pose (Halasana)
    'plow': {
        'left_knee': (80, 140), 'right_knee': (80, 140),
        'left_hip': (30, 80), 'right_hip': (30, 80),
        'left_shoulder': (150, 185), 'right_shoulder': (150, 185),
    },
    # 19 Seated Forward Fold (Paschimottanasana)
    'seated_forward_fold': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (30, 80), 'right_hip': (30, 80),
        'left_shoulder': (60, 120), 'right_shoulder': (60, 120),
    },
    # 20 Side Plank Pose (Vasisthasana)
    'side_plank': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_elbow': (165, 185), 'right_elbow': (165, 185),
        'left_shoulder': (160, 185), 'right_shoulder': (160, 185),
        'left_hip': (160, 185), 'right_hip': (160, 185),
    },
    # 21 Staff Pose (Dandasana)
    'staff': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (150, 185), 'right_hip': (150, 185),
        'left_shoulder': (80, 130), 'right_shoulder': (80, 130),
    },
    # 22 Standing Forward Bend (Uttanasana)
    'standing_forward_bend': {
        'left_knee': (150, 185), 'right_knee': (150, 185),
        'left_hip': (20, 60), 'right_hip': (20, 60),
        'left_shoulder': (60, 120), 'right_shoulder': (60, 120),
    },
    # 23 Tree Pose (Vrikshasana)
    'tree': {
        'left_knee': (20, 80), 'right_knee': (165, 185),
        'left_hip': (60, 120), 'right_hip': (165, 185),
        'left_shoulder': (120, 170), 'right_shoulder': (120, 170),
    },
    # 24 Triangle Pose (Trikonasana)
    'triangle': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (150, 185), 'right_hip': (150, 185),
        'left_shoulder': (150, 185), 'right_shoulder': (150, 185),
    },
    # 25 Upward Salute (Urdhva Hastasana)
    'upward_salute': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (165, 185), 'right_hip': (165, 185),
        'left_shoulder': (170, 185), 'right_shoulder': (170, 185),
        'left_elbow': (165, 185), 'right_elbow': (165, 185),
    },
    # 26 Warrior I Pose (Virabhadrasana I)
    'warrior_i': {
        'left_knee': (80, 110), 'right_knee': (165, 185),
        'left_hip': (120, 170), 'right_hip': (150, 185),
        'left_shoulder': (160, 185), 'right_shoulder': (160, 185),
    },
    # 27 Warrior II Pose (Virabhadrasana II)
    'warrior_ii': {
        'left_knee': (80, 110), 'right_knee': (165, 185),
        'left_hip': (150, 185), 'right_hip': (150, 185),
        'left_shoulder': (150, 185), 'right_shoulder': (150, 185),
    },
    # 28 Warrior III Pose (Virabhadrasana III)
    'warrior_iii': {
        'left_knee': (165, 185), 'right_knee': (165, 185),
        'left_hip': (160, 185), 'right_hip': (160, 185),
        'left_shoulder': (160, 185), 'right_shoulder': (160, 185),
    },
    # 29 Wheel Pose (Chakrasana)
    'wheel': {
        'left_knee': (80, 130), 'right_knee': (80, 130),
        'left_hip': (150, 185), 'right_hip': (150, 185),
        'left_shoulder': (150, 185), 'right_shoulder': (150, 185),
        'left_elbow': (80, 140), 'right_elbow': (80, 140),
    },
}


def _directional_hint(joint: str, angle: float, target_range: Tuple[float, float]) -> str:
    low, high = target_range
    # Generic messaging
    if 'knee' in joint:
        return 'Straighten' if angle < low else 'Bend'
    if 'hip' in joint:
        return 'Open' if angle < low else 'Close'
    if 'shoulder' in joint:
        return 'Lift' if angle < low else 'Lower'
    if 'elbow' in joint:
        return 'Straighten' if angle < low else 'Bend'
    return 'Adjust'


def compare_angles_to_profile(angles: Dict[str, Optional[float]], profile: Dict[str, Tuple[float, float]]) -> List[str]:
    suggestions: List[str] = []
    for joint, target_range in profile.items():
        angle = angles.get(joint)
        if angle is None:
            continue
        low, high = target_range
        if angle < low:
            verb = _directional_hint(joint, angle, target_range)
            suggestions.append(f"{verb} your {joint.replace('_', ' ')} toward ~{(low + high)//2}°")
        elif angle > high:
            verb = _directional_hint(joint, angle, target_range)
            suggestions.append(f"{verb} your {joint.replace('_', ' ')} toward ~{(low + high)//2}°")
    return suggestions


# ------------------------------
# Main API-facing correction logic
# ------------------------------

NORMALIZE_MAP: Dict[str, str] = {
    # canonical -> canonical
    'boat': 'boat',
    'bow': 'bow',
    'bridge': 'bridge',
    'camel': 'camel',
    'cat': 'cat',
    'chair': 'chair',
    'cobra': 'cobra',
    'corpse': 'corpse',
    'crane': 'crane',
    'dancer': 'dancer',
    'diamond': 'diamond',
    'downward_facing_dog': 'downward_facing_dog',
    'eagle': 'eagle',
    'garland': 'garland',
    'goddess': 'goddess',
    'half_moon': 'half_moon',
    'lotus': 'lotus',
    'plank': 'plank',
    'plow': 'plow',
    'seated_forward_fold': 'seated_forward_fold',
    'side_plank': 'side_plank',
    'staff': 'staff',
    'standing_forward_bend': 'standing_forward_bend',
    'tree': 'tree',
    'triangle': 'triangle',
    'upward_salute': 'upward_salute',
    'warrior_i': 'warrior_i',
    'warrior_ii': 'warrior_ii',
    'warrior_iii': 'warrior_iii',
    'wheel': 'wheel',
    # common variants
    'downward-facing dog': 'downward_facing_dog',
    'downward facing dog': 'downward_facing_dog',
    'downward_dog': 'downward_facing_dog',
    'vrksasana': 'tree', 'vrikshasana': 'tree',
    'uttanasana': 'standing_forward_bend',
    'paschimottanasana': 'seated_forward_fold',
    'urdhva hastasana': 'upward_salute', 'upward salute': 'upward_salute',
    'virabhadrasana i': 'warrior_i', 'warrior i': 'warrior_i',
    'virabhadrasana ii': 'warrior_ii', 'warrior ii': 'warrior_ii',
    'virabhadrasana iii': 'warrior_iii', 'warrior iii': 'warrior_iii',
}


def normalize_pose_name(name: Optional[str]) -> Optional[str]:
    if not name:
        return None
    key = name.strip().lower().replace('-', ' ').replace('_', ' ')
    key = ' '.join(key.split())  # collapse spaces
    # try direct
    if key in NORMALIZE_MAP:
        return NORMALIZE_MAP[key]
    # try join with underscore for canonical
    underscore = key.replace(' ', '_')
    return NORMALIZE_MAP.get(underscore, underscore)

def suggest_corrections(keypoints: List[Dict], target_pose: Optional[str]) -> Tuple[List[str], Dict[str, Optional[float]]]:
    """Generate suggestions and return (suggestions, joint_angles)."""
    kp = _keypoints_by_name(keypoints)
    angles = compute_joint_angles(keypoints)
    suggestions: List[str] = []

    # Profile-driven suggestions
    pose_key = normalize_pose_name(target_pose) or ''
    profile = TARGET_ANGLE_PROFILES.get(pose_key)
    if profile:
        suggestions.extend(compare_angles_to_profile(angles, profile))

    # Additional pose-specific heuristics
    if pose_key == 'tree':
        la = kp.get('left_ankle'); ra = kp.get('right_ankle')
        lk = kp.get('left_knee'); rk = kp.get('right_knee')
        if la and ra and lk and rk:
            lifted = 'left' if la['y'] < ra['y'] else 'right'
            standing = 'right' if lifted == 'left' else 'left'
            lifted_ankle = la if lifted == 'left' else ra
            standing_knee = lk if standing == 'left' else rk
            margin = 0.03
            if lifted_ankle['y'] > (standing_knee['y'] - margin):
                suggestions.append(f"Raise your {lifted} leg higher")

    # Deduplicate suggestions
    suggestions = list(dict.fromkeys(suggestions))
    return suggestions, angles
