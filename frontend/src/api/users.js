import axios from "axios";

// バックエンドサーバーのベースURL
const API_BASE_URL = "http://127.0.0.1:8000"; //本番では変更

/**
 * ユーザーのプロフィール情報を更新する関数
 * @param {object} profileData - 更新したいデータ { username: "新しい名前", iconColor: "red", mode: "じゆう" }
 * @returns {Promise<object>} バックエンドからのレスポンスデータ
 */
export const updateUserProfile = async (profileData) => {
  // 1. ログイン時にlocalStorageに保存したIDトークンを取得
  const idToken = localStorage.getItem("firebaseIdToken");

  // 2. トークンがなければ、ログインしていないのでエラーを発生させる
  if (!idToken) {
    alert("ログインしていません。プロフィールを更新できません。");
    throw new Error("User not authenticated");
  }

  // 3. バックエンドのURLと設定を準備
  const url = `${API_BASE_URL}/users/me`; // バックエンドのエンドポイントは /users/me です
  const config = {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  };

  // 4. axiosを使って、PUTリクエストを送信
  //    profileDataが送信するデータ本体
  const response = await axios.put(url, profileData, config);

  // 5. バックエンドからのレスポンスデータを返す
  return response.data;
};
