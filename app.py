from flask import Flask
from flask_cors import CORS
import os
from utils import UPLOAD_FOLDER, UPLOAD_FOLDER_PROFILE

# Blueprints
from views import views_bp
from auth import auth_bp
from courses import courses_bp
from user import user_bp
from actions import actions_bp

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_PROFILE, exist_ok=True)

app = Flask(__name__)
CORS(app)

app.config["TEMPLATES_AUTO_RELOAD"] = True
app.secret_key = "coursebridge_secret"

# Register Blueprints
app.register_blueprint(views_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(courses_bp)
app.register_blueprint(user_bp)
app.register_blueprint(actions_bp)

if __name__ == "__main__":
    app.run(debug=True)



    
