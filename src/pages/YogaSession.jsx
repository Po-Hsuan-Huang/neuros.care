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

  const handleBufferFull = (buffer) => {
    const lastPoseData = buffer[buffer.length - 1];
    setPoseData(lastPoseData);
    sendPoseDataToServer(lastPoseData, selectedPose);
  };

  const sendPoseDataToServer = async (poseData, selectedPose) => {
    const res = await fetch('https://07965c72490b.ngrok-free.app/api/classify-pose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({   
        timestamp: poseData.timestamp,
        pose: poseData.pose,
        targetPose: selectedPose
      })
    });
    if (!res.ok) {
      throw new Error('HTTP error! status: ${res.status}');
    }

    const result = await res.json();
    console.log('Result:',result);
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
            <MenuItem value="Half_Moon">Half Moon Pose (Ardha Chandrasana)</MenuItem>
            <MenuItem value="Butterfly">Bound Angle / Butterfly Pose (Baddha Konasana)</MenuItem>
            <MenuItem value="Downward_Facing_Dog">Downward-Facing Dog (Adho Mukha Svanasana)</MenuItem>
            <MenuItem value="Dancer">Dancer's Pose (Natarajasana)</MenuItem>
            <MenuItem value="Triangle">Triangle Pose (Trikonasana)</MenuItem>
            <MenuItem value="Goddess">Goddess Pose (Utkata Konasana)</MenuItem>
            <MenuItem value="Warrior_II">Warrior Pose II (Veerabhadrasana II)</MenuItem>
            <MenuItem value="Tree">Tree Pose (Vrikshasana)</MenuItem>

          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper elevation={3}>
          <WebcamStream onBufferFull={handleBufferFull} />
          <FeedbackPanel feedback={feedback} />

        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PoseGuide selectedPose={selectedPose}  />
        </Box>
      </Grid>
    </Grid>
  );
};

export default YogaSession;