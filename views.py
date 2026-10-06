from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from .forms import LoginForm, JogaForm

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            login_user = authenticate(request, username=form.cleaned_data['login'], password=form.cleaned_data['password'])
            if login_user is not None:
                login(request, login_user)
                return redirect('home')  # Вместо 'home' укажите нужный URL
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def joga_form_view(request):
    if request.method == 'POST':
        form = JogaForm(request.POST)
        if form.is_valid():
            # Здесь происходит логика обработки данных
            name = form.cleaned_data['name']
            # После успешной обработки можно перенаправить на страницу "Спасибо"
            return render(request, 'success.html', {'name': name})
    else:
        form = JogaForm()
        
    return render(request, 'joga.html', {'form': form})