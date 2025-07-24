from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Dummy storage
students = []
teachers = []
courses = ["Math", "Physics", "Chemistry", "Computer Science"] # This list still exists for the /courses page

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
        course = request.form["course"] # Course is now taken directly from text input
        register_student(name, email, course)
        return redirect(url_for("index"))
    return render_template("register_student.html") # Removed courses=courses

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
    # NEW: Organize students by course
    courses_with_registered_students = {}
    for course_name in courses: # Initialize with predefined courses
        courses_with_registered_students[course_name] = []
    
    # Add students to their respective courses
    for student in students:
        course = student["course"]
        if course not in courses_with_registered_students:
            courses_with_registered_students[course] = [] # Add dynamically entered courses
        courses_with_registered_students[course].append(student)

    # Pass both the original course list and the organized student data
    return render_template("courses.html", 
                           courses=courses, # Original list of courses
                           courses_data=courses_with_registered_students) # New organized data

@app.route("/students")
def view_students():
    return render_template("view_students.html", students=students)

@app.route("/drop", methods=["GET", "POST"])
def drop():
    if request.method == "POST":
        email = request.form["email"]
        course = request.form["course"]
        drop_course(email, course)
        return redirect(url_for("index"))
    return render_template("drop.html", students=students, courses=courses)
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
