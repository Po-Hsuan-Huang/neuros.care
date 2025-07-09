import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as poseDetection from '@tensorflow-models/pose-detection';

const WebcamStream = ({ onPoseDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let detector;
    let animationFrame;

    const initializeDetector = async () => {
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );
    };

    const setupWebcam = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      videoRef.current.srcObject = stream;
    };

    const detectPose = async () => {
      if (!detector || !videoRef.current) return;

      const poses = await detector.estimatePoses(videoRef.current);
      if (poses.length > 0) {
        onPoseDetected(poses[0]);
        drawPose(poses[0]);
      }

      animationFrame = requestAnimationFrame(detectPose);
    };

    const drawPose = (pose) => {
      const ctx = canvasRef.current.getContext('2d');
      // Draw skeleton and keypoints
      // Implementation details...
    };

    initializeDetector();
    setupWebcam();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onPoseDetected]);

  return (
    <Box sx={{ position: 'relative' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: 'auto' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  );
};

export default WebcamStream;
