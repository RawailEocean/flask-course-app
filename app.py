from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Dummy storage
students = []
teachers = []
courses = ["Math", "Physics", "Chemistry", "Computer Science"]

def register_student(name, email, course):
    students.append({"name": name, "email": email, "course": course})

def register_teacher(name, email, subject):
    teachers.append({"name": name, "email": email, "subject": subject})

def drop_course(email, course):
    global students
    students = [s for s in students if not (s["email"] == email and s["course"] == course)]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register/student", methods=["GET", "POST"])
def register_student_page():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        course = request.form["course"]
        register_student(name, email, course)
        return redirect(url_for("index"))
    return render_template("register_student.html")

@app.route("/register/teacher", methods=["GET", "POST"])
def register_teacher_page():
    if request.method == "POST":
        name = request.form["name"]
        email = request.form["email"]
        subject = request.form["subject"]
        register_teacher(name, email, subject)
        return redirect(url_for("index"))
    return render_template("register_teacher.html")

@app.route("/courses")
def course_list():
    return render_template("courses.html", courses=courses)

@app.route("/drop", methods=["GET", "POST"])
def drop():
    if request.method == "POST":
        email = request.form["email"]
        course = request.form["course"]
        drop_course(email, course)
        return redirect(url_for("index"))
    return render_template("drop.html")

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
