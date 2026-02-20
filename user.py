from flask import Blueprint, request, jsonify, render_template, session
import os
from werkzeug.utils import secure_filename
from db import get_db
from utils import allowed_file
from supabase import create_client, Client

user_bp = Blueprint('user', __name__)


SUPABASE_URL = "https://kjuxgzwxpkholakapbhi.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdXhnend4cGtob2xha2FwYmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzUwMTEsImV4cCI6MjA4NzA1MTAxMX0.AUSLyH-NEf91QcFGdfQ8RtLyALhnpL7TlBdJenSzhE4"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)







# ==================================================================
# Home.html
@user_bp.route("/Home" , methods=["GET"])
def Home():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT t1.username , t2.creator_id FROM subscription as t2 INNER JOIN users as t1 ON t1.id = t2.creator_id where t2.user_id = %s", (session["id"],))
    subscriptions = cursor.fetchall()
    conn.close()
    if(session["username"] and session["role"] and session["id"] and session["profile_pic"] ) :
        return render_template("Home.html" , name=session["username"] , id = session["id"] , role = session["role"] , subscriptions=subscriptions)











# ==================================================================
# creator_profile.html
@user_bp.route("/creator_profile")
def creator_profile():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT t1.username , t2.creator_id FROM subscription as t2 INNER JOIN users as t1 ON t1.id = t2.creator_id where t2.user_id = %s", (session["id"],))
    subscriptions = cursor.fetchall()
    cursor.execute("SELECT * FROM courses WHERE creator_id = %s", (session["id"],))
    courses = cursor.fetchall()
    cursor.execute("SELECT t1.username , t1.id  , t2.title , t2.price , t2.thumbnail , t2.id FROM courses as t2 INNER JOIN users as t1 on t1.id = t2.creator_id INNER JOIN bookmarks as t3 on t3.course_id = t2.id WHERE t3.user_id = %s", (session["id"],))
    bookmarks = cursor.fetchall()
    conn.close()
    return render_template("creator_profile.html" , name=session["username"] , courses =courses , bookmarks=bookmarks,profile=session["profile_pic"],subscriptions=subscriptions)













# ==================================================================
# learner_profile.html
@user_bp.route("/learner_profile")
def learner_profile():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT t1.username , t2.creator_id FROM subscription as t2 INNER JOIN users as t1 ON t1.id = t2.creator_id where t2.user_id = %s", (session["id"],))

    subscriptions = cursor.fetchall()

    cursor.execute("SELECT t1.username , t1.id  , t2.title , t2.price , t2.thumbnail , t2.id FROM courses as t2 INNER JOIN users as t1 on t1.id = t2.creator_id INNER JOIN bookmarks as t3 on t3.course_id = t2.id WHERE t3.user_id = %s", (session["id"],))

    bookmarks = cursor.fetchall()

    conn.close()
    return render_template("learner_profile.html" , name=session["username"] , bookmarks=bookmarks,profile=session["profile_pic"],subscriptions=subscriptions)











# ==================================================================
# account.html
@user_bp.route("/manageAcc")
def manageAcc():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT password , email FROM users WHERE id = %s", (session["id"],))
    details=cursor.fetchone()

    conn.close()
    return render_template("account.html" , username=session["username"], password = details[0], profile_pic = session["profile_pic"], email = details[1], role = session["role"])

@user_bp.route("/changeName" , methods=["POST"])
def changeName():
    name = request.json["newName"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * from users where username = %s", (name , ))

    if cursor.fetchone() : return  jsonify({"message": "UserName Not available"})

    cursor.execute("UPDATE users SET username = %s WHERE id = %s", (name , session["id"]))

    conn.commit()
    conn.close()

    session["username"] = name
    return  jsonify({"message": "True"})

@user_bp.route("/changePass" , methods=["POST"])
def changePass():
    password = request.json["newPass"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * from users where password = %s", (password , ))

    if cursor.fetchone() : return  jsonify({"message": "Passworde Not available"})

    cursor.execute("UPDATE users SET password = %s WHERE id = %s", (password , session["id"]))

    conn.commit()
    conn.close()
    return  jsonify({"message": "True"})

@user_bp.route("/changeProfilePic", methods=["POST"])
def changeProfilePic():
    if 'profile_pic' not in request.files: return jsonify({"message": "No file part"})
    file = request.files['profile_pic']

    if file.filename == '': return jsonify({"message": "No selected file"})

    if file and allowed_file(file.filename):
        try:
            user_id = session["id"]
            
            file_path = f"public/{user_id}.png"
            file.seek(0)
            supabase.storage.from_("profile-pictures").upload(
                file=file.read(),
                path=file_path,
                file_options={"content-type": file.content_type, "upsert": "true"}
            )
            public_url = supabase.storage.from_("profile-pictures").get_public_url(file_path)

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET profile_pic = %s WHERE id = %s", (public_url, user_id))

            conn.commit()
            conn.close()
            session["profile_pic"] = public_url
            return jsonify({"message": "True"})
        except Exception as e: 
            return jsonify({"message": f"Error uploading file: {e}"})
    return jsonify({"message": "Invalid file type"})

@user_bp.route("/deleteAccount" , methods=["POST"])
def deleteAccount():
    conn = get_db()
    cursor = conn.cursor()
    user_id = session["id"]

    try:
        
        
        profile_pic_path = f"public/{user_id}.png"
        supabase.storage.from_("profile-pictures").remove([profile_pic_path])

        
        
        cursor.execute("SELECT id FROM courses WHERE creator_id = %s", (user_id,))
        courses_to_delete = cursor.fetchall()
        if courses_to_delete:
            thumbnail_paths = [f"public/{course[0]}.png" for course in courses_to_delete]
            supabase.storage.from_("course-thumbnails").remove(thumbnail_paths)

        cursor.execute("DELETE FROM reports WHERE course_id IN (SELECT id FROM courses WHERE creator_id = %s)", (user_id,))
        cursor.execute("DELETE FROM review WHERE course_id IN (SELECT id FROM courses WHERE creator_id = %s)", (user_id,))
        cursor.execute("DELETE FROM bookmarks WHERE course_id IN (SELECT id FROM courses WHERE creator_id = %s)", (user_id,))

        
        cursor.execute("DELETE FROM reports WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM review WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM bookmarks WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM subscription WHERE user_id = %s OR creator_id = %s", (user_id, user_id))
        
        cursor.execute("DELETE FROM courses WHERE creator_id = %s", (user_id,))
        
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
    finally:
        conn.close()
        session.clear()
    return jsonify({"message": "True"})