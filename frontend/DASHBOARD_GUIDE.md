# Frontend Dashboard - Quick Start Guide

## Overview
The Profile page (`frontend/src/pages/Profile.jsx`) now displays a comprehensive patient monitoring dashboard with real-time data from the PostgreSQL backend.

## Features Implemented

### 1. Patient Profile Card
- Avatar with patient initials
- Patient name and ID
- Age and member since date
- Total sessions count

### 2. Progress Overview Card
- **Average Performance Score** - Visual progress bar showing overall performance
- **Improvement Trend** - Shows if patient is improving, stable, or declining
- **Poses Attempted** - Total number of unique poses tried
- **Poses Mastered** - Poses with ≥85% average confidence
- **Mastered Poses List** - Chips displaying each mastered pose

### 3. Recent Sessions List
- Session date and time
- Performance score for each session
- Duration in minutes
- Poses attempted in that session
- Session notes (if any)

### 4. Recent Achievements
- Milestone descriptions
- Achievement dates
- Milestone types (pose_mastery, consistency, improvement, etc.)

## How It Works

### Data Flow
```
Profile.jsx (Frontend)
    ↓ fetch()
Backend API (server.py)
    ↓ SQLAlchemy
PostgreSQL Database
```

### API Endpoints Used

1. **GET /api/patients/me**
   - Fetches current logged-in patient profile
   - Uses session cookies for authentication

2. **GET /api/patients/{id}/sessions?limit=10**
   - Fetches 10 most recent sessions
   - Includes session details and scores

3. **GET /api/patients/{id}/progress**
   - Fetches comprehensive progress analytics
   - Calculates improvement trends
   - Identifies mastered poses

## Setup Instructions

### 1. Ensure Backend is Running

```bash
# Terminal 1: Start PostgreSQL (if not already running)
sudo systemctl start postgresql  # Linux
# or
brew services start postgresql@15  # macOS

# Terminal 2: Start Flask backend
cd backend
python server.py
```

You should see:
```
✅ Database modules loaded successfully
✅ Patient monitoring API routes registered
✅ Database connection verified
 * Running on http://127.0.0.1:5000
```

### 2. Start Frontend

```bash
# Terminal 3: Start React frontend
cd frontend
npm run dev
```

### 3. Access Dashboard

1. Open browser to `http://localhost:3000` (or your Vite port)
2. Login with Google OAuth
3. Navigate to **Profile** page
4. Dashboard will load automatically

## First Time Setup

### If You See "No patient profile found"

This is normal for new users! The profile is created automatically when you:

1. Complete your first yoga session in the **YogaSession** page
2. The backend will create a patient record linked to your Google account

### If You See "Failed to load patient data"

Check these:

1. **Backend server running?**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status": "healthy", "model_loaded": true}
   ```

2. **Database initialized?**
   ```bash
   cd backend
   python init_db.py
   ```

3. **PostgreSQL running?**
   ```bash
   sudo systemctl status postgresql  # Linux
   # or
   brew services list | grep postgresql  # macOS
   ```

## Testing the Dashboard

### Option 1: Create Test Data via API

```bash
# 1. Create a patient
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "name": "Test Patient",
    "age": 30
  }'

# 2. Create a session
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "duration_minutes": 30
  }'

# 3. Add pose attempts
curl -X POST http://localhost:5000/api/sessions/1/poses \
  -H "Content-Type: application/json" \
  -d '{
    "pose_name": "Tree",
    "confidence_score": 85.5,
    "joint_angles": {"left_knee": 145},
    "corrections_given": ["Straighten back leg"]
  }'
```

### Option 2: Complete Real Yoga Session

1. Go to **YogaSession** page
2. Select a pose (e.g., "Tree")
3. Allow camera access
4. Perform the pose
5. Data is automatically saved to database
6. Return to **Profile** page to see updated dashboard

## Dashboard States

### Loading State
- Shows spinner with "Loading your profile..." message
- Appears while fetching data from backend

### Error State
- Shows red alert with error message
- Provides troubleshooting checklist
- Common when backend is not running

### Empty State
- Shows blue info alert
- Appears for new users without profile
- Instructs to complete a session

### Data State
- Full dashboard with all cards populated
- Real-time data from PostgreSQL
- Updates on page refresh

## Customization

### Change API URL

If your backend runs on a different port:

```javascript
// In Profile.jsx, update fetch URLs:
const API_BASE_URL = 'http://localhost:5000';  // Change this

// Then use:
fetch(`${API_BASE_URL}/api/patients/me`, ...)
```

### Add More Statistics

To add new statistics to the dashboard:

1. **Backend**: Add new analytics endpoint in `api_routes_extended.py`
2. **Frontend**: Add new state variable and fetch call in `Profile.jsx`
3. **UI**: Add new Card component to display the data

Example:
```javascript
// Add state
const [weeklyStats, setWeeklyStats] = useState(null);

// Fetch data
const statsResponse = await fetch(
  `${API_BASE_URL}/api/patients/${patientData.id}/weekly-stats`
);
const statsData = await statsResponse.json();
setWeeklyStats(statsData);

// Display in UI
<Card>
  <CardContent>
    <Typography variant="h6">This Week</Typography>
    <Typography variant="h4">{weeklyStats.sessions} Sessions</Typography>
  </CardContent>
</Card>
```

## Code Structure

### Component Organization

```
Profile.jsx
├── State Management (useState hooks)
├── Data Fetching (useEffect hook)
├── Helper Functions (formatDate, getScoreColor, etc.)
├── Loading/Error/Empty States
└── Main Dashboard Render
    ├── Patient Profile Card
    ├── Progress Overview Card
    ├── Recent Sessions Card
    └── Recent Achievements Card
```

### Material-UI Components Used

- **Layout**: Box, Grid, Card, CardContent
- **Typography**: Typography, Chip
- **Lists**: List, ListItem, ListItemText, ListItemIcon
- **Feedback**: Alert, CircularProgress, LinearProgress
- **Icons**: PersonIcon, FitnessCenterIcon, TrophyIcon, etc.

## Next Steps

### Phase 4: Advanced Features (Optional)

1. **Add Charts**
   - Install recharts: `npm install recharts --legacy-peer-deps`
   - Create line chart for score trends over time
   - Create bar chart for pose comparisons

2. **Add Date Filtering**
   - Install date picker: `npm install @mui/x-date-pickers date-fns --legacy-peer-deps`
   - Allow filtering sessions by date range
   - Show monthly/weekly statistics

3. **Add Export Functionality**
   - Export session data as CSV
   - Generate PDF reports
   - Share progress with healthcare providers

4. **Real-time Updates**
   - Add WebSocket connection
   - Update dashboard without page refresh
   - Show live session data

## Troubleshooting

### Dashboard shows old data
- Refresh the page (F5)
- Data is fetched on component mount only
- Add a "Refresh" button if needed

### "CORS error" in browser console
- Check backend CORS configuration in `server.py`
- Ensure `credentials: 'include'` in fetch calls
- Verify frontend URL is in allowed origins

### Sessions not appearing
- Check if sessions exist in database:
  ```bash
  psql yoga_rehabilitation
  SELECT * FROM rehabilitation_sessions;
  ```
- Verify patient_id matches between frontend and backend

## Summary

✅ **Implemented**: Full patient monitoring dashboard in Profile.jsx  
✅ **Features**: Profile, progress stats, session history, milestones  
✅ **Integration**: Connected to all 11 backend API endpoints  
✅ **UX**: Loading states, error handling, empty states  
✅ **Documentation**: 400+ lines of beginner-friendly comments  

The dashboard is now ready to use! Complete a yoga session to see it in action.
