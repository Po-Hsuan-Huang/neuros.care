import React, { useState, useEffect, useRef } from 'react';
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

import{speakText} from './utils/speechUtils'
import{CountdownStep, CountdownBreathCycle} from './utils/countdownUtils.jsx'
import { useUser } from '../context/UserContext';
import { useSnapshotQueue } from './utils/useSnapshotQueue.jsx';
// PoseGuide.jsx
// Add this at the top of your file after the imports
const POSES = {
  Half_Moon : {
    name: "Half Moon Pose (Ardha Chandrasana)",
    difficulty: "Intermediate",
    duration: "3–8 breaths",
    benefits: [
      "Improves balance and coordination",
      "Strengthens ankles, legs, and glutes",
      "Opens chest and shoulders",
      "Engages core and spinal stabilizers"
    ],
    steps: [
      "From Triangle Pose, bend the front knee and place front-hand fingertips ~12\" ahead of the foot",
      "Shift weight into the front foot and hand; lift the back leg parallel to the floor",
      "Stack hips vertically; rotate chest open while extending top arm upward",
      "Engage standing leg and press through lifted heel",
      "Gaze forward, sideways, or up; maintain steady breath"
    ],
    modifications: [
      "Place bottom hand on a block for stability",
      "Keep gaze down for neck comfort",
      "Rest lifted foot lightly on a wall"
    ],
    contraindications: [
      "Unstable ankle or recent ankle sprain",
      "Severe balance disorders",
      "Low blood pressure (rise slowly)"
    ]
  },

  Butterfly: {
    name: "Bound Angle (Butterfly) Pose (Baddha Konasana)",
    difficulty: "Beginner",
    duration: "1–3 minutes",
    benefits: [
      "Opens hips and groins",
      "Improves circulation in pelvic region",
      "Encourages upright seated posture",
      "Calms the nervous system with forward fold variation"
    ],
    steps: [
      "Sit tall with legs extended, then bend knees and bring soles of feet together",
      "Let knees drop toward the floor; hold feet or ankles",
      "Lengthen spine upward, broadening collarbones",
      "Option: hinge forward from hips while keeping spine long",
      "Breathe evenly without forcing knees down"
    ],
    modifications: [
      "Sit on a folded blanket to ease lower back rounding",
      "Place yoga blocks or cushions under knees",
      "Use a strap looped around lower back and feet for support"
    ],
    contraindications: [
      "Acute groin or knee injury",
      "Recent pelvic surgery"
    ]
  },

  Downward_Facing_Dog: {
    name: "Downward-Facing Dog (Adho Mukha Svanasana)",
    difficulty: "Beginner–Intermediate",
    duration: "5–10 breaths",
    benefits: [
      "Lengthens hamstrings, calves, and spine",
      "Builds strength in shoulders and arms",
      "Energizes the body and improves circulation",
      "Can relieve mild back tension with proper alignment"
    ],
    steps: [
      "Start on hands and knees; wrists under shoulders, knees under hips",
      "Spread fingers; tuck toes and lift knees",
      "Press hips up and back, aiming for a long spine",
      "Gently straighten legs without locking knees",
      "Press heels toward (not necessarily to) the floor; relax neck"
    ],
    modifications: [
      "Keep knees bent to lengthen spine",
      "Use blocks under hands to reduce wrist pressure",
      "Practice at a wall (hands on wall, hips back)"
    ],
    contraindications: [
      "Recent wrist or shoulder injury",
      "Uncontrolled high blood pressure",
      "Late-term pregnancy (modify with elevated hands)"
    ]
  },

  Dancer: {
    name: "Dancer's Pose (Natarajasana)",
    difficulty: "Intermediate–Advanced",
    duration: "3–6 breaths each side",
    benefits: [
      "Enhances balance and focus",
      "Opens chest and shoulders",
      "Stretches quadriceps and hip flexors",
      "Strengthens standing leg and core"
    ],
    steps: [
      "Stand tall; shift weight into one foot",
      "Bend opposite knee and grasp inside of foot or ankle",
      "Inhale, lift chest; exhale, press foot back and up",
      "Reach free arm forward or upward for balance",
      "Keep hips square; gaze (drishti) steady"
    ],
    modifications: [
      "Use a strap around the lifted foot",
      "Hold a wall or chair with front hand",
      "Keep torso more upright if low back compresses"
    ],
    contraindications: [
      "Knee or ankle instability",
      "Low back pain or spinal compression issues",
      "Shoulder injury limiting overhead reach"
    ]
  },

  Triangle: {
    name: "Triangle Pose (Trikonasana)",
    difficulty: "Beginner–Intermediate",
    duration: "5–8 breaths each side",
    benefits: [
      "Stretches hamstrings, hips, and side body",
      "Opens chest and shoulders",
      "Improves spinal mobility",
      "Builds postural awareness"
    ],
    steps: [
      "From a wide stance, turn front foot out 90° and back foot slightly in",
      "Extend arms to shoulder height",
      "Hinge at front hip, reaching forward",
      "Lower front hand to shin, block, or floor; lift top arm",
      "Stack shoulders; lengthen both sides of torso; steady breath"
    ],
    modifications: [
      "Use a block outside front shin",
      "Shorten stance to reduce hamstring strain",
      "Rest top hand on hip if shoulder fatigues"
    ],
    contraindications: [
      "Acute hamstring injury",
      "Uncontrolled low blood pressure (rise slowly)",
      "Neck issues—keep gaze neutral"
    ]
  },

  Goddess: {
    name: "Goddess Pose (Utkata Konasana)",
    difficulty: "Beginner–Intermediate",
    duration: "30–60 seconds",
    benefits: [
      "Strengthens legs, glutes, and core",
      "Opens hips and chest",
      "Builds lower-body endurance",
      "Improves hip external rotation"
    ],
    steps: [
      "Take a wide stance; toes turned out ~45°",
      "Inhale tall; exhale bend knees tracking over toes",
      "Lower hips toward knee height (not below if new)",
      "Engage core and lengthen spine upright",
      "Hold arms bent (cactus) or extended; steady breath"
    ],
    modifications: [
      "Reduce turnout angle to ease knees",
      "Place hands on hips or at heart center",
      "Use a wall or chair behind for light support"
    ],
    contraindications: [
      "Knee ligament injuries",
      "Hip replacements—follow medical guidance",
      "Pelvic floor dysfunction (adjust depth)"
    ]
  },

  Warrior_II: {
    name: "Warrior II (Virabhadrasana II)",
    difficulty: "Beginner–Intermediate",
    duration: "5–10 breaths each side",
    benefits: [
      "Builds leg and hip strength",
      "Opens hips and chest",
      "Improves stamina and focus",
      "Enhances proprioception in lower body"
    ],
    steps: [
      "From a wide stance, turn front foot out 90°, back foot slightly in",
      "Align front heel with back arch (or wider for stability)",
      "Bend front knee over ankle toward 90°",
      "Extend arms parallel to floor; soften shoulders",
      "Gaze past front fingertips; engage core"
    ],
    modifications: [
      "Shorten stance to reduce knee load",
      "Rest front forearm on thigh briefly if fatigued",
      "Use a chair under front thigh for supported hold"
    ],
    contraindications: [
      "Knee issues (limit depth / ensure alignment)",
      "Hip pain with external rotation",
      "Shoulder injuries (modify arm position)"
    ]
  },

  Tree: {
    name: "Tree Pose (Vrikshasana)",
    difficulty: "Beginner",
    duration: "5–8 breaths each side",
    benefits: [
      "Improves balance and ankle stability",
      "Strengthens standing leg and core",
      "Promotes focus and calm",
      "Opens hips (external rotation)"
    ],
    steps: [
      "Stand tall; shift weight into one foot",
      "Place sole of opposite foot at ankle, calf, or inner thigh (avoid knee)",
      "Press foot and leg together to engage",
      "Bring hands to heart or overhead",
      "Maintain steady gaze and smooth breath"
    ],
    modifications: [
      "Keep toes on floor (kickstand variation)",
      "Lightly touch a wall or chair for balance",
      "Hands on hips instead of overhead"
    ],
    contraindications: [
      "Severe ankle instability",
      "Inner ear / balance disorders (use support)"
    ]
  }
};

