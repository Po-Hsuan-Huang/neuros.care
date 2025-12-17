import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Grid, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import WebcamStream from '../components/WebcamStream';
import FeedbackPanel from '../components/FeedbackPanel';
import PoseGuide from '../components/PoseGuide';
import PsychedelicSmoke from '../components/PsychedelicSmoke';
const API_BASE_URL = import.meta.env.VITE_API_URL;
const YogaSession = () => {
  const [feedback, setFeedback] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [selectedPose, setSelectedPose] = useState('Tree');
  const videoRef = useRef(null);

  const handlePoseChange = (event) => {
    setSelectedPose(event.target.value);
    setActive
  };

  const handleBufferFull = (buffer) => {
    const lastPoseData = buffer[buffer.length - 1];
    setPoseData(lastPoseData);
    sendPoseDataToServer(lastPoseData, selectedPose);
  };

  const sendPoseDataToServer = async (poseData, selectedPose) => {
    const res = await fetch(`${API_BASE_URL}/api/classify-pose`, {
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
    console.log('Result:', result);
    setFeedback(result);
    return result;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: 'background.default', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Main Video Area */}
        <Grid item xs={12} md={8} lg={9} sx={{ height: '100%', position: 'relative' }}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              overflow: 'hidden',
              bgcolor: 'black',
              position: 'relative'
            }}
          >
            {feedback?.confidenceLevel === 'excellent' && <PsychedelicSmoke />}

            <WebcamStream
              onBufferFull={handleBufferFull}
              videoRef={videoRef}
            />

            {/* Overlay smoke on top of video for immersive effect */}
            {feedback?.confidenceLevel === 'excellent' && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                opacity: 0.4,
                pointerEvents: 'none',
                mixBlendMode: 'screen'
              }}>
                <PsychedelicSmoke />
              </Box>
            )}

            {/* Overlay Feedback for immersive feel */}
            <Box sx={{ position: 'absolute', bottom: 24, left: 24, right: 24, maxWidth: 600, zIndex: 10 }}>
              <FeedbackPanel feedback={feedback} />
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar Control Area */}
        <Grid item xs={12} md={4} lg={3} sx={{ height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', pr: 1 }}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Select Pose</InputLabel>
                <Select
                  value={selectedPose}
                  label="Select Pose"
                  onChange={handlePoseChange}
                >
                  <MenuItem value="Half_Moon">Half Moon Pose</MenuItem>
                  <MenuItem value="Butterfly">Butterfly Pose</MenuItem>
                  <MenuItem value="Downward_Facing_Dog">Downward-Facing Dog</MenuItem>
                  <MenuItem value="Dancer">Dancer's Pose</MenuItem>
                  <MenuItem value="Triangle">Triangle Pose</MenuItem>
                  <MenuItem value="Goddess">Goddess Pose</MenuItem>
                  <MenuItem value="Warrior_II">Warrior II</MenuItem>
                  <MenuItem value="Tree">Tree Pose</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <PoseGuide selectedPose={selectedPose} videoRef={videoRef} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default YogaSession;