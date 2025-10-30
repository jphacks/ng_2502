import requests

res = requests.post(
    "http://127.0.0.1:8000/post",
    json={"userId": "dummy", "content": "テスト投稿 from requests"}
)

print(res.status_code)
print(res.text)
