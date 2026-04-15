from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Configure the SQLite database, relative to the app instance folder
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'database_records.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    emergency_contact = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f'<Student {self.student_id}>'

@app.route('/')
def student_list():
    students = Student.query.all()
    return render_template('index.html', students=students)

@app.route('/create', methods=['GET', 'POST'])
def student_create():
    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        student_id = request.form['student_id']
        department = request.form['department']
        blood_group = request.form['blood_group']
        emergency_contact = request.form['emergency_contact']

        new_student = Student(first_name=first_name, last_name=last_name, student_id=student_id, 
                              department=department, blood_group=blood_group, emergency_contact=emergency_contact)

        try:
            db.session.add(new_student)
            db.session.commit()
            return redirect('/')
        except Exception as e:
            return "There was an issue adding the student: " + str(e)
            
    return render_template('form.html')

@app.route('/update/<int:id>', methods=['GET', 'POST'])
def student_update(id):
    student = Student.query.get_or_404(id)

    if request.method == 'POST':
        student.first_name = request.form['first_name']
        student.last_name = request.form['last_name']
        student.student_id = request.form['student_id']
        student.department = request.form['department']
        student.blood_group = request.form['blood_group']
        student.emergency_contact = request.form['emergency_contact']

        try:
            db.session.commit()
            return redirect('/')
        except Exception as e:
            return "There was an issue updating the student: " + str(e)

    return render_template('form.html', student=student)

@app.route('/delete/<int:id>', methods=['GET', 'POST'])
def student_delete(id):
    student = Student.query.get_or_404(id)

    if request.method == 'POST':
        try:
            db.session.delete(student)
            db.session.commit()
            return redirect('/')
        except Exception as e:
            return "There was a problem deleting that student: " + str(e)

    return render_template('confirm_delete.html', student=student)

@app.route('/idcard/<int:id>')
def view_idcard(id):
    student = Student.query.get_or_404(id)
    return render_template('id_card.html', student=student)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)
