// Import necessary tools from the React library.
// - `React`: The main library for building user interfaces.
// - `useEffect`: A hook to perform side effects (like data fetching) after the component renders.
// - `useRef`: A hook to create a reference to a DOM element.
// - `useState`: A hook to add state variables to a functional component.
import React, { useEffect, useRef, useState } from 'react';

// Import UI components from Material-UI (MUI) for styling.
// - `Box`: A general-purpose container component.
// - `Paper`: A component that creates a paper-like surface.
// - `Grid`: A component for creating responsive layouts.
// - `Typography`: A component for displaying text.
import { Box, Paper, Grid, Typography } from '@mui/material';

// Import custom components created for this application.
// - `WebcamStream`: The component that handles the webcam feed and pose detection.
// - `FeedbackPanel`: The component that displays feedback to the user.
// - `PoseGuide`: The component that shows the target yoga pose.
import WebcamStream from '../components/WebcamStream';
import FeedbackPanel from '../components/FeedbackPanel';
import PoseGuide from '../components/PoseGuide';

// Define the `YogaSession` component, which is the main screen for the yoga practice.
const YogaSession = () => {
  // Create a state variable `feedback` to store the feedback received from the backend.
  // `setFeedback` is the function used to update this state. It starts as `null`.
  const [feedback, setFeedback] = useState(null);

  // Create a state variable `poseData` to hold the raw pose information detected by the webcam.
  // `setPoseData` is the function to update it. It also starts as `null`.
  const [poseData, setPoseData] = useState(null);

  // This function is a callback that gets passed down to the `WebcamStream` component.
  // It's called every time `WebcamStream` detects a new pose.
  const handlePoseDetected = (data) => {
    // Update the `poseData` state with the new pose information.
    setPoseData(data);
    // Send this new pose data to the backend server for analysis.
    sendPoseDataToBackend(data);
  };

  // This asynchronous function sends the detected pose data to a backend API endpoint.
  const sendPoseDataToBackend = async (data) => {
    try {
      // Use the `fetch` API to send a POST request to `/api/analyze-pose`.
      const response = await fetch('http://localhost:3001/api/analyze-pose', {
        method: 'POST', // Specify the HTTP method.
        headers: {
          'Content-Type': 'application/json', // Tell the server we're sending JSON data.
        },
        body: JSON.stringify(data), // Convert the JavaScript pose data object into a JSON string.
      });
      // Wait for the server's response and parse it as JSON. This will contain the feedback.
      const feedbackData = await response.json();
      // Update the `feedback` state with the data received from the backend.
      setFeedback(feedbackData);
    } catch (error) {
      // If there's an error during the fetch request (e.g., network issue), log it to the console.
      console.error('Error analyzing pose:', error);
    }
  };

  // The return statement describes the component's UI using JSX.
  return (
    // Use a `Grid` container to structure the layout. `spacing={3}` adds space between grid items.
    <Grid container spacing={3}>
      {/* First grid item. It takes up 12 columns on small screens (`xs`) and 8 on medium screens (`md`) and up. */}
      <Grid item xs={12} md={8}>
        {/* `Paper` component adds a slight shadow and background, making the webcam feed stand out. */}
        <Paper elevation={3}>
          {/* Render the `WebcamStream` component. */}
          {/* Pass the `handlePoseDetected` function as a prop called `onPoseDetected`. */}
          {/* This allows `WebcamStream` to send data back up to this parent component. */}
          <WebcamStream onPoseDetected={handlePoseDetected} />
        </Paper>
      </Grid>
      {/* Second grid item. It takes up 12 columns on small screens and 4 on medium screens and up. */}
      <Grid item xs={12} md={4}>
        {/* `Box` is used to group the guide and feedback panels vertically. */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Render the `PoseGuide` component. */}
          {/* Pass the current pose name from the `poseData` state. The `?.` is optional chaining to prevent errors if `poseData` is null. */}
          <PoseGuide pose={poseData?.currentPose} />
          {/* Render the `FeedbackPanel` component. */}
          {/* Pass the `feedback` state to it so it can display the latest feedback. */}
          <FeedbackPanel feedback={feedback} />
        </Box>
      </Grid>
    </Grid>
  );
};

// Export the `YogaSession` component so it can be used in other parts of the application.
export default YogaSession;