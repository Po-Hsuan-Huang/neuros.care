export function speakText(text){
    if (!window.speechSynthesis) {
      alert('Your browser does not support Speech Synthesis.');
      return;
    }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // Change to desired locale
  utterance.rate = 0.8; 
  window.speechSynthesis.cancel(); // Stop any previous speech
  window.speechSynthesis.speak(utterance);
};