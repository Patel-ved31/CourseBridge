from flask import Blueprint, request, jsonify, render_template, session
import random
import smtplib
import os
from werkzeug.utils import secure_filename
from db import get_db
from utils import EMAIL, PASSWORD, UPLOAD_FOLDER_PROFILE, allowed_file

auth_bp = Blueprint('auth', __name__)

saved_otp = ""

@auth_bp.route("/select_account")
def select_account():
    return render_template("account_Select.html")

@auth_bp.route("/login")
def login():
    return render_template("login.html")

@auth_bp.route("/signUp")
def signUp():
    return render_template("signUp.html")

@auth_bp.route("/set-details" , methods=["POST"])
def set_details() :
    name = request.json["username"]
    id = request.json["id"]
    role = request.json["role"]
    profile_pic = request.json["profile_pic"]

    session["username"] = name
    session["id"] = id
    session["role"] = role
    session["profile_pic"] = profile_pic

    return jsonify({"success": True, "message": "✅ Login successful" , "id": id , "username": name , "role": role , "profile_pic": profile_pic})

@auth_bp.route("/check-details" , methods=["POST"])
def check_user() :
    username = request.json["username"]
    password = request.json["password"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE username = %s AND password = %s",
        (username, password)
    )

    user = cursor.fetchone()
    conn.close()

    if user:
        session["username"] = user[1]
        session["id"] = user[0]
        session["role"] = user[4]
        session["profile_pic"] = user[5]
        return jsonify({"success": True, "message": "✅ Login successful" , "id": user[0] , "username": user[1] , "role": user[4] , "profile_pic": user[5]})
    else:
        return jsonify({"success": False, "message": "❌ Invalid username or password"})

@auth_bp.route("/check-email" , methods=["POST"] )
def check_email() :
    email = request.json["email"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"success": False, "message": "Email already exists"})
    else:
        return jsonify({"success": True, "message": "Email available"})

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    global saved_otp
    data = request.get_json()
    email = data.get("email")
    saved_otp = str(random.randint(100000, 999999))
    print(saved_otp)

    message = f"Your OTP is {saved_otp}"
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.sendmail(EMAIL, email, message)

    return jsonify({"message": "success"})

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    otp = request.json["otp"]
    if otp == saved_otp:
        return jsonify({"message": "true"})
    return jsonify({"message": "false"})

@auth_bp.route("/register" , methods=["POST"])
def submit():
    name = request.form.get("username")
    password = request.form.get("password")
    email = request.form.get("email")
    role = request.form.get("role")
    profile = request.files.get("profile")

    if not profile or profile.filename == "":
        return jsonify({"message": "No image selected"}), 400
    if not allowed_file(profile.filename):
        return jsonify({"message": "Invalid image type"}), 400
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s) RETURNING id", (name, email, password, role))
        user_id = cursor.fetchone()[0]
        filename = secure_filename(f"{user_id}.png")
        profile.save(os.path.join(UPLOAD_FOLDER_PROFILE, filename))
        cursor.execute("UPDATE users SET profile_pic = %s WHERE id = %s", (filename, user_id))
        conn.commit()
        session["username"] = name; session["id"] = user_id; session["role"] = role; session["profile_pic"] = filename
        return jsonify({"message": True , "id": user_id , "username": name , "role": role , "profile_pic": filename})
    except Exception: return jsonify({"message": False})
    finally: conn.close()