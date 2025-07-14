from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'secret'

courses = ['Math', 'Physics', 'Chemistry', 'Biology']
registrations = []

@app.route('/')
def index():
    return render_template('index.html', courses=courses, registrations=registrations)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        course = request.form['course']
        if course not in registrations:
            registrations.append(course)
            flash(f'Registered for {course}!')
        else:
            flash(f'Already registered for {course}.')
        return redirect(url_for('index'))
    return render_template('register.html', courses=courses)

@app.route('/drop', methods=['GET', 'POST'])
def drop():
    if request.method == 'POST':
        course = request.form['course']
        if course in registrations:
            registrations.remove(course)
            flash(f'Dropped {course}.')
        else:
            flash(f'You are not registered in {course}.')
        return redirect(url_for('index'))
    return render_template('drop.html', registrations=registrations)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
