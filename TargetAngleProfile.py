import os
import csv
import json
from typing import Dict, List, Tuple, Optional
import numpy as np

# COCO-like order used in your dataset headers (uppercase)
KEYPOINT_NAMES = [
    'NOSE', 'LEFT_EYE', 'RIGHT_EYE', 'LEFT_EAR', 'RIGHT_EAR',
    'LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_ELBOW', 'RIGHT_ELBOW',
    'LEFT_WRIST', 'RIGHT_WRIST', 'LEFT_HIP', 'RIGHT_HIP',
    'LEFT_KNEE', 'RIGHT_KNEE', 'LEFT_ANKLE', 'RIGHT_ANKLE'
]

# Joints and their angle definitions as (p1, p2, p3)
ANGLE_JOINTS: Dict[str, Tuple[str, str, str]] = {
    'left_elbow': ('LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST'),
    'right_elbow': ('RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'),
    'left_shoulder': ('LEFT_ELBOW', 'LEFT_SHOULDER', 'LEFT_HIP'),
    'right_shoulder': ('RIGHT_ELBOW', 'RIGHT_SHOULDER', 'RIGHT_HIP'),
    'left_hip': ('LEFT_SHOULDER', 'LEFT_HIP', 'LEFT_KNEE'),
    'right_hip': ('RIGHT_SHOULDER', 'RIGHT_HIP', 'RIGHT_KNEE'),
    'left_knee': ('LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE'),
    'right_knee': ('RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'),
}


def _angle_between(p1: Dict, p2: Dict, p3: Dict) -> Optional[float]:
    try:
        a = np.array([p1['x'] - p2['x'], p1['y'] - p2['y']], dtype=np.float32)
        b = np.array([p3['x'] - p2['x'], p3['y'] - p2['y']], dtype=np.float32)
        na = np.linalg.norm(a)
        nb = np.linalg.norm(b)
        if na == 0 or nb == 0:
            return None
        cosang = np.dot(a, b) / (na * nb)
        cosang = float(np.clip(cosang, -1.0, 1.0))
        ang = float(np.degrees(np.arccos(cosang)))
        return ang
    except Exception:
        return None


def _row_to_keypoints(row: Dict[str, str], score_threshold: float = 0.3) -> Dict[str, Dict]:
    kp: Dict[str, Dict] = {}
    for name in KEYPOINT_NAMES:
        try:
            x = float(row.get(f'{name}_x', 'nan'))
            y = float(row.get(f'{name}_y', 'nan'))
            s = float(row.get(f'{name}_score', '0'))
        except ValueError:
            x = y = np.nan
            s = 0.0
        if np.isfinite(x) and np.isfinite(y) and s >= score_threshold:
            kp[name] = {'x': x, 'y': y, 'score': s}
        else:
            kp[name] = None
    return kp


def _compute_angles_for_row(kp: Dict[str, Optional[Dict]]) -> Dict[str, Optional[float]]:
    angles: Dict[str, Optional[float]] = {}
    for joint, (p1, p2, p3) in ANGLE_JOINTS.items():
        a = kp.get(p1)
        b = kp.get(p2)
        c = kp.get(p3)
        if a and b and c:
            ang = _angle_between(a, b, c)
        else:
            ang = None
        angles[joint] = ang
    return angles


def compute_profiles(csv_path: str, p_low: float = 15.0, p_high: float = 85.0) -> Dict[str, Dict[str, Tuple[float, float]]]:
    """Compute percentile-based angle ranges per class from CSV.
    Returns dict: { class_key: { joint: (low, high), ... }, ... }
    class_key is normalized to PoseSuggestion's canonical keys (lower snake_case where applicable).
    """
    by_class: Dict[str, Dict[str, List[float]]] = {}

    def normalize_class_from_filename(fn: str, class_name: Optional[str]) -> str:
        # Prefer class_name if available, otherwise derive from path prefix
        if class_name:
            key = class_name.strip().lower().replace('-', ' ').replace('_', ' ')
            key = '_'.join(key.split())
            return key
        # e.g., "boat/boat_images_91.png" -> "boat"
        if '/' in fn:
            return fn.split('/', 1)[0].strip().lower().replace('-', '_')
        return fn.strip().lower().replace('-', '_')

    with open(csv_path, 'r', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fn = row.get('file_name', '')
            cls = normalize_class_from_filename(fn, row.get('class_name'))
            kp = _row_to_keypoints(row)
            angles = _compute_angles_for_row(kp)
            store = by_class.setdefault(cls, {j: [] for j in ANGLE_JOINTS.keys()})
            for j, val in angles.items():
                if val is not None and np.isfinite(val):
                    store[j].append(val)

    profiles: Dict[str, Dict[str, Tuple[float, float]]] = {}
    for cls, joint_vals in by_class.items():
        cls_profile: Dict[str, Tuple[float, float]] = {}
        for j, vals in joint_vals.items():
            if len(vals) >= 5:
                low = float(np.percentile(vals, p_low))
                high = float(np.percentile(vals, p_high))
                # sanity clamp to [0, 185]
                low = max(0.0, min(185.0, low))
                high = max(0.0, min(185.0, max(low, high)))
                cls_profile[j] = (round(low, 1), round(high, 1))
        if cls_profile:
            profiles[cls] = cls_profile

    return profiles


def save_profiles_to_json(profiles: Dict[str, Dict[str, Tuple[float, float]]], output_path: str) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(profiles, f, indent=2)


if __name__ == '__main__':
    # Default input/output paths
    csv_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__), '..', 'py_yoga_pose_classification', 'test_data.csv'
    ))
    out_json = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 'data', 'angle_profiles.json'
    ))

    print(f'Reading CSV: {csv_path}')
    profiles = compute_profiles(csv_path)
    print(f'Found classes: {len(profiles)}')
    print(f'Writing JSON: {out_json}')
    save_profiles_to_json(profiles, out_json)
    print('Done.')
