from flask import Blueprint, request, jsonify, render_template, session
import os
from werkzeug.utils import secure_filename
from db import get_db
from utils import UPLOAD_FOLDER, allowed_file

courses_bp = Blueprint('courses', __name__)

@courses_bp.route("/courses", methods=["GET"])
def get_courses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, category, price, thumbnail FROM courses ORDER BY created_at DESC")

    courses = cursor.fetchall()
    conn.close()

    course_list = [{"id": c[0], "title": c[1], "description": c[2], "category": c[3], "price": c[4], "thumbnail": c[5]} for c in courses]

    return jsonify(course_list)

@courses_bp.route("/search")
def search():
    quary = request.args.get("q")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM courses WHERE title ILIKE %s", ( "%" + quary + "%"  ,))
    result = [row[0] for row in cursor.fetchall() ]
    conn.close()
    return jsonify(result)

@courses_bp.route("/categoryList")
def categoryList():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""SELECT t1.username , t2.creator_id 
                   FROM subscription as t2 INNER JOIN users as t1 
                   ON t1.id = t2.creator_id where t2.user_id = %s""",
                     (session["id"],))
    
    subscriptions = cursor.fetchall()
    category = request.args.get("category")

    cursor.execute("""SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id 
                   FROM courses as t2 INNER JOIN users as t1 
                   on t1.id = t2.creator_id WHERE t2.category ILIKE %s""", 
                   ("%" + category + "%" ,))

    courses = cursor.fetchall()

    cursor.execute("SELECT course_id FROM bookmarks where user_id = %s", (session["id"],))

    bookmarks = cursor.fetchall()
    conn.close()

    return render_template("courseList.html", courses=courses, bookmarks=[b[0] for b in bookmarks], subscriptions=subscriptions)

@courses_bp.route("/courseList")
def courseList():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""SELECT t1.username , t2.creator_id 
                   FROM subscription as t2 INNER JOIN users as t1 
                   ON t1.id = t2.creator_id where t2.user_id = %s""", 
                   (session["id"],))

    subscriptions = cursor.fetchall()
    query = request.args.get("course")

    cursor.execute("SELECT category FROM courses WHERE title ILIKE %s", (query,))
    exact_match = cursor.fetchone()

    if exact_match:

        category = exact_match[0]

        cursor.execute("""SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id 
                       FROM courses as t2 INNER JOIN users as t1 
                       on t1.id = t2.creator_id WHERE t2.category = %s OR t2.title ILIKE %s ORDER BY CASE WHEN t2.title ILIKE %s THEN 0 ELSE 1 END""",
                         (category, "%" + query + "%", "%" + query + "%"))
    else:
        cursor.execute("""SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id 
                       FROM courses as t2 INNER JOIN users as t1 
                       on t1.id = t2.creator_id WHERE t2.title ILIKE %s OR t2.description ILIKE %s OR t2.category ILIKE %s""", 
                       ("%" + query + "%" , "%" + query + "%", "%" + query + "%"))
        
    courses = cursor.fetchall()

    cursor.execute("SELECT course_id FROM bookmarks where user_id = %s", (session["id"],))
    bookmarks = cursor.fetchall()
    conn.close()

    return render_template("courseList.html" , courses = courses , bookmarks=[b[0] for b in bookmarks],subscriptions=subscriptions)

@courses_bp.route("/all_courses")
def all_courses():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT t1.username , t2.creator_id FROM subscription as t2 INNER JOIN users as t1 ON t1.id = t2.creator_id where t2.user_id = %s", (session["id"],))

    subscriptions = cursor.fetchall()

    cursor.execute("SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id FROM courses as t2 INNER JOIN users as t1 on t1.id = t2.creator_id")

    courses = cursor.fetchall()

    cursor.execute("SELECT course_id FROM bookmarks where user_id = %s", (session["id"],))
    bookmarks = cursor.fetchall()
    conn.close()

    return render_template("courseList.html" , courses = courses , bookmarks=[b[0] for b in bookmarks],subscriptions=subscriptions)

