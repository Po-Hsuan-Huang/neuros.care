"""
Database Initialization Script

This script initializes the database by creating all tables.
Run this once after setting up PostgreSQL and configuring your .env file.

For beginners:
- This is a one-time setup script
- It creates all the tables defined in models.py
- Safe to run multiple times (won't delete existing data)
- Use Alembic for future schema changes

Usage:
    python init_db.py
"""

import sys
import os

# Add the backend directory to Python path
# This allows us to import database and models modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, test_connection, engine
from models import Patient, RehabilitationSession, PoseAttempt, PhysiologicalMetric, ProgressMilestone

def main():
    """
    Main initialization function.
    
    Steps:
    1. Test database connection
    2. Create all tables
    3. Verify tables were created
    """
    
    print("=" * 60)
    print("PostgreSQL Database Initialization")
    print("=" * 60)
    print()
    
    # Step 1: Test connection
    print("Step 1: Testing database connection...")
    if not test_connection():
        print("\n❌ Database connection failed!")
        print("\nPlease check:")
        print("1. PostgreSQL is running")
        print("2. DATABASE_URL in .env is correct")
        print("3. Database exists (run: createdb yoga_rehabilitation)")
        return False
    
    print()
    
    # Step 2: Create tables
    print("Step 2: Creating database tables...")
    try:
        init_db()
        print()
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        return False
    
    # Step 3: Verify tables
    print("Step 3: Verifying tables...")
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        expected_tables = [
            'patients',
            'rehabilitation_sessions',
            'pose_attempts',
            'physiological_metrics',
            'progress_milestones'
        ]
        
        print(f"\nFound {len(tables)} tables:")
        for table in tables:
            status = "✅" if table in expected_tables else "⚠️"
            print(f"  {status} {table}")
        
        missing = set(expected_tables) - set(tables)
        if missing:
            print(f"\n⚠️  Missing tables: {', '.join(missing)}")
            return False
        
        print("\n" + "=" * 60)
        print("✅ Database initialization complete!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Start the Flask server: python server.py")
        print("2. Test the API endpoints")
        print("3. Check the Progress dashboard in the frontend")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error verifying tables: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
