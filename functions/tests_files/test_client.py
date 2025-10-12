import os
from google.cloud import firestore

# Firestoreエミュレータに接続
if os.getenv("FIRESTORE_EMULATOR_HOST"):
    db = firestore.Client(project="myfirstfirebase-440d6")  # 任意のプロジェクト名でOK
else:
    db = firestore.Client()  # 本番用
