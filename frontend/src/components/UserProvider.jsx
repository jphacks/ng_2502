import { useState, useMemo, useEffect } from "react";
import { UserContext } from "../context/UserContext.jsx";
import { auth } from "../firebase";
import axios from "axios";

const API_URL = "https://ng-2502testesu.onrender.com";

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [iconColor, setIconColor] = useState("blue"); // デフォルトは青
  const [username, setUsername] = useState("");
  const [postContent, setPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加

  // アプリ起動時にユーザー情報を取得
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await axios.get(`${API_URL}/profile`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          console.log("✅ ユーザー情報を取得しました:", response.data);
          setUsername(response.data.username || "");
          setIconColor(response.data.iconColor || "blue");
          setEmail(user.email || "");
        } catch (error) {
          console.error("⚠️ ユーザー情報の取得に失敗:", error);
          // エラーが発生してもデフォルト値を使用
        }
      } else {
        // ログアウト状態の場合は初期値にリセット
        setUsername("");
        setIconColor("blue");
        setEmail("");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // useMemoでcontextの値をメモ化し、不要な再レンダリングを防ぎます
  const value = useMemo(
    () => ({
      email,
      setEmail,
      iconColor,
      setIconColor,
      username,
      setUsername,
      postContent,
      setPostContent,
      isLoading,
    }),
    [email, iconColor, username, postContent, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
