from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tflite_runtime.interpreter as tflite
import cv2
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

# Load the MoveNet model for pose detection
movenet_interpreter = tflite.Interpreter(model_path="movenet_thunder.tflite")
movenet_interpreter.allocate_tensors()

movenet_input_details = movenet_interpreter.get_input_details()
movenet_output_details = movenet_interpreter.get_output_details()

# Load the pose classifier model
classifier_interpreter = tflite.Interpreter(model_path="pose_classifier_30.tflite")
classifier_interpreter.allocate_tensors()

classifier_input_details = classifier_interpreter.get_input_details()
classifier_output_details = classifier_interpreter.get_output_details()

# Class names mapping (you'll need to adjust this based on your actual classes)
CLASS_NAMES = {
    0: "boat",
    1: "tree",
    2: "warrior",
    # Add more class mappings as needed
}

def preprocess_image(image_data):
    """Preprocess image for MoveNet input"""
    # Decode base64 image if it's in base64 format
    if isinstance(image_data, str):
        image_data = base64.b64decode(image_data)
    
    # Convert to PIL Image
    image = Image.open(BytesIO(image_data))
    image = image.convert('RGB')
    
    # Resize to MoveNet input size (usually 256x256 for Thunder)
    input_size = movenet_input_details[0]['shape'][1:3]  # Get height, width
    image = image.resize((input_size[1], input_size[0]))  # PIL uses (width, height)
    
    # Convert to numpy array and normalize
    image_array = np.array(image, dtype=np.float32)
    image_array = image_array / 255.0  # Normalize to [0,1]
    
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    
    return image_array

def extract_keypoints(image_array):
    """Extract keypoints using MoveNet"""
    # Set input tensor
    movenet_interpreter.set_tensor(movenet_input_details[0]['index'], image_array)
    
    # Run inference
    movenet_interpreter.invoke()
    
    # Get output
    keypoints = movenet_interpreter.get_tensor(movenet_output_details[0]['index'])
    
    # MoveNet output shape is usually [1, 1, 17, 3] where 17 is keypoints and 3 is [y, x, score]
    # Reshape to [17, 3] and reorder to [x, y, score]
    keypoints = keypoints[0][0]  # Remove batch and first dimension
    
    # MoveNet outputs [y, x, score], but we want [x, y, score]
    landmarks = []
    for keypoint in keypoints:
        y, x, score = keypoint
        landmarks.extend([x, y, score])
    
    return landmarks

def classify_pose(landmarks):
    """Classify pose using the trained classifier"""
    # Convert landmarks to numpy array
    landmarks_array = np.array(landmarks, dtype=np.float32)
    
    # Reshape according to model input requirements
    landmarks_array = landmarks_array.reshape(classifier_input_details[0]['shape'])
    
    # Set input tensor
    classifier_interpreter.set_tensor(classifier_input_details[0]['index'], landmarks_array)
    
    # Run inference
    classifier_interpreter.invoke()
    
    # Get output
    output_data = classifier_interpreter.get_tensor(classifier_output_details[0]['index'])
    
    # Get predicted class
    class_no = np.argmax(output_data[0])
    confidence = float(np.max(output_data[0]))
    class_name = CLASS_NAMES.get(class_no, f"class_{class_no}")
    
    return {
        "class_no": int(class_no),
        "class_name": class_name,
        "confidence": confidence,
        "raw_predictions": output_data[0].tolist()
    }

@app.route("/predict_from_image", methods=["POST"])
def predict_from_image():
    """Complete pipeline: image -> keypoints -> classification"""
    try:
        data = request.get_json()
        
        if "image" not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Stage 1: Extract keypoints from image
        image_array = preprocess_image(data["image"])
        landmarks = extract_keypoints(image_array)
        
        # Stage 2: Classify pose
        result = classify_pose(landmarks)
        
        # Include landmarks in response if requested
        if data.get("include_landmarks", False):
            result["landmarks"] = landmarks
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict_from_landmarks", methods=["POST"])
def predict_from_landmarks():
    """Stage 2 only: landmarks -> classification (your original endpoint)"""
    try:
        data = request.get_json()
        
        if "landmarks" not in data:
            return jsonify({"error": "No landmarks data provided"}), 400
        
        landmarks = data["landmarks"]
        result = classify_pose(landmarks)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/extract_keypoints", methods=["POST"])
def extract_keypoints_only():
    """Stage 1 only: image -> keypoints"""
    try:
        data = request.get_json()
        
        if "image" not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Extract keypoints from image
        image_array = preprocess_image(data["image"])
        landmarks = extract_keypoints(image_array)
        
        return jsonify({"landmarks": landmarks})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)