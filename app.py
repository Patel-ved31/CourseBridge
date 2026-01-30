from flask import Flask, request, jsonify, render_template,session
from flask_cors import CORS
import random
import smtplib
import os
from db import get_db
from werkzeug.utils import secure_filename

# make file for thumbnail image
UPLOAD_FOLDER = "static/uploads/thumbnails"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app = Flask(__name__)
CORS(app)

app.config["TEMPLATES_AUTO_RELOAD"] = True

app.secret_key = "coursebridge_secret"
@app.route("/")
def FirstPage():
    return render_template("index.html")

# open login page
@app.route("/login")
def login():
    return render_template("login.html")

# open signUp page
@app.route("/signUp")
def signUp():
    return render_template("signUp.html")

@app.route("/check-details" , methods=["POST"])
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
        return jsonify({"success": True, "message": "✅ Login successful"})
    else:
        return jsonify({"success": False, "message": "❌ Invalid username or password"})

@app.route("/check-email" , methods=["POST"] )
def check_email() :
    email = request.json["email"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )

    user = cursor.fetchone()
    conn.close()

    # print(user)
    if user:
        return jsonify({"success": False, "message": "Email already exists"})
    else:
        return jsonify({"success": True, "message": "Email available"})

saved_otp = ""

EMAIL = "pved311206@gmail.com"
PASSWORD = "sswngwuuqotonmrj"
# send otp through email --> --> page : signUp
@app.route("/send-otp", methods=["POST"])
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

# check otp --> page : signUp
@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    otp = request.json["otp"]
    if otp == saved_otp:
        return jsonify({"message": "true"})
    return jsonify({"message": "false"})

@app.route("/register" , methods=["POST"])
def submit():
    name = request.json["username"]
    password = request.json["password"]
    email = request.json["email"]
    role = request.json["role"]
    
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO users (username, email, password, role)
            VALUES (%s, %s, %s, %s)
            """,
            (name, email, password, role)
        )

        conn.commit()
        return jsonify({"message": "✅ User registered successfully"})
    except Exception:
        return jsonify({"message": "❌ Email already exists"})
    finally:
        conn.close()

@app.route("/Home" , methods=["GET"])
def Home():
    return render_template("Home.html" , name=session["username"] , id = session["id"] , role = session["role"])

@app.route("/courses", methods=["GET"])
def get_courses():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, category, price, thumbnail
        FROM courses
        ORDER BY created_at DESC
    """)

    courses = cursor.fetchall()
    conn.close()

    course_list = []
    for c in courses:
        course_list.append({
            "id": c[0],
            "title": c[1],
            "description": c[2],
            "category": c[3],
            "price": c[4],
            "thumbnail": c[5]
        })

    return jsonify(course_list)

@app.route("/search")
def search():
    quary = request.args.get("q")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT title FROM courses WHERE title ILIKE %s",
        ( "%" + quary + "%"  ,)
    )

    result = [row[0] for row in cursor.fetchall() ]

    cursor.close()
    conn.close()

    return jsonify(result)

@app.route("/categoryList")
def categoryList():
    category = request.args.get("category")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        WHERE t2.category ILIKE %s
        """,
        ("%" + category + "%" ,)
    )

    courses = cursor.fetchall()

    cursor.execute(
        """
        SELECT course_id 
        FROM bookmarks
        where user_id = %s
        """
        , (session["id"],)
    )
    bookmarks = cursor.fetchall()
    conn.close()

    return render_template(
        "courseList.html",
        courses=courses,
        bookmarks=[b[0] for b in bookmarks]
    )

@app.route("/courseList")
def courseList():
    query = request.args.get("course")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        WHERE t2.title ILIKE %s
        """,
        ("%" + query + "%" ,)
    )

    courses = cursor.fetchall()

    cursor.execute(
        """
        SELECT course_id 
        FROM bookmarks
        where user_id = %s
        """
        , (session["id"],)
    )
    bookmarks = cursor.fetchall()
    conn.close()

    return render_template("courseList.html" , courses = courses , bookmarks=[b[0] for b in bookmarks])

@app.route("/all_courses")
def all_courses():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        """
    )

    courses = cursor.fetchall()

    cursor.execute(
        """
        SELECT course_id 
        FROM bookmarks
        where user_id = %s
        """
        , (session["id"],)
    )
    bookmarks = cursor.fetchall()

    conn.close()

    return render_template("courseList.html" , courses = courses , bookmarks=[b[0] for b in bookmarks])

@app.route("/creator_profile")
def creator_profile():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM courses
        WHERE creator_id = %s
        """,
        (session["id"],)
    )

    courses = cursor.fetchall()

    cursor.execute(
        """
        SELECT t1.username , t1.id  , t2.title , t2.price , t2.thumbnail , t2.id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        INNER JOIN bookmarks as t3
        on t3.course_id = t2.id
        WHERE t3.user_id = %s
        """
        , (session["id"],)
    )
    bookmarks = cursor.fetchall()

    conn.close()

    return render_template("creator_profile.html" , name=session["username"] , courses =courses , bookmarks=bookmarks)

