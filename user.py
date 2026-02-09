from flask import Blueprint, request, jsonify, render_template, session
import os
from werkzeug.utils import secure_filename
from db import get_db
from utils import UPLOAD_FOLDER_PROFILE, allowed_file

user_bp = Blueprint('user', __name__)

@user_bp.route("/Home" , methods=["GET"])
def Home():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT t1.username , t2.creator_id FROM subscription as t2 INNER JOIN users as t1 ON t1.id = t2.creator_id where t2.user_id = %s", (session["id"],))
    subscriptions = cursor.fetchall()
    conn.close()
    if(session["username"] and session["role"] and session["id"] and session["profile_pic"] ) :
        return render_template("Home.html" , name=session["username"] , id = session["id"] , role = session["role"] , subscriptions=subscriptions)

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
            filename = secure_filename(f"{user_id}.png")
            file.save(os.path.join(UPLOAD_FOLDER_PROFILE, filename))
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET profile_pic = %s WHERE id = %s", (filename, user_id))
            conn.commit()
            conn.close()
            session["profile_pic"] = filename
            return jsonify({"message": "True"})
        except Exception as e: return jsonify({"message": "Error uploading file"})
    return jsonify({"message": "Invalid file type"})

@user_bp.route("/deleteAccount" , methods=["POST"])
def deleteAccount():
    conn = get_db()
    cursor = conn.cursor()
    for table in ["users", "courses", "bookmarks", "review", "subscription"]:
        col = "creator_id" if table == "courses" else "user_id" if table != "users" else "id"
        cursor.execute(f"DELETE FROM {table} WHERE {col} = %s", (session["id"],))
    conn.commit(); conn.close(); session.clear()
    return jsonify({"message": "True"})