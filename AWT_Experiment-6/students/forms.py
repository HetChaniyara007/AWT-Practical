from django import forms
from .models import Student

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['first_name', 'last_name', 'email', 'major', 'gpa', 'status']
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email Address'}),
            'major': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Academic Major'}),
            'gpa': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'GPA (e.g. 3.8)', 'step': '0.01'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }
