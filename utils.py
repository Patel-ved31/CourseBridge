import os

UPLOAD_FOLDER = "static/uploads/thumbnails"
UPLOAD_FOLDER_PROFILE = "static/uploads/profilePIC"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

# Credentials
EMAIL = "pved311206@gmail.com"
PASSWORD = "sswngwuuqotonmrj"

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS