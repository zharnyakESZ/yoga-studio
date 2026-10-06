from django import forms

class LoginForm(forms.Form):
    login = forms.CharField(max_length=100, required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True)
    from django import forms

class JogaForm(forms.Form):
    name = forms.CharField(max_length=100, label="Ваше имя")
    phone = forms.CharField(max_length=20, label="Номер телефона")
    message = forms.CharField(widget=forms.Textarea, label="Сообщение или пожелание")