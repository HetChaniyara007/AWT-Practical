from django.shortcuts import render, redirect, get_object_or_404
from .models import Student
from .forms import StudentForm
from django.db.models import Avg, Q

def student_list(request):
    query = request.GET.get('q', '')
    
    if query:
        students = Student.objects.filter(
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query) |
            Q(major__icontains=query)
        )
    else:
        students = Student.objects.all()

    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='Active').count()
    avg_gpa = Student.objects.aggregate(Avg('gpa'))['gpa__avg'] or 0.0

    context = {
        'students': students,
        'query': query,
        'total_students': total_students,
        'active_students': active_students,
        'avg_gpa': round(avg_gpa, 2)
    }
    return render(request, 'students/student_list.html', context)

def student_create(request):
    if request.method == 'POST':
        form = StudentForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('student_list')
    else:
        form = StudentForm()
    return render(request, 'students/student_form.html', {'form': form})

def student_update(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form = StudentForm(request.POST, instance=student)
        if form.is_valid():
            form.save()
            return redirect('student_list')
    else:
        form = StudentForm(instance=student)
    return render(request, 'students/student_form.html', {'form': form, 'student': student})

def student_delete(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        student.delete()
        return redirect('student_list')
    return render(request, 'students/student_confirm_delete.html', {'student': student})
