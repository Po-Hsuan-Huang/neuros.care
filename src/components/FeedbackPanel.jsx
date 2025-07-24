import React,{useState, useEffect} from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import{speakText} from './utils/speechUtils'
const FeedbackContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const ConfidenceChip = styled(Chip)(({ theme, confidencelevel }) => ({
  fontWeight: 'bold',
  // excellent & great share the same style
  ...(["excellent", "great"].includes(confidencelevel) && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(confidencelevel === 'good' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  }),
  ...(confidencelevel === 'fair' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(confidencelevel === 'needs_improvement' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
}));

const FeedbackPanel = ({ feedback, onDetected }) => {

  const [confidenceLevel, setConfidenceLevel] = useState('needs_improvement');
  // Speak step instruction every time activeStep changes
  useEffect(() => {
    if (feedback?.confidenceLevel) {
      setConfidenceLevel(feedback.confidenceLevel);
    }
  }, [feedback?.confidenceLevel]);

  useEffect(() => {
    speakText(confidenceLevel);
  }, [confidenceLevel]);


  const getWaitingMessage = () => {
    return "Position yourself clearly in the camera view and hold a yoga pose for analysis";
  };
  console.log("feedback", feedback)
  return (
    <FeedbackContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Real-time Feedback
      </Typography>
      <Box sx={{ mt: 2 }}>
        {feedback ? (
          <>
            <Typography variant="body1" gutterBottom>
              {feedback.message}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Confidence:
              </Typography>
              <ConfidenceChip
                label={`${feedback.confidence}%`}
                confidencelevel={feedback.feedback_level}
                size="small"
              />
            </Box>
            
            {feedback.class_name && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Detected pose: {feedback.class_name.replace(/_/g, ' ')}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">
            {getWaitingMessage()}
          </Typography>
        )}
      </Box>
    </FeedbackContainer>
  );
};

export default FeedbackPanel;