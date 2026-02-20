from flask import Blueprint, request, jsonify, render_template, session
import os
from werkzeug.utils import secure_filename
from db import get_db
from utils import allowed_file
from supabase import create_client, Client

courses_bp = Blueprint('courses', __name__)

SUPABASE_URL = "https://kjuxgzwxpkholakapbhi.supabase.co" 
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqdXhnend4cGtob2xha2FwYmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzUwMTEsImV4cCI6MjA4NzA1MTAxMX0.AUSLyH-NEf91QcFGdfQ8RtLyALhnpL7TlBdJenSzhE4"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@courses_bp.route("/courses", methods=["GET"])
def get_courses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, category, price, thumbnail FROM courses ORDER BY created_at DESC")

    courses = cursor.fetchall()
    conn.close()

    course_list = [{"id": c[0], "title": c[1], "description": c[2], "category": c[3], "price": c[4], "thumbnail": c[5]} for c in courses]

    return jsonify(course_list)






# ==================================================================
# Home.html 
#  courseList.html 
#  fullcoursepage.html
@courses_bp.route("/search")
def search():
    quary = request.args.get("q")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT title FROM courses WHERE title ILIKE %s", ( "%" + quary + "%"  ,))
    result = [row[0] for row in cursor.fetchall() ]
    conn.close()
    return jsonify(result)








#====================================================================
# Home.html

# serach By category
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

# search by course
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

# go to all course
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














#==================================================================
# creator_profile.html

# to add course
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

    file_path = f"public/{course_id}.png"

   
    image.seek(0) 
    supabase.storage.from_("course-thumbnails").upload(
        file=image.read(),
        path=file_path,
        file_options={"content-type": image.content_type, "upsert": "true"} # Overwrite if exists
    )

    public_url = supabase.storage.from_("course-thumbnails").get_public_url(file_path)
    cursor.execute("UPDATE courses SET thumbnail = %s WHERE id = %s", (public_url, course_id))

    conn.commit()
    conn.close()
    return jsonify({"message": "Course added successfully ✅"})

# delete course
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

    cursor.execute("DELETE FROM reports WHERE course_id = %s", (course_id,))
    conn.commit()


    conn.close()
    return jsonify({"message": "True"})













# ==================================================================
# creator_profile.html 
#  learner_profile.html
#  courseList.html

# go to full course
@courses_bp.route("/fullCoursePage")
def full_course():

    course_id = request.args.get("course_id")

    conn = get_db()
    cursor = conn.cursor()
    # course details
    cursor.execute("""SELECT t1.username, t2.title, t2.description, t2.category, t2.price, t2.thumbnail, t2.course_link, t2.creator_id, t1.profile_pic
                   FROM courses as t2 INNER JOIN users as t1 
                   on t1.id = t2.creator_id WHERE t2.id = %s""", 
                   (course_id,))
    
    course = cursor.fetchone()
    creator_photo = course[8] if course else None
    already_sub = False

    # user subscribe that creator or not
    cursor.execute("""SELECT t1.user_id , t1.creator_id 
                   FROM subscription as t1 INNER JOIN courses as t2 
                   ON t1.creator_id = t2.creator_id WHERE t1.user_id = %s AND t2.id = %s""",
                     (session["id"] , course_id))
    
    if cursor.fetchone(): already_sub = True

    # Check if user has already bookmarked this course
    cursor.execute("SELECT id FROM bookmarks WHERE user_id = %s AND course_id = %s", (session.get("id"),course_id))

    is_bookmarked = True if cursor.fetchone() else False

    # Check if user has already reported this course
    cursor.execute("SELECT id FROM reports WHERE user_id = %s AND course_id = %s", (session.get("id"), course_id))
    already_reported = True if cursor.fetchone() else False

    # check user already give review this course
    cursor.execute("""SELECT t1.username , t2.rating , t2.comment , t1.profile_pic 
                   FROM review as t2 INNER JOIN users as t1 
                   on t1.id = t2.user_id WHERE t2.course_id = %s AND t1.id = %s""", 
                   (course_id,session["id"]))
    
    user_review = cursor.fetchall()

    already_review = True if user_review else False

    review_details = user_review[0] if user_review else None

    user_photo = session.get("profile_pic") if user_review else None

    # get all reviews of that course
    cursor.execute("""SELECT t1.username , t2.rating , t2.comment , t1.profile_pic 
                   FROM review as t2 INNER JOIN users as t1 
                   on t1.id = t2.user_id WHERE t2.course_id = %s AND t1.id != %s""", 
                   (course_id,session["id"]))
    
    reviews = cursor.fetchall()
    conn.close()
    return render_template("fullCoursePage.html", creator_name=course[0], title=course[1], description=course[2], category=course[3], price=course[4], thumbnail=course[5], course_link=course[6], is_bookmarked=is_bookmarked, reviews=reviews, course_id=course_id, user_review=review_details, already_review = already_review, creator_id=str(course[7]), creator_photo=creator_photo, user_photo=user_photo, already_subscription = already_sub, already_reported=already_reported)












