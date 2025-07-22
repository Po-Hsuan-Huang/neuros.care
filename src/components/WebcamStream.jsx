// Import necessary libraries from React and other packages.
// React is the core library for building the user interface.
// useEffect is a React Hook that lets you perform side effects in function components (like data fetching, subscriptions, or manually changing the DOM).
// useRef is a React Hook that lets you reference a value that's not needed for rendering. Here, it's used to get direct access to the <video> and <canvas> DOM elements.
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

// Import the Box component from Material-UI for easy styling and layout.
import { Box } from '@mui/material';

// Import the pose-detection library from TensorFlow.js, which allows us to detect human poses in images and videos.
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl'; // Import the WebGL backend for better performance

// Define a React functional component called WebcamStream.
// It takes a prop called `onPoseDetected`, which is a function that will be called whenever a new pose is detected.
const WebcamStream = ({ onPoseDetected }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectorRef = useRef(null); // To store the pose detector instance
    const animationFrameIdRef = useRef(null); // To store the animation frame ID for cleanup
    const [isTensorflowReady, setIsTensorflowReady] = useState(false);
    const [isDetectorLoading, setIsDetectorLoading] = useState(true);
    const [error, setError] = useState(null);
  
  // The `useEffect` Hook runs after the component mounts (is added to the screen).
  // It's used here to set up the webcam, initialize the pose detector, and start the pose detection loop.
  useEffect(() => {
    // Declare variables to hold the pose detector and the animation frame ID.
    let detector;
    let animationFrame;

    // 1. Initialize TensorFlow.js and the Pose Detector
    const initializeDetector = async () => {
      // Skip initialization if detector already exists
      if (detectorRef.current) {
        console.log('Detector already initialized, skipping...');
        return;
      }
    
      setIsDetectorLoading(true);
      setError(null);
    
      try {
        await initializeTensorFlow();
        await createPoseDetector();
      } catch (err) {
        console.error('Detector initialization failed:', err);
        setError('Failed to load pose detection. Please check your console.');
      } finally {
        setIsDetectorLoading(false);
      }
    };
    
    const initializeTensorFlow = async () => {
        try {
          // Explicitly set WebGL backend first
          await tf.setBackend('webgl');
          await tf.ready();
          setIsTensorflowReady(true);
          console.log('TensorFlow.js ready with WebGL!');
        } catch (err) {
          console.error('TensorFlow initialization failed:', err);
          throw err;
        }
      };
    
    const createPoseDetector = async () => {
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };

      console.log('Creating pose detector...');
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      detectorRef.current = detector;
      console.log('Pose detector created!');
    };

    // This asynchronous function sets up the user's webcam.
    const setupWebcam = async () => {
      try {
        // `navigator.mediaDevices.getUserMedia` prompts the user for permission to use their camera.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, // We want video
          audio: false, // We don't need audio
        });
        // If the `videoRef` is attached to the <video> element, set its `srcObject` to the webcam stream to display the feed.
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for the video to start playing before detecting poses.
          videoRef.current.onloadedmetadata = () => {
            // Set the canvas dimensions to match the video dimensions.
            if (canvasRef.current && videoRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
            }
            detectPose(); // Start detecting poses once the video is ready.
          };
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
      }
    };

    // This asynchronous function continuously detects poses from the webcam feed.
    const detectPose = async () => {
      // Ensure the detector is loaded and the video element is available before proceeding.
      if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 3) {
          animationFrame = requestAnimationFrame(detectPose);
          return;
      };

      // `estimatePoses` is the core function from the TensorFlow.js model that analyzes the current video frame and returns an array of detected poses.
      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      console.log('Detected poses:', poses.keypoints);
      // If at least one pose is detected...
      if (poses.length > 0) {
        // Call the `onPoseDetected` function that was passed in as a prop, sending the first detected pose's data to the parent component.
        onPoseDetected(poses[0]);
        // Draw the detected pose on the canvas to provide visual feedback.
        drawPose(poses[0]);
      }else{
        console.log('No pose detected');
      }

      // `requestAnimationFrame` tells the browser to run `detectPose` again before the next repaint. This creates a smooth, continuous loop for real-time detection without performance issues.
      animationFrame = requestAnimationFrame(detectPose);
    };

    const SKELETON = [
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear'],
      ['nose', 'left_shoulder'],
      ['nose', 'right_shoulder'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'],
      ['right_knee', 'right_ankle']
    ];
    
    const drawPose = (pose) => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
      // Draw keypoints (landmarks)
      for (const keypoint of pose.keypoints) {
        if (keypoint.score > 0.5) {
          ctx.beginPath();
          ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      }
    
      // Map keypoint names for easy access
      const keypointsMap = {};
      for (const kp of pose.keypoints) {
        keypointsMap[kp.name] = kp;
      }
    
      // Draw skeleton lines
      for (const [from, to] of SKELETON) {
        const kp1 = keypointsMap[from];
        const kp2 = keypointsMap[to];
        if (kp1 && kp2 && kp1.score > 0.5 && kp2.score > 0.5) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.strokeStyle = 'lime';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    };
    
    // Call the setup functions when the component mounts.
    initializeDetector();
    setupWebcam();

    // This is the cleanup function. It runs when the component unmounts (is removed from the screen).
    // It's crucial for stopping the animation loop to prevent memory leaks and unnecessary processing.
    return () => {
      cancelAnimationFrame(animationFrame);
      // You might also want to stop the webcam stream here.
      if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
      }
    };
  }, [onPoseDetected]); // The dependency array for the useEffect hook.

  // The JSX returned by the component. This is what gets rendered to the screen.
  return (
    // The Box component acts as a container. `position: 'relative'` is important so the canvas can be positioned absolutely within it.
    <Box sx={{ position: 'relative', width: '640px', height: '480px' }}>
      <video
        ref={videoRef} // Attach the ref to the video element.
        autoPlay // The video will start playing as soon as it can.
        playsInline // Important for playback on mobile browsers.
        muted // Mute the video to allow autoplay in most browsers.
        style={{ width: '100%', height: '100%' }}
      />
      <canvas
        ref={canvasRef} // Attach the ref to the canvas element.
        style={{
          position: 'absolute', // Position the canvas directly on top of the video.
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

// Export the component so it can be used in other parts of the application.
export default WebcamStream;