import { useEffect, useState } from "react";
import { VStack, Spinner, Center, Text } from "@chakra-ui/react";
import { Post } from "../components/Post";
import axios from "axios";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = "https://ng-2502testesu.onrender.com";

const ListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.warn("❌ ログインしていません");
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const response = await axios.get(`${API_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ APIから投稿データを取得しました:", response.data);
        const rawPosts = response.data || [];

        const uniqueUserIds = Array.from(
          new Set(rawPosts.map((p) => p.userId).filter(Boolean))
        );

        const profiles = {};
        await Promise.all(
          uniqueUserIds.map(async (uid) => {
            try {
              const snap = await getDoc(doc(db, "users", uid));
              if (snap.exists()) {
                profiles[uid] = snap.data();
              }
            } catch {
              // 無視してデフォルト適用
            }
          })
        );

        const enriched = rawPosts.map((p) => ({
          ...p,
          user: {
            username: profiles[p.userId]?.username || "ユーザー名",
            iconColor: profiles[p.userId]?.iconColor || "blue",
          },
        }));

        setPosts(enriched);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("🔥 投稿取得エラー:", {
            status: error.response?.status,
            detail: error.response?.data,
            message: error.message,
          });
        } else {
          console.error("🔥 予期せぬエラー:", error);
        }
        setPosts([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="orange.400" />
      </Center>
    );
  }

  return (
    <VStack spacing={0} align="stretch">
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