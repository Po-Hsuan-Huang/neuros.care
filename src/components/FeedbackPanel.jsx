import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const FeedbackContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const ConfidenceChip = styled(Chip)(({ theme, confidencelevel }) => ({
  fontWeight: 'bold',
  ...(confidencelevel === 'high' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(confidencelevel === 'medium' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(confidencelevel === 'low' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
}));

const FeedbackPanel = ({ feedback, onDetected }) => {
  

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