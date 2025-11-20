from flask import Blueprint, redirect, url_for, render_template_string
from flask_dance.contrib.google import make_google_blueprint, google
import os

# --- Configuration (Define outside this file or use environment variables!) ---
# You need a secure place to store these, e.g., in a config file or .env
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", "YOUR_CLIENT_ID_HERE")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", "YOUR_CLIENT_SECRET_HERE")

# Create the Blueprint
# Note: Use a short, unique name for the Blueprint instance, e.g., 'auth'
auth_bp = Blueprint('auth', __name__)

# Create the Google OAuth blueprint and attach it to the main auth_bp
google_bp = make_google_blueprint(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    scope=["profile", "email"],
    redirect_to="auth.welcome" # IMPORTANT: Must use 'blueprint_name.function_name'
)

# Register the Google blueprint with your main auth blueprint
auth_bp.register_blueprint(google_bp, url_prefix="/google")


@auth_bp.route("/")
def index():
    # This route is now accessed via /auth/
    if not google.authorized:
        # The login URL is now 'google.login' because google_bp is nested under /login/google
        return render_template_string(
            '<a href="{{ url_for("google.login") }}">Login with Google</a>'
        )
    # Redirect to the welcome page if already authorized
    return redirect(url_for("auth.welcome"))


@auth_bp.route("/welcome")
def welcome():
    # This function is called after successful login.
    if not google.authorized:
        return redirect(url_for("google.login"))
    
    # Logic to fetch user data and process registration/login
    resp = google.get("/oauth2/v2/userinfo")
    # ... (Database logic from previous example goes here) ...
    
    if resp.ok:
        user_info = resp.json()
        name = user_info.get("name")
        email = user_info.get("email")
        return f"<h1>Auth Successful!</h1><p>Welcome, {name} ({email})!</p>"
    
    return "Failed to fetch user data.", 500

# You will not run app.run() here.