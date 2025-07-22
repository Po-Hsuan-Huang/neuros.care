import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import WebcamStream from '../components/WebcamStream';
import FeedbackPanel from '../components/FeedbackPanel';
import PoseGuide from '../components/PoseGuide';

const YogaSession = () => {
  const [feedback, setFeedback] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [selectedPose, setSelectedPose] = useState('Tree Pose');

  const handlePoseChange = (event) => {
    setSelectedPose(event.target.value);
  };

  const handleBufferFull = (data) => {
    setPoseData(data);
    sendPoseDataToServer(data);
  };

  const sendPoseDataToServer = async (poseData) => {
    const res = await fetch('http://localhost:5000/api/classify-pose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({         
        keypoints: poseData.keypoints, // Extract keypoints from poseData
        targetPose: selectedPose })
    });

    const result = await res.json();
    setFeedback(result);
    return result;
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
            <MenuItem value="Half Moon Pose">Half Moon Pose (Ardha Chandrasana)</MenuItem>
            <MenuItem value="Bound Angle / Butterfly Pose">Bound Angle / Butterfly Pose (Baddha Konasana)</MenuItem>
            <MenuItem value="Downward-Facing Dog">Downward-Facing Dog (Adho Mukha Svanasana)</MenuItem>
            <MenuItem value="Dancer's Pose">Dancer's Pose (Natarajasana)</MenuItem>
            <MenuItem value="Triangle Pose">Triangle Pose (Trikonasana)</MenuItem>
            <MenuItem value="Goddess Pose">Goddess Pose (Utkata Konasana)</MenuItem>
            <MenuItem value="Warrior Pose">Warrior Pose (Veerabhadrasana)</MenuItem>
            <MenuItem value="Tree Pose">Tree Pose (Vrikshasana)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper elevation={3}>
          <WebcamStream onBufferFull={handleBufferFull} />
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