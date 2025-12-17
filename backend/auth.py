from flask import Blueprint, redirect, url_for, session, jsonify
from flask_dance.contrib.google import make_google_blueprint, google
import os
from dotenv import load_dotenv
from flask_dance.consumer.storage.session import SessionStorage


# --- Configuration (Define outside this file or use environment variables!) ---
# You need a secure place to store these, e.g., in a config file or .env
load_dotenv()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
ENV = os.getenv("FLASK_ENV", "production")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000" if ENV=="development" else "https://neuros.care")
print(FRONTEND_URL)
print(GOOGLE_CLIENT_ID)
print(GOOGLE_CLIENT_SECRET)
# Create the Blueprint
# Note: Use a short, unique name for the Blueprint instance, e.g., 'auth'
auth_bp = Blueprint('auth', __name__)

# Create the Google OAuth blueprint and attach it to the main auth_bp
google_bp = make_google_blueprint(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    scope=["openid", "https://www.googleapis.com/auth/userinfo.email",
                     "https://www.googleapis.com/auth/userinfo.profile"],
    redirect_to="auth.google_authorized",
    login_url="/google_login"
)

# Register the Google blueprint with your main auth blueprint
auth_bp.register_blueprint(google_bp,url_prefix="/login")



@auth_bp.route('/google_login')
def google_login():

    # If not logged in with Google, start the OAuth dance
    if not google.authorized:  # Flask-Dance style.[web:16]
        return redirect(url_for("auth.google.login"))   # <‑‑ key line
    # If already authorized, just go to the callback/handler
    return redirect(url_for("auth.google_authorized", _external=True))


@auth_bp.route("/google_authorized")
def google_authorized():
    if not google.authorized:
        return redirect(url_for("auth.google_login"))

    # Get userinfo from Google
    try:
        resp = google.get("/oauth2/v2/userinfo")  # works with email+profile scopes [web:13]
        if not resp.ok:
            return redirect(f"{FRONTEND_URL}/login")
    except Exception as e:
        for key in list(session.keys()):
                    if 'google' in key or 'oauth' in key or 'token' in key:
                        session.pop(key, None)
        return redirect(url_for("auth.google_login"))

    data = resp.json()
    user = {
        "username": data.get("name") or data.get("given_name"),
        "email": data.get("email"),
    }
    # store in Flask session so /api/current_user can see it
    session["user"] = user

    # send user data to frontend
    return redirect(f"{FRONTEND_URL}/auth/callback")
    

@auth_bp.route("/api/current_user")
def current_user():
    user = session.get("user")
    if not user:
        return jsonify({"user": None}), 200
    return jsonify({"user": user}), 200
# You will not run app.run() here.