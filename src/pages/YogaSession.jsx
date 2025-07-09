import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Grid, Typography } from '@mui/material';
import WebcamStream from '../components/WebcamStream';
import FeedbackPanel from '../components/FeedbackPanel';
import PoseGuide from '../components/PoseGuide';

const YogaSession = () => {
  const [feedback, setFeedback] = useState(null);
  const [poseData, setPoseData] = useState(null);

  const handlePoseDetected = (data) => {
    setPoseData(data);
    // Send pose data to backend for analysis
    sendPoseDataToBackend(data);
  };

  const sendPoseDataToBackend = async (data) => {
    try {
      const response = await fetch('/api/analyze-pose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const feedbackData = await response.json();
      setFeedback(feedbackData);
    } catch (error) {
      console.error('Error analyzing pose:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3}>
          <WebcamStream onPoseDetected={handlePoseDetected} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PoseGuide pose={poseData?.currentPose} />
          <FeedbackPanel feedback={feedback} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default YogaSession;
