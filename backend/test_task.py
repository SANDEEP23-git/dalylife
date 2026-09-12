import urllib.request
import json

def post(url, data, token=None):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            **({"Authorization": f"Bearer {token}"} if token else {})
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def get(url, token=None):
    req = urllib.request.Request(
        url,
        headers={**({"Authorization": f"Bearer {token}"} if token else {})},
        method="GET"
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

status, data = post("http://127.0.0.1:8000/auth/login", {
    "email": "sandeeppatra056@gmail.com",
    "password": "password123"
})
print("Login status:", status)
print("Login data:", data)

if status == 200 and "access_token" in data:
    token = data["access_token"]
    status, task = post("http://127.0.0.1:8000/tasks/", {
        "title": "Daily Coding Practice",
        "description": "Solve 2 problems",
        "category": "coding",
        "xp_reward": 25
    }, token)
    print("Create task status:", status)
    print("Create task response:", task)

    status, tasks = get("http://127.0.0.1:8000/tasks/", token)
    print("Get tasks status:", status)
    print("Get tasks:", tasks)
