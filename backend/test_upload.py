import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()
user = User.objects.filter(role='teacher').first()
if not user:
    user = User.objects.create(email='testteacher@a.com', role='teacher', password='abc')

client = APIClient(SERVER_NAME='localhost')
client.force_authenticate(user=user)

with open('test_file.txt', 'w') as f:
    f.write('test file content')

with open('test_file.txt', 'rb') as f:
    response = client.post('/api/admin/materials/', {
        'title': 'Test Material',
        'description': 'Test Description',
        'week': 1,
        'file_type': 'pdf',
        'order': 1,
        'file': f
    }, format='multipart')

    print("Status Code:", response.status_code)
    try:
        print("Data:", response.data)
    except Exception:
        content = getattr(response, 'content', b'').decode('utf-8')
        import re
        m = re.search(r'<pre class="exception_value">(.*?)</pre>', content, re.DOTALL)
        if m: print("Error:", m.group(1).strip())
        else: print("Content:", content[:500])