@courses_bp.route("/add-course", methods=["POST"])
def add_course():
    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    price = request.form.get("price")
    image = request.files.get("thumbnail")
    link = request.form.get("link")

    if not image or image.filename == "": 
        return jsonify({"message": "No image selected"}), 400
    if not allowed_file(image.filename): 
        return jsonify({"message": "Invalid image type"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("INSERT INTO courses (creator_id , title, description, category, price , course_link) VALUES (%s , %s, %s, %s, %s , %s) RETURNING id", (session["id"] ,title, description, category, price , link))
    
    course_id = cursor.fetchone()[0]

    filename = secure_filename(f"{course_id}.png")
    image.save(os.path.join(UPLOAD_FOLDER, filename))
    cursor.execute("UPDATE courses SET thumbnail = %s WHERE id = %s", (filename, course_id))

    conn.commit()
    conn.close()
    return jsonify({"message": "Course added successfully ✅"})

@courses_bp.route("/delete-course", methods=["POST"])
def deleteCourse():

    course_id = request.json["course_id"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM courses WHERE id = %s", (course_id,))
    conn.commit()

    cursor.execute("DELETE FROM bookmarks WHERE course_id = %s", (course_id,))
    conn.commit()

    cursor.execute("DELETE FROM review WHERE course_id = %s", (course_id,))
    conn.commit()

    conn.close()
    return jsonify({"message": "True"})

@courses_bp.route("/fullCoursePage")
def full_course():

    course_id = request.args.get("course_id")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""SELECT t1.username , t2.title , t2.description , t2.category , t2.price , t2.thumbnail , t2.course_link,t2.creator_id 
                   FROM courses as t2 INNER JOIN users as t1 
                   on t1.id = t2.creator_id WHERE t2.id = %s""", 
                   (course_id,))
    
    course = cursor.fetchone()
    
    already_sub = False

    cursor.execute("""SELECT t1.user_id , t1.creator_id 
                   FROM subscription as t1 INNER JOIN courses as t2 
                   ON t1.creator_id = t2.creator_id WHERE t1.user_id = %s AND t2.id = %s""",
                     (session["id"] , course_id))
    
    if cursor.fetchone(): already_sub = True

    cursor.execute("SELECT id FROM bookmarks WHERE user_id = %s AND course_id = %s", (session.get("id"),course_id))

    is_bookmarked = True if cursor.fetchone() else False

    cursor.execute("""SELECT t1.username , t2.rating , t2.comment , t1.profile_pic 
                   FROM review as t2 INNER JOIN users as t1 
                   on t1.id = t2.user_id WHERE t2.course_id = %s AND t1.id = %s""", 
                   (course_id,session["id"]))
    
    user_review = cursor.fetchall()

    already_review = True if user_review else False

    review_details = user_review[0] if user_review else None

    user_photo = str(session["id"]) + ".png" if user_review else None

    cursor.execute("""SELECT t1.username , t2.rating , t2.comment , t1.profile_pic 
                   FROM review as t2 INNER JOIN users as t1 
                   on t1.id = t2.user_id WHERE t2.course_id = %s AND t1.id != %s""", 
                   (course_id,session["id"]))
    
    reviews = cursor.fetchall()
    conn.close()

    return render_template("fullCoursePage.html", creator_name=course[0], title=course[1], description=course[2], category=course[3], price=course[4], thumbnail=course[5], course_link=course[6], is_bookmarked=is_bookmarked, reviews=reviews, course_id=course_id, user_review=review_details, already_review = already_review, creator_id=str(course[7]), user_photo=user_photo, already_subscription = already_sub)

@courses_bp.route("/creatorCourse")
def creator_course():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT t1.username , t2.creator_id FROM subscription as t2 INNER JOIN users as t1 ON t1.id = t2.creator_id where t2.user_id = %s", (session["id"],))

    subscriptions = cursor.fetchall()
    creator = request.args.get("creator")
    
    cursor.execute("""SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id 
                   FROM courses as t2 INNER JOIN users as t1 
                   on t1.id = t2.creator_id WHERE t2.creator_id = %s""", (creator ,))
    
    courses = cursor.fetchall()
    cursor.execute("SELECT course_id FROM bookmarks where user_id = %s", (session["id"],))
    
    bookmarks = cursor.fetchall()
    conn.close()
    
    return render_template("courseList.html" , courses = courses , bookmarks=[b[0] for b in bookmarks],subscriptions=subscriptions)