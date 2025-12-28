# from flask import Flask,request,redirect,url_for,session,Response , render_template

# app = Flask(__name__)
"""
app.secret_key = "supersecret"

#home page
@app.route("/" , methods=["GET" , "POST"])
def login() :
    if request.method == "POST" :
        userName = request.form.get("username")
        userPass = request.form.get("password")

        if userName == "admin" and userPass == "123" :
            session["user"] = userName
            return redirect(url_for("welcome"))
        else :
            return Response("in-valid , try again" , mimetype="text/plain")
    
    return '''
            <h2> Login page </h2>
            <form method="POST">
            Username : <input type="text" name="username" placeholder="Enter name" />
            Password : <input type="password"  name="password" placeholder="Enter password" />
            <input type="submit" value="submit">
            </form>
'''

@app.route("/welcome")
def welcome() :
    if "user" in session :
        return f'''
                <h2> Welcome , {session["user"]}! </h2>
                <a href={url_for("logout")}> logout </a>
                '''
    
    return redirect(url_for("login"))

@app.route("/logout")
def logout() :
    session.pop("user" , None)
    return redirect(url_for("login"))


@app.route("/")
def login() :
    return render_template("login.html")

@app.route("/go" , methods=["POST"])
def go():
    username = request.form.get("username")
    password = request.form.get("password")

    if username == "ved123" and password == "1234" :
        return render_template("welcome.html" , name = username)
    
    return "invalid details"
    """

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import random
import smtplib

app = Flask(__name__)
CORS(app)

saved_otp = ""

EMAIL = "pved311206@gmail.com"
PASSWORD = "sswngwuuqotonmrj"

@app.route("/")
def home():
    return render_template("Sign-Up-page/signUp.html")

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

    return jsonify({"message": "OTP sent successfully 📧"})

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    otp = request.json["otp"]
    if otp == saved_otp:
        return jsonify({"message": "OTP Verified ✅"})
    return jsonify({"message": "Invalid OTP ❌"})

if __name__ == "__main__":
    app.run(debug=True)





# @app.route("/sign-up" , methods=["POST" , "GET"])
# def submit():
#     name = request.form.get("username")
#     password = request.form.get("password")
#     email = request.form.get("email")
#     if name != "" :
#         return render_template("Sign-Up-page/demo.html" , name=name , password=password , email=email)
#     return "enter name"

