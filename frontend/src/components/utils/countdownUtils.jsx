import { useState, useEffect } from 'react';
import{speakText} from './speechUtils';

export function CountdownStep({ activeStep, onComplete }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      onComplete(); // Move to next step
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(c => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onComplete]);
  
  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Step {activeStep}</h2>
      <p>Hold the pose...</p>
      <h1>{countdown}</h1>
    </div>
  );
}



export function CountdownBreathCycle({ activeStep, isLastStep, duration = 3, beepRef, onComplete}) {
  const [currentCycle, setCurrentCycle] = useState(1);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [countdown, setCountdown] = useState(3);
  const playBeep = () => {
    if (beepRef?.current) {
      beepRef.current.currentTime = 0;
      beepRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          // End of current phase (inhale or exhale)
          playBeep();
          
          if (breathPhase === 'inhale') {
            // Switch to exhale
            setBreathPhase('exhale');
            speakText('Exhale');
            return 3; // Reset countdown for exhale phase
          } else {
            // End of exhale, complete cycle
            if (currentCycle >= duration) {
              // All cycles complete
              speakText('Breathing complete');
              if (onComplete) onComplete();
              return 0;
            } else {
              // Start next cycle
              setCurrentCycle(c => c + 1);
              setBreathPhase('inhale');
              speakText('Inhale');
              return 3; // Reset countdown for next inhale
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLastStep, breathPhase, currentCycle, duration, onComplete, beepRef, speakText]);

  // Speak initial "Inhale" when component starts
  useEffect(() => {
    if (isLastStep && currentCycle === 1 && breathPhase === 'inhale') {
      speakText('Inhale');
    }
  }, [isLastStep, speakText]);

  if (!isLastStep) return null;

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Step {activeStep}</h2>
      <p>Final hold - {duration} breath cycles</p>
      <p>Cycle: {currentCycle}/{duration}</p>
    </div>
  );
}