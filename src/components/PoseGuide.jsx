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
// PoseGuide.jsx
// Add this at the top of your file after the imports

const POSES = {
  mountain: {
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
  },
  warrior: {
    name: "Warrior I Pose (Virabhadrasana I)",
    difficulty: "Intermediate",
    duration: "30-60 seconds per side",
    benefits: [
      "Strengthens legs and core",
      "Opens hip flexors",
      "Improves balance and stability",
      "Stretches chest and shoulders"
    ],
    steps: [
      "Start in Mountain Pose",
      "Step one foot back about 3-4 feet",
      "Bend front knee to 90 degrees",
      "Square hips to front of mat",
      "Raise arms overhead, palms facing each other"
    ],
    modifications: [
      "Keep back heel lifted if needed",
      "Lower arms to shoulder height",
      "Use wall for support"
    ],
    contraindications: [
      "Hip or knee injuries",
      "High blood pressure",
      "Heart problems"
    ],
  },
  tree: {
    name: "Tree Pose (Vrksasana)",
    difficulty: "Beginner-Intermediate",
    duration: "30-60 seconds per side",
    benefits: [
      "Improves balance",
      "Strengthens legs and core",
      "Increases focus and concentration",
      "Opens hips"
    ],
    steps: [
      "Start in Mountain Pose",
      "Shift weight to one foot",
      "Place other foot on inner thigh or calf",
      "Bring hands to heart center",
      "Optional: Raise arms overhead like branches"
    ],
    modifications: [
      "Place foot on ankle instead of thigh",
      "Use wall for balance",
      "Keep hands at heart center"
    ],
    contraindications: [
      "Balance disorders",
      "Ankle or knee injuries",
      "High blood pressure (when arms raised)"
    ],
  },
};


const PoseGuide = ({ pose }) => {
  const [activeStep, setActiveStep] = useState(0);
  
  // Use the selected pose or default to mountain pose
  const currentPose = POSES[pose] || POSES.mountain;

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
