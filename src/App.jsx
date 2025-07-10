import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import YogaSession from './pages/YogaSession';
import Profile from './pages/Profile';
import Progress from './pages/Progress';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session" element={<YogaSession />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} /> 
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
