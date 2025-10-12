import { useEffect, useState } from "react";
import { VStack, Text, Spinner, Center } from "@chakra-ui/react";
import { Post } from "../components/Post";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const ListPage = () => {
  const [posts, setPosts] = useState([
    // 初期デモデータを入れておく（Firestoreが動かなくても見える）
    {
      id: "demo1",
      user: { username: "demo@example.com", iconColor: "gray" },
      content: "Firestore接続中...（これはデモです）",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        console.log("✅ 現在のユーザー:", user);

        if (!user) {
          console.warn("⚠️ ユーザーがログインしていません。デモデータを表示します。");
          setLoading(false);
          return;
        }

        const postsRef = collection(db, "posts");
        const q = query(
          postsRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.warn("📭 投稿が見つかりません。");
          setPosts([]);
          return;
        }

        const userPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ 取得した投稿:", userPosts);
        setPosts(userPosts);
      } catch (error) {
        console.error("🔥 投稿取得中にエラー:", error);
      } finally {
        setLoading(false);
      }
    };

    // Firestoreが落ちてても画面が真っ白にならないよう try/catchで囲む
    try {
      fetchUserPosts();
    } catch (err) {
      console.error("❌ useEffectでエラー:", err);
    }
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner />
      </Center>
    );
  }

  return (
    <VStack spacing={0} align="stretch">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </VStack>
  );
};

export default ListPage;