const PoseGuide = ({ selectedPose, canvasRef }) => {
  const { username } = useUser();

  const [activeStep, setActiveStep] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isSpeakText, setIsSpeakTexting] = useState(false);

  const beepRef = useRef(null);

  useEffect(() => {setActiveStep(0);}, [selectedPose]);

  //Sequence of effects.Allow 5 second for the speech to finish before the next step. 
  useEffect(() => {
    setIsSpeakTexting(true);
    speakText(currentPose.steps[activeStep]);  
    setTimeout(() => {
      setIsCountingDown(true);
      setIsSpeakTexting(false);
    }, 5000); // 5 seconds for speech to finish
  }, [activeStep]);

  const handleCountdownComplete = async () => {
    setIsCountingDown(false);
    await takeSnapshot();
    // Maybe advance to next step here?
  };

  const takeSnapshot = async () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob){
          addSnapshot(blob);
        }
       }, 'image/png');
    };
  };

  // Use the selected pose or default to mountain pose
  const currentPose = POSES[selectedPose] || POSES.Tree;
  console.log("currentPose", currentPose);
  const handleNext = () => {
    setActiveStep((prev) => {
      const nextStep = prev + 1;
      speakText(currentPose.steps[nextStep]);
      return nextStep;
    });
  };
  
  const handleBack = () => {
    setActiveStep((prev) => {
      const prevStep = prev - 1;
      speakText(currentPose.steps[prevStep]);
      return prevStep;
    });
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
              
              {/* Only render countdown for the active step */}
              {index === activeStep && isCountingDown === true && (
                <CountdownStep onComplete={handleCountdownComplete} activeStep={index + 1} />
              )}
              
              {/* Only render countdown for breath cycles for the last active step */}
              
              <audio ref={beepRef} src="/beep.mp3" preload="auto" />

              {index === activeStep && isCountingDown === false && isSpeakText=== false && index === currentPose.steps.length - 1 && (
              <CountdownBreathCycle
                activeStep={activeStep}
                isLastStep={index === currentPose.steps.length - 1}
                duration={5}
                beepRef={beepRef}
                
              />
              )}
              
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
