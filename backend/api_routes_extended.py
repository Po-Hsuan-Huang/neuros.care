"""
API Routes for Pose Attempts, Vitals, and Analytics

This file contains additional API endpoints for:
- Saving pose attempt data
- Recording physiological metrics
- Getting progress analytics and trends

Import this along with api_routes.py in server.py
"""

from flask import request, jsonify
from sqlalchemy import func, desc
from database import get_db
from models import (
    Patient, RehabilitationSession, PoseAttempt,
    PhysiologicalMetric, ProgressMilestone,
    get_pose_progress
)
from datetime import datetime, timedelta
import traceback

def register_pose_and_analytics_routes(app):
    """
    Register pose attempt, vitals, and analytics routes.
    
    Call this in server.py:
        from api_routes_extended import register_pose_and_analytics_routes
        register_pose_and_analytics_routes(app)
    """
    
    # ========================================================================
    # POSE ATTEMPT ENDPOINTS
    # ========================================================================
    
    @app.route("/api/sessions/<int:session_id>/poses", methods=["POST"])
    def save_pose_attempt(session_id):
        """
        Save a pose attempt within a session.
        
        This should be called after each pose is evaluated by the AI model.
        
        Request body (JSON):
        {
            "pose_name": "Tree",
            "confidence_score": 85.5,
            "joint_angles": {
                "left_knee": 145,
                "right_knee": 142
            },
            "corrections_given": [
                "Straighten your back leg",
                "Lift your chest"
            ]
        }
        
        Response (201 Created):
        {
            "id": 1,
            "session_id": 1,
            "pose_name": "Tree",
            "confidence_score": 85.5,
            "timestamp": "2024-01-15T14:35:00Z"
        }
        """
        try:
            db = next(get_db())
            data = request.get_json()
            
            # Verify session exists
            rehab_session = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.id == session_id)\
                .first()
            
            if not rehab_session:
                return jsonify({"error": "Session not found"}), 404
            
            # Create pose attempt
            pose_attempt = PoseAttempt(
                session_id=session_id,
                pose_name=data.get("pose_name"),
                confidence_score=data.get("confidence_score"),
                joint_angles=data.get("joint_angles", {}),
                corrections_given=data.get("corrections_given", [])
            )
            
            db.add(pose_attempt)
            
            # Update session's poses_attempted list
            if data.get("pose_name") not in rehab_session.poses_attempted:
                rehab_session.poses_attempted.append(data.get("pose_name"))
            
            # Recalculate overall session score
            # Get all pose attempts for this session
            all_attempts = db.query(PoseAttempt)\
                .filter(PoseAttempt.session_id == session_id)\
                .all()
            
            # Calculate average confidence
            scores = [a.confidence_score for a in all_attempts if a.confidence_score is not None]
            scores.append(data.get("confidence_score", 0))
            
            if scores:
                rehab_session.overall_score = sum(scores) / len(scores)
            
            db.commit()
            db.refresh(pose_attempt)
            
            return jsonify({
                "id": pose_attempt.id,
                "session_id": pose_attempt.session_id,
                "pose_name": pose_attempt.pose_name,
                "confidence_score": pose_attempt.confidence_score,
                "joint_angles": pose_attempt.joint_angles,
                "corrections_given": pose_attempt.corrections_given,
                "timestamp": pose_attempt.timestamp.isoformat()
            }), 201
            
        except Exception as e:
            db.rollback()
            print(f"Error saving pose attempt: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    # ========================================================================
    # PHYSIOLOGICAL METRICS ENDPOINTS
    # ========================================================================
    
    @app.route("/api/sessions/<int:session_id>/vitals", methods=["POST"])
    def save_vitals(session_id):
        """
        Record physiological metrics during a session.
        
        Request body (JSON):
        {
            "heart_rate": 72,
            "breathing_rate": 14,
            "stress_level": 3,
            "pain_level": 2
        }
        
        Response (201 Created):
        {
            "id": 1,
            "session_id": 1,
            "heart_rate": 72,
            "timestamp": "2024-01-15T14:40:00Z"
        }
        """
        try:
            db = next(get_db())
            data = request.get_json()
            
            # Verify session exists
            rehab_session = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.id == session_id)\
                .first()
            
            if not rehab_session:
                return jsonify({"error": "Session not found"}), 404
            
            # Create vital signs record
            vitals = PhysiologicalMetric(
                session_id=session_id,
                heart_rate=data.get("heart_rate"),
                breathing_rate=data.get("breathing_rate"),
                stress_level=data.get("stress_level"),
                pain_level=data.get("pain_level"),
                additional_metrics=data.get("additional_metrics", {})
            )
            
            db.add(vitals)
            db.commit()
            db.refresh(vitals)
            
            return jsonify({
                "id": vitals.id,
                "session_id": vitals.session_id,
                "heart_rate": vitals.heart_rate,
                "breathing_rate": vitals.breathing_rate,
                "stress_level": vitals.stress_level,
                "pain_level": vitals.pain_level,
                "timestamp": vitals.timestamp.isoformat()
            }), 201
            
        except Exception as e:
            db.rollback()
            print(f"Error saving vitals: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    # ========================================================================
    # ANALYTICS & PROGRESS ENDPOINTS
    # ========================================================================
    
    @app.route("/api/patients/<int:patient_id>/progress", methods=["GET"])
    def get_progress_analytics(patient_id):
        """
        Get comprehensive progress analytics for a patient.
        
        This endpoint provides:
        - Overall statistics (total sessions, average score, etc.)
        - Pose-specific progress
        - Recent milestones
        - Improvement trends
        
        Response (200 OK):
        {
            "patient_id": 1,
            "total_sessions": 15,
            "average_score": 78.5,
            "poses_mastered": ["Tree", "Warrior_II"],
            "recent_milestones": [...],
            "improvement_trend": "improving"
        }
        """
        try:
            db = next(get_db())
            
            # Verify patient exists
            patient = db.query(Patient).filter(Patient.id == patient_id).first()
            if not patient:
                return jsonify({"error": "Patient not found"}), 404
            
            # Get all sessions
            sessions = db.query(RehabilitationSession)\
                .filter(RehabilitationSession.patient_id == patient_id)\
                .all()
            
            # Calculate overall statistics
            total_sessions = len(sessions)
            scores = [s.overall_score for s in sessions if s.overall_score is not None]
            average_score = sum(scores) / len(scores) if scores else 0
            
            # Get all unique poses attempted
            all_poses = set()
            for s in sessions:
                all_poses.update(s.poses_attempted)
            
            # Determine poses mastered (average confidence >= 85)
            poses_mastered = []
            for pose_name in all_poses:
                attempts = get_pose_progress(db, patient_id, pose_name)
                pose_scores = [a.confidence_score for a in attempts if a.confidence_score is not None]
                if pose_scores and sum(pose_scores) / len(pose_scores) >= 85:
                    poses_mastered.append(pose_name)
            
            # Get recent milestones
            milestones = db.query(ProgressMilestone)\
                .filter(ProgressMilestone.patient_id == patient_id)\
                .order_by(desc(ProgressMilestone.achieved_date))\
                .limit(5)\
                .all()
            
            # Calculate improvement trend
            # Compare first 3 sessions vs last 3 sessions
            if len(scores) >= 6:
                first_three = sum(scores[:3]) / 3
                last_three = sum(scores[-3:]) / 3
                if last_three > first_three + 5:
                    trend = "improving"
                elif last_three < first_three - 5:
                    trend = "declining"
                else:
                    trend = "stable"
            else:
                trend = "insufficient_data"
            
            return jsonify({
                "patient_id": patient_id,
                "total_sessions": total_sessions,
                "average_score": round(average_score, 1),
                "total_poses_attempted": len(all_poses),
                "poses_mastered": poses_mastered,
                "recent_milestones": [
                    {
                        "id": m.id,
                        "type": m.milestone_type,
                        "description": m.description,
                        "achieved_date": m.achieved_date.isoformat()
                    }
                    for m in milestones
                ],
                "improvement_trend": trend
            }), 200
            
        except Exception as e:
            print(f"Error getting progress analytics: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
    
    @app.route("/api/patients/<int:patient_id>/trends", methods=["GET"])
    def get_improvement_trends(patient_id):
        """
        Get detailed improvement trends over time.
        
        Query parameters:
        - pose: Filter by specific pose (optional)
        - days: Number of days to look back (default: 30)
        
        Response (200 OK):
        {
            "patient_id": 1,
            "pose": "Tree",
            "data_points": [
                {
                    "date": "2024-01-15",
                    "average_score": 82.5,
                    "attempts": 3
                },
                ...
            ]
        }
        """
        try:
            db = next(get_db())
            
            # Get query parameters
            pose_filter = request.args.get("pose")
            days = request.args.get("days", 30, type=int)
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Query pose attempts within date range
            query = db.query(PoseAttempt)\
                .join(RehabilitationSession)\
                .filter(RehabilitationSession.patient_id == patient_id)\
                .filter(PoseAttempt.timestamp >= start_date)
            
            if pose_filter:
                query = query.filter(PoseAttempt.pose_name == pose_filter)
            
            attempts = query.order_by(PoseAttempt.timestamp.asc()).all()
            
            # Group by date and calculate daily averages
            daily_data = {}
            for attempt in attempts:
                date_key = attempt.timestamp.date().isoformat()
                if date_key not in daily_data:
                    daily_data[date_key] = {"scores": [], "count": 0}
                
                if attempt.confidence_score is not None:
                    daily_data[date_key]["scores"].append(attempt.confidence_score)
                    daily_data[date_key]["count"] += 1
            
            # Format response
            data_points = []
            for date_str, data in sorted(daily_data.items()):
                avg_score = sum(data["scores"]) / len(data["scores"]) if data["scores"] else 0
                data_points.append({
                    "date": date_str,
                    "average_score": round(avg_score, 1),
                    "attempts": data["count"]
                })
            
            return jsonify({
                "patient_id": patient_id,
                "pose": pose_filter or "all",
                "days": days,
                "data_points": data_points
            }), 200
            
        except Exception as e:
            print(f"Error getting trends: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