#  ==================================================================
# fullCoursePage.html
# Home.html
# courseList.html


# fo to course by that creator
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











# ==================================================================
# fullCoursePage.html

# ---------- REPORTING SYSTEM ----------
@courses_bp.route("/report-course", methods=["POST"])
def report_course():
    data = request.json
    course_id = data.get("course_id")
    categories = data.get("categories") # List
    description = data.get("description")

    conn = get_db()
    cursor = conn.cursor()
    
    # Check if user has already reported this course
    cursor.execute("SELECT id FROM reports WHERE user_id = %s AND course_id = %s", (session["id"], course_id))
    if cursor.fetchone():
        conn.close()
        return jsonify({"message": "You have already reported this course."}), 409

    # Ensure tables exist (for this implementation)
    cursor.execute("""CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY, user_id INTEGER, course_id INTEGER, 
        categories TEXT, description TEXT, status TEXT DEFAULT 'pending', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    

    cursor.execute("INSERT INTO reports (user_id, course_id, categories, description) VALUES (%s, %s, %s, %s)",
                   (session["id"], course_id, ",".join(categories), description))
    conn.commit()
    conn.close()
    return jsonify({"message": "Report submitted successfully"})














#==================================================================
# admin.html

# ---------- ADMIN DASHBOARD ----------
@courses_bp.route("/admin")
def admin_page():
    # In production, verify admin role here
    return render_template("admin.html")

@courses_bp.route("/admin/data")
def admin_data():
    conn = get_db()
    cursor = conn.cursor()
    
    # Fetch Reports
    cursor.execute("""SELECT r.id, r.categories, r.description, r.status, u.username, c.title, c.id, c.creator_id, c.course_link 
                      FROM reports r JOIN users u ON r.user_id = u.id JOIN courses c ON r.course_id = c.id 
                      WHERE r.status = 'pending' ORDER BY r.created_at DESC""")
    reports = cursor.fetchall()
    
    # Fetch Users
    cursor.execute("SELECT id, username, email, role FROM users")
    users = cursor.fetchall()
    
    # Fetch Courses
    cursor.execute("SELECT c.id, c.title, u.username FROM courses c JOIN users u ON c.creator_id = u.id")
    courses = cursor.fetchall()
    conn.close()

    return jsonify({
        "reports": [{"id": r[0], "categories": r[1], "description": r[2], "status": r[3], "reporter": r[4], "course_title": r[5], "course_id": r[6], "creator_id": r[7], "link": r[8]} for r in reports],
        "users": [{"id": u[0], "username": u[1], "email": u[2], "role": u[3]} for u in users],
        "courses": [{"id": c[0], "title": c[1], "creator": c[2]} for c in courses]
    })

@courses_bp.route("/admin/action", methods=["POST"])
def admin_action():
    data = request.json
    action = data.get("action")
    report_id = data.get("report_id")
    course_id = data.get("course_id")
    creator_id = data.get("creator_id")
    
    conn = get_db()
    cursor = conn.cursor()
    
    if action == "delete_course":
        cursor.execute("DELETE FROM courses WHERE id = %s", (course_id,))
        cursor.execute("DELETE FROM reports WHERE course_id = %s", (course_id,))
        cursor.execute("DELETE FROM review WHERE course_id = %s", (course_id,))
        cursor.execute("DELETE FROM bookmarks WHERE course_id = %s", (course_id,))
    
        cursor.execute("UPDATE reports SET status = 'resolved' WHERE id = %s", (report_id,))
    elif action == "delete_creator":
        cursor.execute("DELETE FROM users WHERE id = %s", (creator_id,))
        cursor.execute("DELETE FROM courses WHERE creator_id = %s", (creator_id,))
        cursor.execute("DELETE FROM subscription WHERE creator_id = %s", (creator_id,))
        cursor.execute("UPDATE reports SET status = 'resolved' WHERE id = %s", (report_id,))
    elif action == "ignore":
        cursor.execute("UPDATE reports SET status = 'resolved' WHERE id = %s", (report_id,))

    conn.commit()
    conn.close()
    return jsonify({"message": "Action taken"})


@courses_bp.route("/admin/delete_course", methods=["POST"])
def admin_delete_course():
    # In a real app, you'd verify admin role here
    data = request.json
    course_id = data.get("course_id")
    if not course_id:
        return jsonify({"message": "Course ID is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        # Delete thumbnail file from Supabase Storage
        thumbnail_path = f"public/{course_id}.png"
        supabase.storage.from_("course-thumbnails").remove([thumbnail_path])

        
        # Delete from DB
        cursor.execute("DELETE FROM reports WHERE course_id = %s", (course_id,))
        cursor.execute("DELETE FROM review WHERE course_id = %s", (course_id,))
        cursor.execute("DELETE FROM bookmarks WHERE course_id = %s", (course_id,))
        cursor.execute("DELETE FROM courses WHERE id = %s", (course_id,))
        
        conn.commit()
        return jsonify({"message": f"Course {course_id} and related data deleted."})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        conn.close()

@courses_bp.route("/admin/delete_user", methods=["POST"])
def admin_delete_user():
    # In a real app, you'd verify admin role here
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        # 1. Delete user's profile picture from Supabase Storage
        profile_pic_path = f"public/{user_id}.png"
        supabase.storage.from_("profile-pictures").remove([profile_pic_path])

        # 2. Get all courses by the user to delete their thumbnails from Supabase Storage
        cursor.execute("SELECT id FROM courses WHERE creator_id = %s", (user_id,))
        courses_to_delete = cursor.fetchall()
        if courses_to_delete:
            thumbnail_paths_to_delete = [
                f"public/{course_row[0]}.png" for course_row in courses_to_delete
            ]
            supabase.storage.from_("course-thumbnails").remove(thumbnail_paths_to_delete)


        # 3. Delete records referencing the user's courses
        cursor.execute("DELETE FROM reports WHERE course_id IN (SELECT id FROM courses WHERE creator_id = %s)", (user_id,))
        cursor.execute("DELETE FROM review WHERE course_id IN (SELECT id FROM courses WHERE creator_id = %s)", (user_id,))
        cursor.execute("DELETE FROM bookmarks WHERE course_id IN (SELECT id FROM courses WHERE creator_id = %s)", (user_id,))

        # 4. Delete records referencing the user directly
        cursor.execute("DELETE FROM reports WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM review WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM bookmarks WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM subscription WHERE user_id = %s OR creator_id = %s", (user_id, user_id))
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        
        # 5. Delete the user's courses
        cursor.execute("DELETE FROM courses WHERE creator_id = %s", (user_id,))
        
        # 6. Finally, delete the user
        cursor.execute("INSERT INTO deletedUser (user_id) VALUES (%s)", (user_id,))
        
        conn.commit()
        return jsonify({"message": f"User {user_id} and all related data deleted."})
    except Exception as e:
        conn.rollback()
        return jsonify({"message": f"An error occurred: {e}"}), 500
    finally:
        conn.close()