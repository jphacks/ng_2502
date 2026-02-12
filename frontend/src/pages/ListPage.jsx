// --- 変更点1: Firestore関連のインポートを削除し、axiosを追加 ---
import { useEffect, useState } from "react";
import { VStack, Spinner, Center, Text } from "@chakra-ui/react";
import { Post } from "../components/Post";
import axios from "axios"; // API通信にaxiosを使用
import { auth } from "../firebase"; // 認証情報を取得
import { onAuthStateChanged } from "firebase/auth"; // 認証初期化完了を待つ

// --- 変更点2: バックエンドのAPIサーバーのURLを定義 ---
// .envファイルで管理するのがベストですが、ここでは直接記述します
const API_URL = import.meta.env.VITE_API_URL;

const ListPage = () => {
  // --- 変更点3: postsの初期値を空の配列に、loadingの初期値をtrueに変更 ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // ページを開いたらすぐに読み込みが始まるため

  useEffect(() => {
    // リロード直後は auth.currentUser が null のことがあるため
    // 認証状態の初期化完了(onAuthStateChanged)を待ってから取得する
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("ログインしていません");
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await axios.get(`${API_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("✅ APIから投稿データを取得しました:", response.data);
        setPosts(response.data || []);
      } catch (error) {
        console.error("🔥 投稿データの取得中にエラーが発生しました:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- ローディング中の表示（変更なし） ---
  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="orange.400" />
      </Center>
    );
  }

  return (
    <VStack spacing={0} align="stretch">
      {/* --- 変更点5: 投稿が0件の場合の表示を追加 --- */}
      {posts.length === 0 ? (
        <Center h="50vh">
          <Text color="gray.500">
            まだ投稿がありません。最初の投稿をしてみましょう！
          </Text>
        </Center>
      ) : (
        posts.map((post) => <Post key={post.id} post={post} />)
      )}
    </VStack>
  );
};

export default ListPage;
