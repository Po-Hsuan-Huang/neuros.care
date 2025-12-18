# PostgreSQL Patient Monitoring System - Setup Guide

## 🎯 Overview

This guide will help you set up the PostgreSQL database for the AI Yoga Assistant's patient rehabilitation monitoring system. This is a **beginner-friendly** guide with step-by-step instructions.

## 📋 Prerequisites

Before you begin, make sure you have:
- Python 3.8 or higher installed
- Basic command line knowledge
- Text editor (VS Code, Sublime, etc.)

## 🗄️ Step 1: Install PostgreSQL

### macOS
```bash
# Install using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### Ubuntu/Debian Linux
```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (use default settings)
3. Remember the password you set for the `postgres` user
4. PostgreSQL service starts automatically

## 🔧 Step 2: Create Database

### macOS/Linux
```bash
# Create the database
createdb yoga_rehabilitation

# Verify it was created
psql -l | grep yoga_rehabilitation
```

### Windows
```bash
# Open Command Prompt as Administrator
# Connect to PostgreSQL
psql -U postgres

# Create database (inside psql prompt)
CREATE DATABASE yoga_rehabilitation;

# List databases to verify
\l

# Exit psql
\q
```

## ⚙️ Step 3: Configure Environment Variables

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Open `.env` in your text editor and update these values:

```env
# Update this with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/yoga_rehabilitation

# Generate a secure secret key
# Run: python -c "import secrets; print(secrets.token_hex(32))"
FLASK_SECRET_KEY=your-generated-secret-key-here

# Set to development for local testing
APP_ENV=development
```

**Important**: Replace `YOUR_PASSWORD_HERE` with your actual PostgreSQL password!

## 📦 Step 4: Install Python Dependencies

```bash
# Make sure you're in the backend directory
cd backend

# Install all required packages
pip install -r requirements.txt

# This will install:
# - psycopg2-binary (PostgreSQL adapter)
# - SQLAlchemy (ORM for database operations)
# - alembic (database migrations)
# - Flask and other existing dependencies
```

## 🏗️ Step 5: Initialize Database Tables

Run the initialization script:

```bash
python init_db.py
```

You should see output like this:
```
============================================================
PostgreSQL Database Initialization
============================================================

Step 1: Testing database connection...
✅ Database connection successful!

Step 2: Creating database tables...
✅ Database tables created successfully!

Step 3: Verifying tables...

Found 5 tables:
  ✅ patients
  ✅ rehabilitation_sessions
  ✅ pose_attempts
  ✅ physiological_metrics
  ✅ progress_milestones

============================================================
✅ Database initialization complete!
============================================================
```

## ✅ Step 6: Verify Setup

Test that everything is working:

```bash
# Test database connection
python -c "from database import test_connection; test_connection()"

# You should see:
# ✅ Database connection successful!
```

## 🚀 Step 7: Start the Server

```bash
# Start Flask server
python server.py
```

You should see:
```
✅ Database modules loaded successfully
✅ Patient monitoring API routes registered
✅ Database connection verified
 * Running on http://127.0.0.1:5000
```

## 📊 Step 8: Test API Endpoints

### Create a Patient
```bash
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "name": "Test Patient",
    "age": 30
  }'
```

### Get Patient Info
```bash
curl http://localhost:5000/api/patients/1
```

### Create a Session
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "duration_minutes": 30
  }'
```

## 🔍 Troubleshooting

### Error: "Database connection failed"
- **Check PostgreSQL is running**:
  - macOS: `brew services list | grep postgresql`
  - Linux: `sudo systemctl status postgresql`
  - Windows: Check Services app for "postgresql" service

- **Verify DATABASE_URL in .env**:
  - Make sure password is correct
  - Check database name exists: `psql -l`

### Error: "No module named 'psycopg2'"
```bash
pip install psycopg2-binary
```

### Error: "relation 'patients' does not exist"
```bash
# Re-run database initialization
python init_db.py
```

### Error: "FATAL: password authentication failed"
- Your PostgreSQL password in `.env` is incorrect
- Reset PostgreSQL password:
  ```bash
  # macOS/Linux
  psql postgres
  ALTER USER postgres PASSWORD 'newpassword';
  \q
  ```

## 📚 Understanding the Database Structure

### Tables Overview

1. **patients** - Stores patient demographic information
   - Links to Google OAuth user accounts
   - Contains medical history (JSON format)

2. **rehabilitation_sessions** - Tracks each yoga session
   - Duration, date, overall performance score
   - List of poses attempted

3. **pose_attempts** - Detailed data for each pose
   - Confidence scores from AI model
   - Joint angles measured
   - Corrections suggested

4. **physiological_metrics** - Health vitals during sessions
   - Heart rate, breathing rate
   - Stress and pain levels

5. **progress_milestones** - Achievement tracking
   - Pose mastery achievements
   - Improvement milestones

### Relationships
```
Patient (1) ──→ (many) RehabilitationSession
                          │
                          ├──→ (many) PoseAttempt
                          └──→ (many) PhysiologicalMetric

Patient (1) ──→ (many) ProgressMilestone
```

## 🔐 Security Notes

### For Learning/Development
- Current setup is fine for local development
- Uses basic authentication via Google OAuth

### For Production (Real Patient Data)
You MUST implement:
1. **Encryption at rest** - Encrypt database
2. **Encryption in transit** - Use SSL/TLS
3. **HIPAA compliance** - Follow healthcare data regulations
4. **Audit logging** - Track all data access
5. **Role-based access control** - Limit who can see what data
6. **Data anonymization** - For analytics/research

## 📖 Next Steps

1. **Explore the API** - Try all endpoints listed in `implementation_plan.md`
2. **Integrate with Frontend** - Update `Progress.jsx` to fetch data
3. **Add Data Visualization** - Install chart libraries and create dashboards
4. **Test Workflows** - Complete a full yoga session and verify data is saved

## 🆘 Getting Help

If you're stuck:
1. Check the error message carefully
2. Review this guide step-by-step
3. Check `database.py` and `models.py` for inline comments
4. Look at example API calls in `api_routes.py`

## 📝 Useful Commands

```bash
# View PostgreSQL logs
tail -f /usr/local/var/log/postgresql@15.log  # macOS

# Connect to database
psql yoga_rehabilitation

# List all tables
\dt

# View table structure
\d patients

# Query data
SELECT * FROM patients;

# Exit psql
\q
```

## 🎓 Learning Resources

- **PostgreSQL Tutorial**: https://www.postgresqltutorial.com/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Flask Tutorial**: https://flask.palletsprojects.com/tutorial/
- **REST API Design**: https://restfulapi.net/

---

**Congratulations!** 🎉 You've set up a professional-grade patient monitoring database system!
