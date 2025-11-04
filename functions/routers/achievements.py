from fastapi import APIRouter, Depends, HTTPException
from typing import List
import asyncio

# --- 変更点1: 共通の「道具箱」からdbと認証をインポート ---
# (google.cloud.firestoreのインポートは不要になります)
from ..dependencies import db, get_current_user

# --- 変更点2: マスターリストのインポートパスを修正 ---
# (achievements_master.pyがmain.pyと同じ階層にある場合、
#  '..' (親ディレクトリ) は不要です)
from ..achievements_master import ACHIEVEMENTS_MASTER 

# FastAPI() の代わりに APIRouter() を使う
router = APIRouter()

# --- ユーザーの実績状況を計算して返すAPI ---
@router.get("/achievements/status")
async def get_achievement_status(user_id: str = Depends(get_current_user)):
    
    # --- 変更点3: 同期処理を非同期で実行する ---
    # Firestoreのライブラリは非同期に対応していないため、
    # `async def`の中でそのまま使うとサーバー全体がフリーズします。
    # `run_in_executor`で別スレッドで実行するのが正しい方法です。
    loop = asyncio.get_running_loop()
    def fetch_and_calculate_stats():
        try:
            # 1. このユーザーの全投稿（リプライではない）を取得
            posts_ref = db.collection("posts").where("userId", "==", user_id).where("replyTo", "==", None).stream()
            
            user_posts = [doc.to_dict() for doc in posts_ref]
            
            # 2. 統計情報を計算
            total_posts = len(user_posts)
            total_likes = sum(len(post.get("likes", [])) for post in user_posts)
            # (コメント機能が実装されたら、コメント数も集計する)
            # total_comments = sum(len(post.get("comments", [])) for post in user_posts)

            # 3. マスターリストと照合して、達成状況をまとめる
            user_status_list = []
            for ach_id, ach_data in ACHIEVEMENTS_MASTER.items():
                
                # フロントに返すデータの基本形
                status = {
                    "id": ach_id,
                    "name": ach_data["name"],
                    "description": ach_data["description"],
                    "icon": ach_data.get("icon", "FaQuestion"), # iconが未設定なら「？」
                    "goal": ach_data.get("goal", 0),
                    "progress": 0, # 現在の進捗
                    "unlocked": False, # 達成したか
                }

                # --- 達成条件の判定ロジック ---
                try:
                    if ach_id == "first_post":
                        status["progress"] = total_posts
                        if total_posts >= ach_data["goal"]:
                            status["unlocked"] = True
                    
                    elif ach_id.startswith("like_hunter_"):
                        status["progress"] = total_likes
                        if total_likes >= ach_data["goal"]:
                            status["unlocked"] = True
                    
                    # (例: コメント実績)
                    # elif ach_id.startswith("comment_received_"):
                    #     status["progress"] = total_comments
                    #     if total_comments >= ach_data["goal"]:
                    #         status["unlocked"] = True

                except Exception as e:
                    print(f"実績判定エラー (ID: {ach_id}): {e}")
                    # 判定中にエラーが起きても続行する
                
                user_status_list.append(status)
            
            return user_status_list
        
        except Exception as e:
            # データベース接続など、根本的なエラー
            print(f"🔥 実績取得の全体エラー: {e}")
            return None # エラーを示すためにNoneを返す
    
    # --- fetch_and_calculate_stats関数を非同期で実行 ---
    final_status_list = await loop.run_in_executor(None, fetch_and_calculate_stats)

    if final_status_list is None:
        raise HTTPException(status_code=500, detail="サーバーエラー: 実績データの取得に失敗しました。")

    return final_status_list

