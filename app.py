from flask import Flask, request, jsonify, render_template,session
from flask_cors import CORS
import random
import smtplib
from db import get_db

app = Flask(__name__)
CORS(app)
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
    return render_template("Home.html" , name=session["username"])

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


if __name__ == "__main__":
    app.run(debug=True)



    


