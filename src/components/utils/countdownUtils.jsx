import { useState, useEffect } from 'react';

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