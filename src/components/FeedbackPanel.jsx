import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const FeedbackContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const FeedbackPanel = ({ feedback }) => {
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
            <Typography variant="body2" color="text.secondary">
              Confidence: {feedback.confidence}%
            </Typography>
          </>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Waiting for pose analysis...
          </Typography>
        )}
      </Box>
    </FeedbackContainer>
  );
};

export default FeedbackPanel;
