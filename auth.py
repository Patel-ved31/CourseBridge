from flask import Blueprint, request, jsonify, render_template, session
import random
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from werkzeug.utils import secure_filename
from db import get_db
from utils import EMAIL, PASSWORD, allowed_file
from supabase import create_client, Client

auth_bp = Blueprint('auth', __name__)

SUPABASE_URL = "https://kjuxgzwxpkholakapbhi.supabase.co" 
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdXhnend4cGtob2xha2FwYmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzUwMTEsImV4cCI6MjA4NzA1MTAxMX0.AUSLyH-NEf91QcFGdfQ8RtLyALhnpL7TlBdJenSzhE4" 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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



# ==================================================================
# account_select.html
@auth_bp.route("/set-details" , methods=["POST"])  
def set_details() :
    name = request.json["username"]
    id = request.json["id"]
    role = request.json["role"]
    profile_pic = request.json["profile_pic"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM deletedUser WHERE user_id = %s", (id,))
    if cursor.fetchone():
        return jsonify( {"success" : False , "message" : "This account has been deleted by admin due to some reasons"} )
    
    cursor.execute("SELECT * FROM users WHERE username = %s and id = %s", (name,id))
    if not cursor.fetchone():
        return jsonify( {"success" : False , "message" : "this account does not exist"} )
    
    conn.close()

    session["username"] = name
    session["id"] = id
    session["role"] = role
    session["profile_pic"] = profile_pic

    return jsonify({"success": True, "message": "✅ Login successful" , "id": id , "username": name , "role": role , "profile_pic": profile_pic})



















# ==================================================================
# login.html
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

















# ==================================================================
# signUp.html
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

    msg = MIMEMultipart()
    msg['From'] = EMAIL
    msg['To'] = email
    msg['Subject'] = "CourseBridge Verification OTP"

    html_content = f"""
    <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #a855f7; text-align: center;">CourseBridge</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for verification is:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 6px; margin: 20px 0;">{saved_otp}</div>
        <p style="font-size: 14px; color: #666;">This code is valid for a short time. Please do not share it with anyone.</p>
    </div>
    """
    msg.attach(MIMEText(html_content, 'html'))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.sendmail(EMAIL, email, msg.as_string())

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

       
        file_path = f"public/{user_id}.png"
        
        
        profile.seek(0) 
        supabase.storage.from_("profile-pictures").upload(
            file=profile.read(),
            path=file_path,
            file_options={"content-type": profile.content_type, "upsert": "true"} # Overwrite if exists
        )

       
        public_url = supabase.storage.from_("profile-pictures").get_public_url(file_path)

        cursor.execute("UPDATE users SET profile_pic = %s WHERE id = %s", (public_url, user_id))

        conn.commit()

        session["username"] = name; session["id"] = user_id; session["role"] = role; session["profile_pic"] = public_url
        
        return jsonify({"message": True , "id": user_id , "username": name , "role": role , "profile_pic": public_url})
    except Exception: return jsonify({"message": False})
    finally: conn.close()