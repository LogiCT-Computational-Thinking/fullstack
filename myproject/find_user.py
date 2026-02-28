import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
admins = User.objects.filter(role__in=['admin', 'teacher'])
for u in admins:
    print(f"Email: {u.email}, Role: {u.role}")
