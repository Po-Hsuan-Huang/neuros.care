import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import WebcamStream from '../components/WebcamStream';
import FeedbackPanel from '../components/FeedbackPanel';
import PoseGuide from '../components/PoseGuide';

const YogaSession = () => {
  const [feedback, setFeedback] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [selectedPose, setSelectedPose] = useState('mountain');

  const handlePoseChange = (event) => {
    setSelectedPose(event.target.value);
  };

  const handlePoseDetected = (data) => {
    setPoseData(data);
    sendPoseDataToBackend(data);
  };

  const sendPoseDataToBackend = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/api/analyze-pose', {
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
      <Grid item xs={12}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Pose</InputLabel>
          <Select
            value={selectedPose}
            label="Select Pose"
            onChange={handlePoseChange}
          >
            <MenuItem value="mountain">Lesson 1: Mountain Pose (Tadasana)</MenuItem>
            <MenuItem value="warrior">Lesson 2: Warrior I Pose (Virabhadrasana I)</MenuItem>
            <MenuItem value="tree">Lesson 3: Tree Pose (Vrksasana)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper elevation={3}>
          <WebcamStream onPoseDetected={handlePoseDetected} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PoseGuide pose={selectedPose} />
          <FeedbackPanel feedback={feedback} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default YogaSession;