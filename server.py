from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
tflite = tf.lite
app = Flask(__name__)
CORS(app)

# Load the pose classifier model
interpreter = tflite.Interpreter(model_path="src/components/pose_classifier_30.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Class names mapping (adjust based on your actual classes)
CLASS_NAMES = {
    0:  "Boat Pose (Navasana)",
    1:  "Bow Pose (Dhanurasana)",
    2:  "Bridge Pose (Setu Bandhasana)",
    3:  "Camel Pose (Ustrasana)",
    4:  "Cat Pose (Marjaryasana)",
    5:  "Chair Pose (Utkatasana)",
    6:  "Cobra Pose (Bhujangasana)",
    7:  "Corpse Pose (Savasana)",
    8:  "Crane Pose (Bakasana)",
    9:  "Dancer's Pose (Natarajasana)",
    10: "Diamond Pose (Vajrasana)",
    11: "Downward-Facing Dog (Adho Mukha Svanasana)",
    12: "Eagle Pose (Garudasana)",
    13: "Garland Pose (Malasana)",
    14: "Goddess Pose (Utkata Konasana)",
    15: "Half Moon Pose (Ardha Chandrasana)",
    16: "Lotus Pose (Padmasana)",
    17: "Plank Pose (Phalakasana)",
    18: "Plow Pose (Halasana)",
    19: "Seated Forward Fold (Paschimottanasana)",
    20: "Side Plank Pose (Vasisthasana)",
    21: "Staff Pose (Dandasana)",
    22: "Standing Forward Bend (Uttanasana)",
    23: "Tree Pose (Vrikshasana)",
    24: "Triangle Pose (Trikonasana)",
    25: "Upward Salute (Urdhva Hastasana)",
    26: "Warrior I Pose (Virabhadrasana I)",
    27: "Warrior II Pose (Virabhadrasana II)",
    28: "Warrior III Pose (Virabhadrasana III)",
    29: "Wheel Pose (Chakrasana)"
}




class PredictionError(Exception):
    """Custom exception for pose prediction mismatches"""
    pass

def get_confidence_feedback_message(confidence, class_name):
    """Generate feedback message based on confidence score"""
    if confidence >= 90:
        return f"Excellent! Perfect {class_name} pose detected!"
    elif confidence >= 80:
        return f"Great job! You're doing the {class_name} pose very well!"
    elif confidence >= 70:
        return f"Good {class_name} pose! Try to hold it steady for better stability."
    elif confidence >= 60:
        return f"{class_name.title()} pose detected. Focus on proper alignment and form."
    elif confidence >= 50:
        return f"Attempting {class_name} pose. Adjust your position for better detection."
    elif confidence >= 40:
        return f"Weak {class_name} pose detection. Check your form and hold the pose longer."
    else:
        return "Low confidence detection. Ensure you're clearly visible and holding a distinct yoga pose."

def convert_pose_landmarks_to_array(keypoints):
    """
    Convert TensorFlow.js pose detection keypoints to the format expected by your model
    TF.js gives: [{x, y, score}, {x, y, score}, ...]
    Model expects: [x1, y1, score1, x2, y2, score2, ...]
    """
    landmarks = []
    
    # Define the order of keypoints (COCO format used by TF.js pose detection)
    # This should match the order in your CSV training data
    keypoint_order = [
        'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
        'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
        'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
        'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ]
    
    # Convert keypoints array to flat array
    for keypoint in keypoints:
        landmarks.extend([keypoint['x'], keypoint['y'], keypoint['score']])
    
    return landmarks



@app.route("/api/classify-pose", methods=["POST"])
def classify_pose():
    try:
        data = request.get_json()
        keypoints = data.get('pose', {}).get('keypoints')
        target_pose = data.get('targetPose')
        timestamp = data.get('timestamp')
        
        if "keypoints" not in data:
            return jsonify({
                "error": "No keypoints data provided",
                "message": "Unable to analyze pose. Please ensure your camera is working.",
                "confidence": 0
            }), 400
        
        # Convert TF.js keypoints format to model input format
        landmarks = convert_pose_landmarks_to_array(keypoints)
        landmarks_array = np.array(landmarks, dtype=np.float32)
        print("LANDMARKS:", landmarks)

        # Reshape according to model input requirements
        landmarks_array = landmarks_array.reshape(input_details[0]['shape'])
        print("LANDMARKS ARRAY:", landmarks_array)

        # Run inference
        interpreter.set_tensor(input_details[0]['index'], landmarks_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        print("OUPTUT DATA:", output_data)  
        # Get predicted class and confidence
        class_no = int(np.argmax(output_data[0]))
        confidence = float(np.max(output_data[0])) * 100  # Convert to percentage
        class_name = CLASS_NAMES.get(class_no, f"unknown_pose_{class_no}")
        print("CLASS NAME:", class_name)
        # Check if predicted pose matches target pose
        if class_name.lower() != target_pose.lower():
            raise PredictionError(f"Predicted pose '{class_name}' does not match target pose '{target_pose}'")
        
        # Generate confidence-based feedback message
        message = get_confidence_feedback_message(confidence, class_name)
        
        # Additional feedback based on confidence thresholds
        feedback_level = "excellent" if confidence >= 90 else \
                        "great" if confidence >= 80 else \
                        "good" if confidence >= 70 else \
                        "fair" if confidence >= 60 else \
                        "needs_improvement"
        
        result = {
            "class_no": class_no,
            "class_name": class_name,
            "confidence": round(confidence, 1),
            "message": message,
            "feedback_level": feedback_level,
            "raw_predictions": output_data[0].tolist()
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "error": str(e),
            "message": "Error analyzing pose. Please try again.",
            "confidence": 0
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": True})

if __name__ == "__main__":
    app.run(debug=True, port=5000)