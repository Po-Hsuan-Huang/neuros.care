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
    scope=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
    redirect_to="auth.welcome" # IMPORTANT: Must use 'blueprint_name.function_name'
)

# Register the Google blueprint with your main auth blueprint
auth_bp.register_blueprint(google_bp)


@auth_bp.route("/")
@auth_bp.route("/")
def index():
    # Simple landing page with a clear login prompt
    return render_template_string(
        """
        <html>
            <head><title>Login</title></head>
            <body style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial;'>
                <h2>Login with Google</h2>
                <a href='{{ url_for('auth.google.login') }}' style='padding:10px 20px;background:#4285F4;color:white;border-radius:5px;text-decoration:none;'>
                    Sign in with Google
                </a>
                <p>After signing in you will be redirected to the welcome page.</p>
            </body>
        </html>
        """
    )



@auth_bp.route("/welcome")
def welcome():
    # This function is called after successful login.
    if not google.authorized:
        return redirect(url_for("auth.google.login"))
    
    # Logic to fetch user data and process registration/login
    resp = google.get("/oauth2/v2/userinfo")
    # ... (Database logic from previous example goes here) ...
    
    if resp.ok:
        user_info = resp.json()
        name = user_info.get("name")
        email = user_info.get("email")
        # Store username in session for frontend consumption
        from flask import session
        session["username"] = name
        # Redirect to React app entry point
        return redirect(url_for("http://dev.neuros.care"))
    
    return "Failed to fetch user data.", 500

# You will not run app.run() here.