// --- 変更点1: Firestore関連のインポートを削除し、axiosを追加 ---
import { useEffect, useState } from "react";
import { VStack, Spinner, Center, Text } from "@chakra-ui/react";
import { Post } from "../components/Post";
import axios from "axios"; // API通信にaxiosを使用
import { auth } from "../firebase"; // 認証情報を取得

// --- 変更点2: バックエンドのAPIサーバーのURLを定義 ---
// .envファイルで管理するのがベストですが、ここでは直接記述します
const API_URL = "https://ng-2502testesu.onrender.com";

const ListPage = () => {
  // --- 変更点3: postsの初期値を空の配列に、loadingの初期値をtrueに変更 ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // ページを開いたらすぐに読み込みが始まるため

  useEffect(() => {
    // --- 変更点4: useEffectの中身をaxiosでのAPI呼び出しに全面変更 ---
    const fetchPosts = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn("ログインしていません");
        setLoading(false);
        setPosts([]);
        return;
      }

      try {
        const token = await user.getIdToken();
        // FastAPIの /posts エンドポイントにGETリクエストを送信（認証トークン付き）
        const response = await axios.get(`${API_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ APIから投稿データを取得しました:", response.data);
        // バックエンドがユーザー情報を含めて返すので、そのまま使用
        setPosts(response.data || []);
      } catch (error) {
        console.error("🔥 投稿データの取得中にエラーが発生しました:", error);
        // エラーが発生した場合、ユーザーに何も表示されないのを避けるためpostsを空にする
        setPosts([]);
      } finally {
        // データ取得が成功しても失敗しても、最後に必ずローディング状態をfalseにする
        setLoading(false);
      }
    };

    fetchPosts();
  }, []); // 空の配列[]を指定すると、この処理はページが最初に表示されたときに1回だけ実行される

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
