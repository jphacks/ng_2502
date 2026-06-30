"""
ともだち機能 統合テストスクリプト

前提:
  - ローカルバックエンドが起動済み  (uvicorn functions.main:app --reload)
  - ENV=local が設定済み            (.env に ENV=local)
  - Firebase Emulator が起動済み    (firebase emulators:start)

実行:
  cd c:/code/ng_2502
  python -m functions.tests_files.test_friends
"""

import base64
import json
import requests

BASE_URL = "http://127.0.0.1:8000"


# ──────────────────────────────────────────────
# ヘルパー: ENV=local 用フェイクトークン生成
# ──────────────────────────────────────────────

def _make_token(uid: str) -> str:
    """ENV=local の auth/dependencies.py が uid を抽出できる最小JWTを作る"""
    def b64url(data: dict) -> str:
        raw = json.dumps(data, separators=(",", ":")).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    header = b64url({"alg": "none"})
    payload = b64url({"user_id": uid})
    return f"{header}.{payload}.fakesig"


def auth(uid: str) -> dict:
    return {"Authorization": f"Bearer {_make_token(uid)}"}


# ──────────────────────────────────────────────
# テスト本体
# ──────────────────────────────────────────────

def ok(label: str, res: requests.Response):
    status = "✅ PASS" if res.ok else "❌ FAIL"
    print(f"  {status}  [{res.status_code}]  {label}")
    if not res.ok:
        print(f"           → {res.text}")
    return res


def fail(label: str, res: requests.Response, expected_status: int):
    status = "✅ PASS" if res.status_code == expected_status else "❌ FAIL"
    print(f"  {status}  [{res.status_code}]  {label}  (期待:{expected_status})")
    if res.status_code != expected_status:
        print(f"           → {res.text}")
    return res


def run():
    USER_A = "test-user-a"
    USER_B = "test-user-b"

    print("\n" + "=" * 60)
    print("【1】GET /profile — uid と angou が返ること")
    print("=" * 60)

    res_a = ok("UserA プロフィール取得", requests.get(f"{BASE_URL}/profile", headers=auth(USER_A)))
    res_b = ok("UserB プロフィール取得", requests.get(f"{BASE_URL}/profile", headers=auth(USER_B)))

    profile_a = res_a.json() if res_a.ok else {}
    profile_b = res_b.json() if res_b.ok else {}

    angou_a = profile_a.get("angou", "")
    angou_b = profile_b.get("angou", "")

    print(f"  UserA → uid={profile_a.get('uid')}  angou={angou_a}")
    print(f"  UserB → uid={profile_b.get('uid')}  angou={angou_b}")

    assert profile_a.get("uid") == USER_A, "❌ uid が返っていない"
    assert angou_a, "❌ angou が返っていない"
    assert angou_b, "❌ angou が返っていない"
    assert angou_a != angou_b, "❌ 2ユーザーの angou が同じ（ユニーク性NG）"

    print("\n" + "=" * 60)
    print("【2】GET /friends, GET /friends/requests — 初期は空リスト")
    print("=" * 60)

    res = ok("UserA ともだちリスト（初期空）", requests.get(f"{BASE_URL}/friends", headers=auth(USER_A)))
    assert res.json() == [], f"❌ 空でない: {res.json()}"

    res = ok("UserA こうほリスト（初期空）", requests.get(f"{BASE_URL}/friends/requests", headers=auth(USER_A)))
    assert res.json() == [], f"❌ 空でない: {res.json()}"

    print("\n" + "=" * 60)
    print("【3】POST /friends/request — ともだち申請")
    print("=" * 60)

    # 3-1. 正常申請（UserA → UserB）
    ok("UserA が UserB の angou で申請",
       requests.post(f"{BASE_URL}/friends/request", headers=auth(USER_A),
                     json={"angou": angou_b}))

    # 3-2. UserB のこうほに UserA が入っていること
    res = ok("UserB のこうほに UserA が表示される",
             requests.get(f"{BASE_URL}/friends/requests", headers=auth(USER_B)))
    req_uids = [u["uid"] for u in res.json()]
    assert USER_A in req_uids, f"❌ UserA がこうほに存在しない: {res.json()}"

    # 3-3. 存在しない angou
    fail("存在しない angou → 404",
         requests.post(f"{BASE_URL}/friends/request", headers=auth(USER_A),
                       json={"angou": "zzzzzzzz@zz"}),
         404)

    # 3-4. 自分自身の angou
    fail("自分の angou → 404",
         requests.post(f"{BASE_URL}/friends/request", headers=auth(USER_A),
                       json={"angou": angou_a}),
         404)

    # 3-5. すでに申請済み
    fail("重複申請 → 409",
         requests.post(f"{BASE_URL}/friends/request", headers=auth(USER_A),
                       json={"angou": angou_b}),
         409)

    print("\n" + "=" * 60)
    print("【4】POST /friends/accept — ともだち承認")
    print("=" * 60)

    ok("UserB が UserA の申請を承認",
       requests.post(f"{BASE_URL}/friends/accept", headers=auth(USER_B),
                     json={"uid": USER_A}))

    # 承認後: 双方の friends に追加
    res_a_friends = ok("UserA のともだちに UserB が入っている",
                       requests.get(f"{BASE_URL}/friends", headers=auth(USER_A)))
    assert any(f["uid"] == USER_B for f in res_a_friends.json()), \
        f"❌ UserA の friends に UserB がいない: {res_a_friends.json()}"

    res_b_friends = ok("UserB のともだちに UserA が入っている",
                       requests.get(f"{BASE_URL}/friends", headers=auth(USER_B)))
    assert any(f["uid"] == USER_A for f in res_b_friends.json()), \
        f"❌ UserB の friends に UserA がいない: {res_b_friends.json()}"

    # 承認後: UserB のこうほから削除されていること
    res = ok("UserB のこうほから UserA が消えている",
             requests.get(f"{BASE_URL}/friends/requests", headers=auth(USER_B)))
    assert not any(u["uid"] == USER_A for u in res.json()), \
        f"❌ こうほに UserA が残っている: {res.json()}"

    # すでにともだちへの再申請
    fail("すでにともだちへの申請 → 409",
         requests.post(f"{BASE_URL}/friends/request", headers=auth(USER_A),
                       json={"angou": angou_b}),
         409)

    print("\n" + "=" * 60)
    print("【5】GET /posts?includeFriends=true — ともだち投稿が含まれること")
    print("=" * 60)

    res = ok("UserA のタイムライン（includeFriends=true）",
             requests.get(f"{BASE_URL}/posts?includeFriends=true", headers=auth(USER_A)))
    posts = res.json()
    print(f"  取得件数: {len(posts)} 件")

    res_no_friends = ok("UserA のタイムライン（includeFriends=false）",
                        requests.get(f"{BASE_URL}/posts?includeFriends=false", headers=auth(USER_A)))
    posts_no_friends = res_no_friends.json()
    print(f"  取得件数（friends除外）: {len(posts_no_friends)} 件")

    print("\n" + "=" * 60)
    print("【完了】全テスト終了")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    run()
