from flask import Blueprint, render_template

views_bp = Blueprint('views', __name__)

@views_bp.route("/")
def FirstPage():
    return render_template("index.html")

@views_bp.route("/About")
def about():
    return render_template("about.html")

@views_bp.route("/Documentation") 
def Docs():
    return render_template("Docs.html")

@views_bp.route("/Terms&Conditions")
def T_C():
    return render_template("T&C.html")