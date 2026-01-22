import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { speakText } from './utils/speechUtils'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import StraightenIcon from '@mui/icons-material/Straighten';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
const FeedbackContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(30, 30, 30, 0.85)', // Semi-transparent dark background
  backdropFilter: 'blur(10px)', // Glassmorphism effect
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
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
  ...(confidencelevel === 'needs improvement' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
}));

const CorrectionChip = styled(Chip)(({ theme, correction }) => ({
  fontWeight: 'bold',
  marginTop: theme.spacing(1),
  ...(correction && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    textTransform: 'capitalize',
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  }),
}));
const FeedbackPanel = ({ feedback, onDetected }) => {


  const [confidenceLevel, setConfidenceLevel] = useState('needs improvement');
  // Speak step instruction every time activeStep changes
  useEffect(() => {
    if (feedback?.confidenceLevel) {
      console.log("update confidence level: ", feedback.confidenceLevel)

      setConfidenceLevel(feedback.confidenceLevel);
    }
  }, [feedback?.confidenceLevel]);

  useEffect(() => {
    speakText(confidenceLevel);
    console.log("speak text confidence level: ", confidenceLevel)
  }, [confidenceLevel]);

  useEffect(() => {
    if (feedback?.llm_instruction) {
      speakText(feedback.llm_instruction);
    }
  }, [feedback?.llm_instruction]);

  // Helpers: categorize correction text to icon/color
  const getCorrectionMeta = (text) => {
    if (!text || typeof text !== 'string') return { icon: <WarningAmberIcon />, color: 'warning' };
    const t = text.toLowerCase();
    if (t.includes('raise') || t.includes('higher') || t.includes('lift')) {
      return { icon: <ArrowUpwardIcon />, color: 'warning' };
    }
    if (t.includes('straighten')) {
      return { icon: <StraightenIcon />, color: 'info' };
    }
    if (t.includes('bend')) {
      return { icon: <FitnessCenterIcon />, color: 'secondary' };
    }
    if (t.includes('open')) {
      return { icon: <OpenInFullIcon />, color: 'success' };
    }
    if (t.includes('close')) {
      return { icon: <CloseFullscreenIcon />, color: 'error' };
    }
    return { icon: <WarningAmberIcon />, color: 'warning' };
  };

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
                label={typeof feedback?.confidence === 'number' ? `${Math.round(feedback.confidence)}%` : 'N/A'}
                confidencelevel={feedback?.confidenceLevel || 'needs improvement'}
                size="small"
              />
            </Box>

            {Array.isArray(feedback?.corrections) && feedback.corrections.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {feedback.corrections.map((c, idx) => {
                  const { icon, color } = getCorrectionMeta(c);
                  return (
                    <Chip
                      key={`${c}-${idx}`}
                      icon={icon}
                      label={c}
                      color={color}
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  );
                })}
              </Stack>
            )}

            {feedback.llm_instruction && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #9c27b0' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'secondary.light', mb: 0.5 }}>
                  AI Guidance:
                </Typography>
                <Typography variant="body1">
                  {feedback.llm_instruction}
                </Typography>
              </Box>
            )}

            {feedback.class_name && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Detected pose: {String(feedback.class_name).replace(/_/g, ' ')}
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