@app.route("/learner_profile")
def learner_profile():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t1.id  , t2.title , t2.price , t2.thumbnail , t2.id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        INNER JOIN bookmarks as t3
        on t3.course_id = t2.id
        WHERE t3.user_id = %s
        """
        , (session["id"],)
    )
    bookmarks = cursor.fetchall()

    print(bookmarks)

    conn.close()

    return render_template("learner_profile.html" , name=session["username"] , bookmarks=bookmarks)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ---------- ADD COURSE ----------
@app.route("/add-course", methods=["POST"])
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

    # 1️⃣ Insert course first
    cursor.execute("""
        INSERT INTO courses (creator_id , title, description, category, price , course_link)
        VALUES (%s , %s, %s, %s, %s , %s)
        RETURNING id
    """, (session["id"] ,title, description, category, price , link))

    course_id = cursor.fetchone()[0]

    # 2️⃣ Save image as course_id.png
    filename = secure_filename(f"{course_id}.png")
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    image.save(image_path)

    # 3️⃣ Save filename in DB (optional but recommended)
    cursor.execute("""
        UPDATE courses
        SET thumbnail = %s
        WHERE id = %s
    """, (filename, course_id))

    conn.commit()
    conn.close()

    return jsonify({"message": "Course added successfully ✅"})

@app.route("/add-bookmark" , methods=["POST"])
def add_bookmark():
    course_id = request.json["course_id"]
    user_id = session["id"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO bookmarks (user_id, course_id)
        VALUES (%s, %s)
        """,
        (user_id, course_id)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Course bookmarked successfully ✅"})

@app.route("/remove-bookmark" , methods=["POST"])
def remove_bookmark():
    course_id = request.json["course_id"]
    user_id = session["id"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM bookmarks
        WHERE user_id = %s AND course_id = %s
        """,
        (user_id, course_id)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Bookmark removed successfully ✅"})

@app.route("/fullCoursePage")
def full_course():

    course_id = request.args.get("course_id")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t2.title , t2.description , t2.category , t2.price , t2.thumbnail , t2.course_link,t2.creator_id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        WHERE t2.id = %s
        """,
        (course_id,)
    )

    course = cursor.fetchone()
    conn.close()

    user_id = session.get("id")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id
        FROM bookmarks
        WHERE user_id = %s AND course_id = %s
        """,
        (user_id,course_id)
    )
    bookmark = cursor.fetchone()
    conn.close()

    if bookmark:
        is_bookmarked = True
    else:
        is_bookmarked = False

    # check for user review in that course
    conn = get_db()
    cursor = conn.cursor()

    user_review = None
    already_review = False
    review_details = None

    cursor.execute(
        """
        SELECT t1.username , t2.rating , t2.comment 
        FROM review as t2 INNER JOIN users as t1
        on t1.id = t2.user_id
        WHERE t2.course_id = %s AND t1.id = %s
        """, 
        (course_id,session["id"])
    )

    user_review = cursor.fetchall()
    conn.close()

    if user_review :
        already_review = True
        review_details = user_review[0]
    else :
        already_review = False

    
    # for all review
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t2.rating , t2.comment 
        FROM review as t2 INNER JOIN users as t1
        on t1.id = t2.user_id
        WHERE t2.course_id = %s AND t1.id != %s
        """, 
        (course_id,session["id"])
    )

    reviews = cursor.fetchall()
    conn.close()

    
    return render_template(
        "fullCoursePage.html",
        creator_name=course[0],
        title=course[1],
        description=course[2],
        category=course[3],
        price=course[4],
        thumbnail=course[5],
        course_link=course[6],
        is_bookmarked=is_bookmarked,
        reviews=reviews,
        course_id=course_id,
        user_review=review_details,
        already_review = already_review,
        creator_id=course[7]
    )

@app.route("/submit-review", methods=["POST"])
def submit_review():
    course_id = request.json["course_id"]
    rating = request.json["rating"]
    comment = request.json["comment"]
    user_id = session["id"]

    print(course_id, rating, comment, user_id)

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO review (user_id, course_id, rating, comment)
        VALUES (%s, %s, %s, %s)
        """,
        (user_id, course_id, rating, comment)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Review submitted successfully ✅"})


@app.route("/creatorCourse")
def creator_course():
    creator = request.args.get("creator")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT t1.username , t1.id , t2.title , t2.price , t2.thumbnail , t2.id
        FROM courses as t2 INNER JOIN users as t1
        on t1.id = t2.creator_id
        WHERE t2.creator_id = %s
        """,
        (creator ,)
    )

    print("===============")

    courses = cursor.fetchall()

    cursor.execute(
        """
        SELECT course_id 
        FROM bookmarks
        where user_id = %s
        """
        , (session["id"],)
    )
    bookmarks = cursor.fetchall()
    conn.close()

    return render_template("courseList.html" , courses = courses , bookmarks=[b[0] for b in bookmarks])

if __name__ == "__main__":
    app.run(debug=True)



    


