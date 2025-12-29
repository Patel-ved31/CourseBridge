# # from flask import Flask,request,redirect,url_for,session,Response , render_template

# # app = Flask(__name__)
# """
# app.secret_key = "supersecret"

# #home page
# @app.route("/" , methods=["GET" , "POST"])
# def login() :
#     if request.method == "POST" :
#         userName = request.form.get("username")
#         userPass = request.form.get("password")

#         if userName == "admin" and userPass == "123" :
#             session["user"] = userName
#             return redirect(url_for("welcome"))
#         else :
#             return Response("in-valid , try again" , mimetype="text/plain")
    
#     return '''
#             <h2> Login page </h2>
#             <form method="POST">
#             Username : <input type="text" name="username" placeholder="Enter name" />
#             Password : <input type="password"  name="password" placeholder="Enter password" />
#             <input type="submit" value="submit">
#             </form>
# '''

# @app.route("/welcome")
# def welcome() :
#     if "user" in session :
#         return f'''
#                 <h2> Welcome , {session["user"]}! </h2>
#                 <a href={url_for("logout")}> logout </a>
#                 '''
    
#     return redirect(url_for("login"))

# @app.route("/logout")
# def logout() :
#     session.pop("user" , None)
#     return redirect(url_for("login"))


# @app.route("/")
# def login() :
#     return render_template("login.html")

# @app.route("/go" , methods=["POST"])
# def go():
#     username = request.form.get("username")
#     password = request.form.get("password")

#     if username == "ved123" and password == "1234" :
#         return render_template("welcome.html" , name = username)
    
#     return "invalid details"
#     """

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import random
import smtplib
from db import get_db

app = Flask(__name__)
CORS(app)

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
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, password)
    )

    user = cursor.fetchone()
    conn.close()

    print(user)

    if user:
        return jsonify({"success": True, "message": "✅ Login successful"})
    else:
        return jsonify({"success": False, "message": "❌ Invalid username or password"})

@app.route("/check-email" , methods=["POST"] )
def check_email() :
    email = request.json["email"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
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
            VALUES (?, ?, ?, ?)
            """,
            (name, email, password, role)
        )

        conn.commit()
        return jsonify({"message": "✅ User registered successfully"})
    except Exception:
        return jsonify({"message": "❌ Email already exists"})
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)



    


