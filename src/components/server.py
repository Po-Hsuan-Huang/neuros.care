from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tflite_runtime.interpreter as tflite

app = Flask(__name__)
CORS(app)

# Load the pose classifier model
interpreter = tflite.Interpreter(model_path="pose_classifier_30.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Class names mapping (adjust based on your actual classes)
CLASS_NAMES = {
    0: "boat",
    1: "tree", 
    2: "warrior",
    3: "downward_dog",
    4: "mountain",
    # Add your actual class mappings here
}

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

@app.route("/classify_pose", methods=["POST"])
def classify_pose():
    try:
        data = request.get_json()
        
        if "keypoints" not in data:
            return jsonify({"error": "No keypoints data provided"}), 400
        
        # Convert TF.js keypoints format to model input format
        landmarks = convert_pose_landmarks_to_array(data["keypoints"])
        landmarks_array = np.array(landmarks, dtype=np.float32)
        
        # Reshape according to model input requirements
        landmarks_array = landmarks_array.reshape(input_details[0]['shape'])
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], landmarks_array)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        # Get predicted class
        class_no = int(np.argmax(output_data[0]))
        confidence = float(np.max(output_data[0])) * 100  # Convert to percentage
        class_name = CLASS_NAMES.get(class_no, f"unknown_pose_{class_no}")
        
        # Create feedback message
        if confidence > 80:
            message = f"Great! You're doing the {class_name} pose!"
        elif confidence > 60:
            message = f"Good attempt at {class_name} pose. Try to hold it steady."
        else:
            message = f"Detected: {class_name} pose, but try to improve your form."
        
        result = {
            "class_no": class_no,
            "class_name": class_name,
            "confidence": round(confidence, 1),
            "message": message,
            "raw_predictions": output_data[0].tolist()
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": True})

if __name__ == "__main__":
    app.run(debug=True, port=5000)