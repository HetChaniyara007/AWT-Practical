from django.shortcuts import render, redirect
from .models import Student

def student_list(request):
    students = Student.objects.all()
    return render(request, 'students.html', {'students': students})


def add_student(request):
    if request.method == "POST":
        name = request.POST['name']
        email = request.POST['email']
        age = request.POST['age']

        Student.objects.create(name=name, email=email, age=age)
        return redirect('student_list')

    return render(request, 'add_student.html')