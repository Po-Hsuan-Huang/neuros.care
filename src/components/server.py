# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tflite_runtime.interpreter as tflite

app = Flask(__name__)
CORS(app)

# Load the TFLite model
interpreter = tflite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    landmarks = np.array(data["landmarks"], dtype=np.float32)

    # Reshape according to model input requirements
    landmarks = landmarks.reshape(input_details[0]['shape'])

    interpreter.set_tensor(input_details[0]['index'], landmarks)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])

    # Assuming classification model, return class label or score
    result = output_data.tolist()
    return jsonify({"result": result})

if __name__ == "__main__":
    app.run(port=5000)
