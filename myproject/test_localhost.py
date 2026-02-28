import requests

resp = requests.post('http://127.0.0.1:8000/api/auth/login/', json={'email': 'logictadm@gmail.com', 'password': 'logictpassword'})
if resp.status_code != 200:
    print("Login failed:", resp.status_code, resp.text)
else:
    token = resp.json().get('access')
    headers = {'Authorization': f'Bearer {token}'}
    
    with open('test_file.txt', 'w') as f:
        f.write('hello')
        
    with open('test_file.txt', 'rb') as f:
        files = {'file': f}
        data = {
            'title': 'Test title',
            'description': '',
            'week': 1,
            'file_type': 'pdf',
            'order': 1
        }
        resp2 = requests.post('http://127.0.0.1:8000/api/admin/materials/', headers=headers, data=data, files=files)
        print("Upload status:", resp2.status_code)
        print("Upload response:", resp2.text)
