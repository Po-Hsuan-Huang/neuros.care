import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const PoseDetectionComponent = ({ onFeedbackUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Throttle classification requests to avoid overwhelming the server
  const [lastClassificationTime, setLastClassificationTime] = useState(0);
  const CLASSIFICATION_INTERVAL = 1000; // 1 second

  // Initialize pose detector
  useEffect(() => {
    const initializeDetector = async () => {
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      };
      const detector = await poseDetection.createDetector(model, detectorConfig);
      setDetector(detector);
    };
    
    initializeDetector();
  }, []);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    startCamera();
    
    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Send keypoints to classification server
  const classifyPose = useCallback(async (keypoints) => {
    try {
      const response = await fetch('http://localhost:5000/classify_pose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keypoints }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update feedback panel
      onFeedbackUpdate({
        message: result.message,
        confidence: result.confidence,
        class_name: result.class_name,
        class_no: result.class_no
      });
      
    } catch (error) {
      console.error('Classification error:', error);
      onFeedbackUpdate({
        message: 'Unable to analyze pose. Please try again.',
        confidence: 0
      });
    }
  }, [onFeedbackUpdate]);

  // Main pose detection loop
  const detectPoses = useCallback(async () => {
    if (!detector || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const poses = await detector.estimatePoses(video);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (poses.length > 0) {
      const pose = poses[0];
      
      // Draw pose keypoints and skeleton
      drawPose(ctx, pose);
      
      // Classify pose (throttled)
      const now = Date.now();
      if (now - lastClassificationTime > CLASSIFICATION_INTERVAL) {
        // Filter keypoints with good confidence
        const goodKeypoints = pose.keypoints.filter(kp => kp.score > 0.3);
        
        if (goodKeypoints.length >= 10) { // Need enough keypoints for classification
          classifyPose(pose.keypoints);
          setLastClassificationTime(now);
        } else {
          onFeedbackUpdate({
            message: 'Please move closer to the camera or improve lighting.',
            confidence: 0
          });
        }
      }
    } else {
      onFeedbackUpdate({
        message: 'No pose detected. Please step into the camera view.',
        confidence: 0
      });
    }
    
    if (isDetecting) {
      requestAnimationFrame(detectPoses);
    }
  }, [detector, isDetecting, lastClassificationTime, classifyPose, onFeedbackUpdate]);

  // Draw pose on canvas
  const drawPose = (ctx, pose) => {
    const keypoints = pose.keypoints;
    
    // Draw keypoints
    keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = keypoint.score > 0.6 ? '#00FF00' : '#FFFF00';
        ctx.fill();
      }
    });
    
    // Draw skeleton connections
    const connections = [
      ['nose', 'left_eye'], ['nose', 'right_eye'],
      ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
    ];
    
    connections.forEach(([from, to]) => {
      const fromKp = keypoints.find(kp => kp.name === from);
      const toKp = keypoints.find(kp => kp.name === to);
      
      if (fromKp?.score > 0.3 && toKp?.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(fromKp.x, fromKp.y);
        ctx.lineTo(toKp.x, toKp.y);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  // Start/stop detection
  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  // Start detection when detector is ready
  useEffect(() => {
    if (detector && isDetecting) {
      detectPoses();
    }
  }, [detector, isDetecting, detectPoses]);

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{ width: '100%', maxWidth: '640px' }}
        onLoadedMetadata={() => setIsDetecting(true)}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          maxWidth: '640px',
          pointerEvents: 'none'
        }}
      />
      <button 
        onClick={toggleDetection}
        style={{ marginTop: '10px' }}
      >
        {isDetecting ? 'Stop Detection' : 'Start Detection'}
      </button>
    </div>
  );
};

// Main component that uses both pose detection and feedback panel
const PoseAnalysisApp = () => {
  const [feedback, setFeedback] = useState(null);
  
  const handleFeedbackUpdate = (newFeedback) => {
    setFeedback(newFeedback);
  };
  
  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 1 }}>
        <h2>Pose Detection</h2>
        <PoseDetectionComponent onFeedbackUpdate={handleFeedbackUpdate} />
      </div>
      <div style={{ width: '300px' }}>
        <FeedbackPanel feedback={feedback} />
      </div>
    </div>
  );
};

export default PoseAnalysisApp;