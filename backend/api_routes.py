"""
API Routes for Patient Management and Session Tracking

This file contains Flask routes for managing patient data and rehabilitation sessions.
Import this in server.py to add database functionality to your API.

For beginners:
- Each @app.route decorator creates a new API endpoint
- request.get_json() gets data sent from frontend
- jsonify() converts Python dict to JSON response
- HTTP status codes: 200=success, 201=created, 400=bad request, 404=not found, 500=server error
"""

from flask import request, jsonify, session
from sqlalchemy.exc import IntegrityError
from database import get_db
from models import (
    Patient, RehabilitationSession, PoseAttempt, 
    PhysiologicalMetric, ProgressMilestone,
    get_patient_by_user_id, get_patient_sessions, get_pose_progress
)
from datetime import datetime, timedelta
import traceback

# ============================================================================
# PATIENT MANAGEMENT ENDPOINTS
# ============================================================================

def register_patient_routes(app):
    """
    Register all patient-related routes with the Flask app.
    
    Call this function in server.py after creating the app:
        from api_routes import register_patient_routes
        register_patient_routes(app)
    """
    
    @app.route("/api/patients", methods=["POST"])
    def create_patient():
        """
        Create a new patient profile.
        
        Request body (JSON):
        {
            "user_id": "google_123456",  # From OAuth
            "name": "John Doe",
            "age": 35,
            "medical_history": {
                "conditions": ["back pain"],
                "medications": []
            }
        }
        
        Response (201 Created):
        {
            "id": 1,
            "user_id": "google_123456",
            "name": "John Doe",
            "age": 35,
            "created_at": "2024-01-15T10:30:00Z"
        }
        """
        try:
            # Get database session
            db = next(get_db())
            
            # Parse request data
            data = request.get_json()
            
            # Validate required fields
            if not data.get("user_id") or not data.get("name"):
                return jsonify({"error": "user_id and name are required"}), 400
            
            # Check if patient already exists
            existing = get_patient_by_user_id(db, data["user_id"])
            if existing:
                return jsonify({"error": "Patient already exists for this user"}), 400
            
            # Create new patient
            patient = Patient(
                user_id=data["user_id"],
                name=data["name"],
                age=data.get("age"),
                medical_history=data.get("medical_history", {})
            )
            
            # Save to database
            db.add(patient)
            db.commit()
            db.refresh(patient)  # Get the auto-generated ID
            
            # Return created patient
            return jsonify({
                "id": patient.id,
                "user_id": patient.user_id,
                "name": patient.name,
                "age": patient.age,
                "medical_history": patient.medical_history,
                "created_at": patient.created_at.isoformat()
            }), 201
            
        except IntegrityError:
            db.rollback()
            return jsonify({"error": "Patient with this user_id already exists"}), 400
        except Exception as e:
            db.rollback()
            print(f"Error creating patient: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    @app.route("/api/patients/<int:patient_id>", methods=["GET"])
    def get_patient(patient_id):
        """
        Get patient profile by ID.
        
        URL: /api/patients/1
        
        Response (200 OK):
        {
            "id": 1,
            "user_id": "google_123456",
            "name": "John Doe",
            "age": 35,
            "medical_history": {...},
            "total_sessions": 15,
            "created_at": "2024-01-15T10:30:00Z"
        }
        """
        try:
            db = next(get_db())
            
            # Query patient
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            
            if not patient:
                return jsonify({"error": "Patient not found"}), 404
            
            # Count total sessions
            session_count = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.patient_id == patient_id)\
                .count()
            
            return jsonify({
                "id": patient.id,
                "user_id": patient.user_id,
                "name": patient.name,
                "age": patient.age,
                "medical_history": patient.medical_history,
                "total_sessions": session_count,
                "created_at": patient.created_at.isoformat()
            }), 200
            
        except Exception as e:
            print(f"Error getting patient: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    @app.route("/api/patients/me", methods=["GET"])
    def get_current_patient():
        """
        Get current logged-in patient's profile.
        
        Uses session data from OAuth to find patient.
        
        Response (200 OK):
        {
            "id": 1,
            "user_id": "google_123456",
            "name": "John Doe",
            ...
        }
        """
        try:
            # Get user_id from session (set during OAuth login)
            user_id = session.get("user_id")
            
            if not user_id:
                return jsonify({"error": "Not authenticated"}), 401
            
            db = next(get_db())
            
            # Find patient by user_id
            patient = get_patient_by_user_id(db, user_id)
            
            if not patient:
                return jsonify({"error": "Patient profile not found. Please create one."}), 404
            
            # Count total sessions
            session_count = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.patient_id == patient.id)\
                .count()
            
            return jsonify({
                "id": patient.id,
                "user_id": patient.user_id,
                "name": patient.name,
                "age": patient.age,
                "medical_history": patient.medical_history,
                "total_sessions": session_count,
                "created_at": patient.created_at.isoformat()
            }), 200
            
        except Exception as e:
            print(f"Error getting current patient: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()

# ============================================================================
# SESSION MANAGEMENT ENDPOINTS
# ============================================================================

    @app.route("/api/sessions", methods=["POST"])
    def create_session():
        """
        Create a new rehabilitation session.
        
        Request body (JSON):
        {
            "patient_id": 1,
            "duration_minutes": 30,
            "notes": "Patient showed improvement in balance"
        }
        
        Response (201 Created):
        {
            "id": 1,
            "patient_id": 1,
            "session_date": "2024-01-15T14:30:00Z",
            "duration_minutes": 30,
            "poses_attempted": [],
            "overall_score": null
        }
        """
        try:
            db = next(get_db())
            data = request.get_json()
            
            # Validate required fields
            if not data.get("patient_id"):
                return jsonify({"error": "patient_id is required"}), 400
            
            # Verify patient exists
            patient = db.query(Patient).filter(Patient.id == data["patient_id"]).first()
            if not patient:
                return jsonify({"error": "Patient not found"}), 404
            
            # Create new session
            new_session = RehabilitationSession(
                patient_id=data["patient_id"],
                duration_minutes=data.get("duration_minutes"),
                notes=data.get("notes"),
                poses_attempted=[],
                overall_score=None
            )
            
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            
            return jsonify({
                "id": new_session.id,
                "patient_id": new_session.patient_id,
                "session_date": new_session.session_date.isoformat(),
                "duration_minutes": new_session.duration_minutes,
                "poses_attempted": new_session.poses_attempted,
                "overall_score": new_session.overall_score,
                "notes": new_session.notes
            }), 201
            
        except Exception as e:
            db.rollback()
            print(f"Error creating session: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    @app.route("/api/sessions/<int:session_id>", methods=["GET"])
    def get_session(session_id):
        """
        Get session details including all pose attempts and vitals.
        
        URL: /api/sessions/1
        
        Response (200 OK):
        {
            "id": 1,
            "patient_id": 1,
            "session_date": "2024-01-15T14:30:00Z",
            "duration_minutes": 30,
            "poses_attempted": ["Tree", "Warrior_II"],
            "overall_score": 85.5,
            "pose_attempts": [...],
            "vitals": [...]
        }
        """
        try:
            db = next(get_db())
            
            # Query session with related data
            rehab_session = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.id == session_id)\
                .first()
            
            if not rehab_session:
                return jsonify({"error": "Session not found"}), 404
            
            # Get all pose attempts for this session
            pose_attempts = db.query(PoseAttempt)\
                .filter(PoseAttempt.session_id == session_id)\
                .all()
            
            # Get all vitals for this session
            vitals = db.query(PhysiologicalMetric)\
                .filter(PhysiologicalMetric.session_id == session_id)\
                .all()
            
            return jsonify({
                "id": rehab_session.id,
                "patient_id": rehab_session.patient_id,
                "session_date": rehab_session.session_date.isoformat(),
                "duration_minutes": rehab_session.duration_minutes,
                "poses_attempted": rehab_session.poses_attempted,
                "overall_score": rehab_session.overall_score,
                "notes": rehab_session.notes,
                "pose_attempts": [
                    {
                        "id": attempt.id,
                        "pose_name": attempt.pose_name,
                        "confidence_score": attempt.confidence_score,
                        "joint_angles": attempt.joint_angles,
                        "corrections_given": attempt.corrections_given,
                        "timestamp": attempt.timestamp.isoformat()
                    }
                    for attempt in pose_attempts
                ],
                "vitals": [
                    {
                        "id": vital.id,
                        "heart_rate": vital.heart_rate,
                        "breathing_rate": vital.breathing_rate,
                        "stress_level": vital.stress_level,
                        "pain_level": vital.pain_level,
                        "timestamp": vital.timestamp.isoformat()
                    }
                    for vital in vitals
                ]
            }), 200
            
        except Exception as e:
            print(f"Error getting session: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    @app.route("/api/patients/<int:patient_id>/sessions", methods=["GET"])
    def get_patient_sessions_route(patient_id):
        """
        Get all sessions for a patient.
        
        URL: /api/patients/1/sessions?limit=10
        
        Query parameters:
        - limit: Maximum number of sessions to return (default: 10)
        
        Response (200 OK):
        {
            "patient_id": 1,
            "total_sessions": 15,
            "sessions": [...]
        }
        """
        try:
            db = next(get_db())
            
            # Get limit from query parameters
            limit = request.args.get("limit", 10, type=int)
            
            # Get sessions using helper function
            sessions = get_patient_sessions(db, patient_id, limit)
            
            # Count total sessions
            total = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.patient_id == patient_id)\
                .count()
            
            return jsonify({
                "patient_id": patient_id,
                "total_sessions": total,
                "sessions": [
                    {
                        "id": s.id,
                        "session_date": s.session_date.isoformat(),
                        "duration_minutes": s.duration_minutes,
                        "poses_attempted": s.poses_attempted,
                        "overall_score": s.overall_score,
                        "notes": s.notes
                    }
                    for s in sessions
                ]
            }), 200
            
        except Exception as e:
            print(f"Error getting patient sessions: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()

# Continue in next file...
