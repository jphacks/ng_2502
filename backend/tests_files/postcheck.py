# 確認用（ターミナルから直接呼べる）
from google.cloud import firestore
import os
os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
db = firestore.Client(project="myfirstfirebase-440d6")
doc = db.collection("posts").document("hMRmnkiWQMEjz8ZHajaq").get()
print(doc.exists, doc.to_dict())
