from flask import Blueprint, request, jsonify, session
from db import get_db

actions_bp = Blueprint('actions', __name__)

@actions_bp.route("/add-bookmark" , methods=["POST"])
def add_bookmark():
    course_id = request.json["course_id"]
    user_id = session["id"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO bookmarks (user_id, course_id) VALUES (%s, %s)", (user_id, course_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Course bookmarked successfully ✅"})

@actions_bp.route("/remove-bookmark" , methods=["POST"])
def remove_bookmark():
    course_id = request.json["course_id"]
    user_id = session["id"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bookmarks WHERE user_id = %s AND course_id = %s", (user_id, course_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Bookmark removed successfully ✅"})

@actions_bp.route("/sub" , methods=["POST"])
def sub():
    creator_id = request.json["creator_id"]
    user_id = session["id"]
    if int(creator_id) == int(user_id): return jsonify({"message": "You cannot subscribe to your own account"})
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO subscription (user_id, creator_id) VALUES (%s, %s)", (user_id, creator_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "subscription done"})

@actions_bp.route("/unsub" , methods=["POST"])
def unsub():
    creator_id = request.json["creator_id"]
    user_id = session["id"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subscription WHERE user_id = %s AND creator_id =%s", (user_id, creator_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "unsubscription done"})

@actions_bp.route("/submit-review", methods=["POST"])
def submit_review():
    course_id = request.json["course_id"]
    rating = request.json["rating"]
    comment = request.json["comment"]
    user_id = session["id"]
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO review (user_id, course_id, rating, comment) VALUES (%s, %s, %s, %s)", (user_id, course_id, rating, comment))
    conn.commit()
    conn.close()
    return jsonify({"message": "Review submitted successfully ✅"})