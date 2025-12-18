"""
Database Models for Patient Rehabilitation Monitoring System

This file defines the structure of our database tables using SQLAlchemy ORM.
Each class represents a table, and each attribute represents a column.

For beginners:
- Think of models as blueprints for database tables
- Each model class = one table in PostgreSQL
- Relationships connect tables together (like foreign keys in SQL)
- SQLAlchemy handles converting between Python objects and SQL automatically
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime

# ============================================================================
# PATIENT MODEL
# ============================================================================

class Patient(Base):
    """
    Patient table stores demographic and profile information.
    
    This is the central table - all other tables link back to patients.
    In a real healthcare system, this would include more fields and
    be encrypted to protect patient privacy (HIPAA compliance).
    
    Columns explained:
    - id: Unique identifier (auto-incremented)
    - user_id: Links to authentication system (from Google OAuth)
    - name: Patient's full name
    - age: Patient's age in years
    - medical_history: JSON field for flexible medical data storage
    - created_at: Timestamp when patient was registered
    - updated_at: Timestamp of last profile update
    """
    
    # Table name in PostgreSQL
    __tablename__ = "patients"
    
    # Primary key - unique identifier for each patient
    # autoincrement=True means PostgreSQL automatically assigns the next number
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Link to authentication system
    # This connects to the user_id from Google OAuth login
    # unique=True ensures one patient record per user account
    user_id = Column(String(255), unique=True, index=True, nullable=False)
    
    # Patient demographic information
    name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    
    # Medical history stored as JSON for flexibility
    # Example: {"conditions": ["back pain", "arthritis"], "medications": ["ibuprofen"]}
    # JSON allows storing complex data without creating many tables
    medical_history = Column(JSON, nullable=True, default={})
    
    # Timestamps - automatically managed
    # func.now() is SQLAlchemy's way of saying "use database's current time"
    # server_default means the database sets this, not Python
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - connect this table to others
    # This creates a "virtual" attribute that lets you access related records
    # Example: patient.sessions gives you all sessions for this patient
    # back_populates creates a two-way relationship
    sessions = relationship("RehabilitationSession", back_populates="patient", cascade="all, delete-orphan")
    milestones = relationship("ProgressMilestone", back_populates="patient", cascade="all, delete-orphan")
    
    def __repr__(self):
        """String representation for debugging"""
        return f"<Patient(id={self.id}, name='{self.name}', age={self.age})>"

# ============================================================================
# REHABILITATION SESSION MODEL
# ============================================================================

class RehabilitationSession(Base):
    """
    RehabilitationSession table stores information about each yoga/therapy session.
    
    Each time a patient completes a session, we create one record here.
    This tracks overall session metrics like duration and average performance.
    
    Relationships:
    - Belongs to one Patient (many sessions per patient)
    - Has many PoseAttempts (many poses per session)
    - Has many PhysiologicalMetrics (vitals tracked during session)
    """
    
    __tablename__ = "rehabilitation_sessions"
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Foreign key - links to patients table
    # ForeignKey creates a database constraint ensuring patient_id exists in patients table
    # nullable=False means every session MUST belong to a patient
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    
    # Session metadata
    session_date = Column(DateTime(timezone=True), server_default=func.now())
    duration_minutes = Column(Integer, nullable=True)  # How long the session lasted
    
    # Performance metrics
    # poses_attempted: JSON array of pose names tried in this session
    # Example: ["Tree", "Warrior_II", "Downward_Facing_Dog"]
    poses_attempted = Column(JSON, nullable=True, default=[])
    
    # overall_score: Average confidence across all poses (0-100)
    overall_score = Column(Float, nullable=True)
    
    # notes: Free-text notes from therapist or patient
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # back_populates="sessions" links to Patient.sessions
    patient = relationship("Patient", back_populates="sessions")
    
    # One session has many pose attempts
    pose_attempts = relationship("PoseAttempt", back_populates="session", cascade="all, delete-orphan")
    
    # One session has many physiological readings
    vitals = relationship("PhysiologicalMetric", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Session(id={self.id}, patient_id={self.patient_id}, date={self.session_date})>"

# ============================================================================
# POSE ATTEMPT MODEL
# ============================================================================

class PoseAttempt(Base):
    """
    PoseAttempt table stores detailed data for each pose within a session.
    
    When a patient holds a pose and gets feedback, we save:
    - Which pose they attempted
    - Confidence score from AI model
    - Joint angles measured
    - Corrections suggested
    
    This granular data allows us to track improvement on specific poses over time.
    """
    
    __tablename__ = "pose_attempts"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Foreign key - links to rehabilitation_sessions table
    session_id = Column(Integer, ForeignKey("rehabilitation_sessions.id"), nullable=False, index=True)
    
    # Pose information
    pose_name = Column(String(100), nullable=False, index=True)  # e.g., "Tree", "Warrior_II"
    
    # AI model output
    confidence_score = Column(Float, nullable=True)  # 0-100, how well they performed
    
    # Biomechanical data
    # joint_angles: JSON object with angle measurements
    # Example: {"left_knee": 145, "right_knee": 142, "left_hip": 90}
    joint_angles = Column(JSON, nullable=True, default={})
    
    # Feedback data
    # corrections_given: JSON array of correction suggestions
    # Example: ["Straighten your back leg", "Lift your chest"]
    corrections_given = Column(JSON, nullable=True, default=[])
    
    # When this pose was attempted within the session
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship back to session
    session = relationship("RehabilitationSession", back_populates="pose_attempts")
    
    def __repr__(self):
        return f"<PoseAttempt(id={self.id}, pose='{self.pose_name}', score={self.confidence_score})>"

# ============================================================================
# PHYSIOLOGICAL METRIC MODEL
# ============================================================================

class PhysiologicalMetric(Base):
    """
    PhysiologicalMetric table stores health vitals during sessions.
    
    In a real system, this could integrate with:
    - Heart rate monitors
    - Breathing sensors
    - Stress detection via camera (HRV analysis)
    - Patient self-reported pain levels
    
    For now, we'll store simulated/manual entry data.
    Future enhancement: Real-time vital monitoring via webcam or wearables.
    """
    
    __tablename__ = "physiological_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Foreign key - links to rehabilitation_sessions table
    session_id = Column(Integer, ForeignKey("rehabilitation_sessions.id"), nullable=False, index=True)
    
    # Vital signs (all optional - not all may be measured)
    heart_rate = Column(Integer, nullable=True)  # Beats per minute (BPM)
    breathing_rate = Column(Integer, nullable=True)  # Breaths per minute
    
    # Subjective measures (1-10 scale)
    stress_level = Column(Integer, nullable=True)  # 1=calm, 10=very stressed
    pain_level = Column(Integer, nullable=True)  # 1=no pain, 10=severe pain
    
    # Additional metrics can be stored as JSON
    # Example: {"blood_pressure": "120/80", "oxygen_saturation": 98}
    additional_metrics = Column(JSON, nullable=True, default={})
    
    # When this measurement was taken
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship back to session
    session = relationship("RehabilitationSession", back_populates="vitals")
    
    def __repr__(self):
        return f"<PhysiologicalMetric(id={self.id}, hr={self.heart_rate}, stress={self.stress_level})>"

# ============================================================================
# PROGRESS MILESTONE MODEL
# ============================================================================

class ProgressMilestone(Base):
    """
    ProgressMilestone table tracks patient achievements and goals.
    
    Examples of milestones:
    - "Held Tree Pose for 30 seconds"
    - "Completed 10 sessions"
    - "Improved Warrior II confidence by 20%"
    - "Reduced pain level from 7 to 3"
    
    This gamification element motivates patients and provides
    clear progress indicators for healthcare providers.
    """
    
    __tablename__ = "progress_milestones"
    
    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    
    # Foreign key - links to patients table
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    
    # Milestone information
    # milestone_type: Category of achievement
    # Examples: "pose_mastery", "consistency", "improvement", "pain_reduction"
    milestone_type = Column(String(50), nullable=False, index=True)
    
    # achieved_date: When the milestone was reached
    achieved_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # description: Human-readable description of the achievement
    # Example: "Achieved 90% confidence in Tree Pose for 3 consecutive sessions"
    description = Column(Text, nullable=False)
    
    # metadata: Additional data about the milestone
    # Example: {"pose": "Tree", "confidence": 92, "sessions": 3}
    metadata = Column(JSON, nullable=True, default={})
    
    # Relationship back to patient
    patient = relationship("Patient", back_populates="milestones")
    
    def __repr__(self):
        return f"<ProgressMilestone(id={self.id}, type='{self.milestone_type}', patient_id={self.patient_id})>"

# ============================================================================
# HELPER FUNCTIONS FOR COMMON QUERIES
# ============================================================================

def get_patient_by_user_id(db, user_id: str):
    """
    Get patient record by authentication user_id.
    
    Args:
        db: Database session
        user_id: User ID from Google OAuth
    
    Returns:
        Patient object or None if not found
    
    Example:
        patient = get_patient_by_user_id(db, "google_123456")
    """
    return db.query(Patient).filter(Patient.user_id == user_id).first()

def get_patient_sessions(db, patient_id: int, limit: int = 10):
    """
    Get recent sessions for a patient.
    
    Args:
        db: Database session
        patient_id: Patient ID
        limit: Maximum number of sessions to return
    
    Returns:
        List of RehabilitationSession objects
    
    Example:
        sessions = get_patient_sessions(db, patient_id=1, limit=5)
    """
    return db.query(RehabilitationSession)\
        .filter(RehabilitationSession.patient_id == patient_id)\
        .order_by(RehabilitationSession.session_date.desc())\
        .limit(limit)\
        .all()

def get_pose_progress(db, patient_id: int, pose_name: str):
    """
    Get all attempts of a specific pose by a patient.
    
    This is useful for tracking improvement over time.
    
    Args:
        db: Database session
        patient_id: Patient ID
        pose_name: Name of the pose (e.g., "Tree")
    
    Returns:
        List of PoseAttempt objects ordered by date
    
    Example:
        tree_attempts = get_pose_progress(db, patient_id=1, pose_name="Tree")
        # Analyze confidence scores over time
        scores = [attempt.confidence_score for attempt in tree_attempts]
    """
    return db.query(PoseAttempt)\
        .join(RehabilitationSession)\
        .filter(RehabilitationSession.patient_id == patient_id)\
        .filter(PoseAttempt.pose_name == pose_name)\
        .order_by(PoseAttempt.timestamp.asc())\
        .all()
