/**
 * Patient Monitoring Dashboard - Profile Page
 * 
 * This component displays comprehensive patient rehabilitation data including:
 * - Patient profile information
 * - Session history and statistics
 * - Progress analytics and trends
 * - Pose mastery tracking
 * - Recent milestones
 * 
 * For beginners:
 * - useState: Manages component state (data from API)
 * - useEffect: Runs code when component loads (fetch data)
 * - fetch: Makes HTTP requests to backend API
 * - Material-UI: Pre-built React components for UI
 */

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useUserContext } from '../context/UserContext';

const Profile = () => {
  const { username } = useUserContext();

  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  // Patient data from API
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  /**
   * Fetch patient data from backend API
   * This runs once when the component loads (empty dependency array [])
   */
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        // Fetch current patient profile
        // This uses the /api/patients/me endpoint which gets data from session
        const patientResponse = await fetch('http://localhost:5000/api/patients/me', {
          credentials: 'include' // Include cookies for authentication
        });

        if (!patientResponse.ok) {
          // Patient doesn't exist yet - this is okay for new users
          console.log('No patient profile found - user needs to create one');
          setLoading(false);
          return;
        }

        const patientData = await patientResponse.json();
        setPatient(patientData);

        // Fetch recent sessions for this patient
        const sessionsResponse = await fetch(
          `http://localhost:5000/api/patients/${patientData.id}/sessions?limit=10`,
          { credentials: 'include' }
        );

        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData.sessions || []);
        }

        // Fetch progress analytics
        const progressResponse = await fetch(
          `http://localhost:5000/api/patients/${patientData.id}/progress`,
          { credentials: 'include' }
        );

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient data. Make sure the backend server is running.');
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []); // Empty array means this runs once on component mount

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  /**
   * Format date to readable string
   * Example: "2024-01-15T14:30:00Z" -> "Jan 15, 2024"
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Get color for confidence score
   * Green for high scores, yellow for medium, red for low
   */
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  /**
   * Get icon for improvement trend
   */
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      default:
        return '❓';
    }
  };

  // ========================================================================
  // LOADING AND ERROR STATES
  // ========================================================================

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading your profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Typography sx={{ mt: 2 }}>
          Make sure:
          <ul>
            <li>PostgreSQL is running</li>
            <li>Backend server is running (python server.py)</li>
            <li>Database is initialized (python init_db.py)</li>
          </ul>
        </Typography>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Welcome! You don't have a patient profile yet. Complete a yoga session to create your profile automatically.
        </Alert>
      </Box>
    );
  }

  // ========================================================================
  // MAIN DASHBOARD RENDER
  // ========================================================================

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon fontSize="large" />
        Patient Dashboard
      </Typography>

      <Grid container spacing={3}>

        {/* ================================================================
            PATIENT PROFILE CARD
            ================================================================ */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main', mr: 2 }}>
                  {username?.charAt(0).toUpperCase() || 'P'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{patient.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient ID: {patient.id}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Age"
                    secondary={patient.age || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={formatDate(patient.created_at)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
                  <ListItemText
                    primary="Total Sessions"
                    secondary={patient.total_sessions || 0}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* ================================================================
            PROGRESS STATISTICS CARD
            ================================================================ */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon />
                Progress Overview
              </Typography>

              {progress ? (
                <Grid container spacing={2}>
                  {/* Average Score */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Average Performance Score
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="h4" color={getScoreColor(progress.average_score)}>
                          {progress.average_score}%
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={progress.average_score}
                          color={getScoreColor(progress.average_score)}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  {/* Improvement Trend */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Improvement Trend
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h4">
                          {getTrendIcon(progress.improvement_trend)}
                        </Typography>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                          {progress.improvement_trend.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Poses Attempted */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Poses Attempted
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {progress.total_poses_attempted}
                    </Typography>
                  </Grid>

                  {/* Poses Mastered */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Poses Mastered (≥85%)
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {progress.poses_mastered?.length || 0}
                    </Typography>
                  </Grid>

                  {/* Mastered Poses List */}
                  {progress.poses_mastered && progress.poses_mastered.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Mastered Poses:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {progress.poses_mastered.map((pose, index) => (
                          <Chip
                            key={index}
                            label={pose.replace(/_/g, ' ')}
                            color="success"
                            size="small"
                            icon={<TrophyIcon />}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  Complete some sessions to see your progress!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ================================================================
            RECENT SESSIONS CARD
            ================================================================ */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FitnessCenterIcon />
                Recent Sessions
              </Typography>

              {sessions.length > 0 ? (
                <List>
                  {sessions.map((session, index) => (
                    <React.Fragment key={session.id}>
                      <ListItem>
                        <ListItemIcon>
                          <CalendarIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>
                                {formatDate(session.session_date)}
                              </Typography>
                              {session.overall_score && (
                                <Chip
                                  label={`${session.overall_score.toFixed(1)}%`}
                                  color={getScoreColor(session.overall_score)}
                                  size="small"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Duration: {session.duration_minutes || 'N/A'} minutes
                              </Typography>
                              {session.poses_attempted && session.poses_attempted.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                  Poses: {session.poses_attempted.join(', ').replace(/_/g, ' ')}
                                </Typography>
                              )}
                              {session.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  Notes: {session.notes}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < sessions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No sessions yet. Start your first yoga session to begin tracking your progress!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ================================================================
            RECENT MILESTONES CARD
            ================================================================ */}
        {progress && progress.recent_milestones && progress.recent_milestones.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrophyIcon />
                  Recent Achievements
                </Typography>

                <List>
                  {progress.recent_milestones.map((milestone, index) => (
                    <React.Fragment key={milestone.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TrophyIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={milestone.description}
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(milestone.achieved_date)}
                              </Typography>
                              <Chip
                                label={milestone.type.replace(/_/g, ' ')}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < progress.recent_milestones.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Profile;
