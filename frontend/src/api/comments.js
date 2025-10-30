import axios from "axios";
const API_BASE_URL = "https://your-production-domain.com/api";
// idTokenはLogin時同様に取得

export const postComment = async (postId, commentData) => {
  const idToken = localStorage.getItem("firebaseIdToken");
  if (!idToken) {
    alert("ログインしていません");
    throw new Error("User not authenticated");
  }
  const url = `${API_BASE_URL}/replies/${postId}`;
  const config = {
    headers: { Authorization: `Bearer ${idToken}` },
  };
  const response = await axios.post(url, commentData, config);
  return response.data;
};
