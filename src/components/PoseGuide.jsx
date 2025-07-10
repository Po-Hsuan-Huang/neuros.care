import React, { useState } from 'react';
import {
  Card,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
} from '@mui/material';
import {
  AccessibilityNew,
  Warning,
  Timer,
  FitnessCenter,
  Favorite,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';

const PoseGuide = ({ pose }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Example pose data structure (would typically come from props)
  const defaultPose = {
    name: "Mountain Pose (Tadasana)",
    difficulty: "Beginner",
    duration: "1-5 minutes",
    benefits: [
      "Improves posture",
      "Strengthens thighs, knees, and ankles",
      "Increases body awareness",
    ],
    steps: [
      "Stand with feet hip-width apart",
      "Ground through all four corners of your feet",
      "Engage your thighs and draw your belly in",
      "Relax your shoulders and arms",
      "Breathe deeply and maintain awareness",
    ],
    modifications: [
      "Use a wall for balance support",
      "Practice seated if standing is challenging",
    ],
    contraindications: [
      "Recent head injury",
      "Low blood pressure",
    ],
  };

  const currentPose = pose || defaultPose;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card sx={{ mb: 4, p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {currentPose.name}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            icon={<FitnessCenter />}
            label={currentPose.difficulty}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Timer />}
            label={currentPose.duration}
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* Benefits Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Favorite color="secondary" />
            Benefits
          </Typography>
          <List>
            {currentPose.benefits.map((benefit, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <AccessibilityNew color="primary" />
                </ListItemIcon>
                <ListItemText primary={benefit} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Step-by-Step Guide */}
        <Stepper activeStep={activeStep} orientation="vertical">
          {currentPose.steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>
                <Typography variant="subtitle1">Step {index + 1}</Typography>
              </StepLabel>
              <StepContent>
                <Typography>{step}</Typography>
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    endIcon={<ArrowForward />}
                  >
                    {index === currentPose.steps.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                    startIcon={<ArrowBack />}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === currentPose.steps.length && (
          <Paper square elevation={0} sx={{ p: 3, mt: 3, borderRadius: 1 }}>
            <Typography>All steps completed!</Typography>
            <Button onClick={handleReset} sx={{ mt: 1 }}>
              Reset Guide
            </Button>
          </Paper>
        )}

        {/* Modifications Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Modifications & Accessibility
          </Typography>
          <List>
            {currentPose.modifications.map((mod, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <AccessibilityNew color="secondary" />
                </ListItemIcon>
                <ListItemText primary={mod} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Contraindications Warning */}
        {currentPose.contraindications.length > 0 && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Please consult your healthcare provider if you have:
            </Typography>
            <List dense>
              {currentPose.contraindications.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}
      </Card>
    </Box>
  );
};

export default PoseGuide;
