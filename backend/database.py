"""
Database Configuration and Connection Management

This file sets up the connection to PostgreSQL database using SQLAlchemy.
SQLAlchemy is an ORM (Object-Relational Mapping) tool that lets us work with
databases using Python objects instead of writing raw SQL queries.

For beginners:
- Think of this as the "bridge" between Python and PostgreSQL
- It handles connection pooling (reusing connections for efficiency)
- It manages sessions (temporary workspaces for database operations)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
# This keeps sensitive information (like database passwords) out of code
load_dotenv()

# Get database URL from environment variable
# Format: postgresql://username:password@host:port/database_name
# Example: postgresql://postgres:mypassword@localhost:5432/yoga_rehabilitation
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/yoga_rehabilitation")

# Create the database engine
# The engine is the starting point for any SQLAlchemy application
# It manages the connection pool and dialect (PostgreSQL-specific SQL)
# 
# Parameters explained:
# - pool_pre_ping=True: Check if connection is alive before using it
# - echo=False: Set to True to see all SQL queries (useful for debugging)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections are alive
    echo=False,          # Set to True to debug SQL queries
    pool_size=10,        # Maximum number of connections to keep open
    max_overflow=20      # Maximum number of connections to create beyond pool_size
)

# Create a SessionLocal class
# Sessions are how we actually interact with the database
# Think of a session as a "workspace" where you can:
# - Query data (SELECT)
# - Add new records (INSERT)
# - Update existing records (UPDATE)
# - Delete records (DELETE)
# 
# autocommit=False: Changes aren't saved until you explicitly call session.commit()
# autoflush=False: Changes aren't sent to DB until commit (gives you more control)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all database models
# All your table definitions will inherit from this
# This is what makes SQLAlchemy "magic" work - it tracks all your models
Base = declarative_base()

# Dependency function to get database session
# This is used in FastAPI/Flask routes to get a database connection
# The 'yield' keyword makes this a generator - it provides the session,
# then cleans up after the request is done
def get_db():
    """
    Get a database session for a request.
    
    Usage in Flask route:
        db = next(get_db())
        try:
            # Do database operations
            patient = db.query(Patient).first()
        finally:
            db.close()
    
    This ensures the database connection is properly closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper function to initialize database
def init_db():
    """
    Initialize the database by creating all tables.
    
    This should be called once when setting up the application.
    It will create all tables defined in models.py
    
    IMPORTANT: This won't modify existing tables. For schema changes,
    use Alembic migrations instead.
    """
    # Import all models here so they are registered with Base
    from models import Patient, RehabilitationSession, PoseAttempt, PhysiologicalMetric, ProgressMilestone
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

# Helper function to test database connection
def test_connection():
    """
    Test if database connection is working.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        # Try to connect to the database
        connection = engine.connect()
        connection.close()
        print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your DATABASE_URL in .env file")
        print("3. Verify database exists: createdb yoga_rehabilitation")
        return False

# Run connection test when this file is imported
if __name__ == "__main__":
    print("Testing database connection...")
    test_connection()
