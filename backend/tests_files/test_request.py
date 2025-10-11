import requests

res = requests.post("http://127.0.0.1:8000/post", json={
    "userId": "u1",
    "content": "Hello Firestore Emulator!2"
})
print(res.json())