import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { Text, YStack } from "tamagui";
import { Header } from "../components/ui/Header";
import { Post } from "../components/ui/Post";
import { API_BASE_URL } from "../constants/api";
import { auth } from "../firebase";

type IconColor =
  | "blue"
  | "cream"
  | "green"
  | "mint"
  | "navy"
  | "olive"
  | "purple"
  | "red"
  | "yellow";

type PostItem = {
  id?: string;
  userId?: string;
  user?: { username?: string; iconColor?: IconColor };
  content: string;
  imageUrl?: string | null;
  predictedLikes?: number;
  riskLevel?: "safe" | "warning" | "danger";
  riskReason?: string;
};

const ListPage = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = await user.getIdToken();

        console.log("🔥 Firebase TOKEN:", token);

        // ★ AI投稿生成（保存だけ）
        await fetch(`${API_BASE_URL}/post/ai`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        // ★ posts を取得（AI投稿も含まれる）
        const response = await fetch(`${API_BASE_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        // ★ posts のみセット
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("🔥 投稿取得エラー:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <YStack flex={1}>
        <Header />
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#FFB433" />
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack space="$0" flex={1}>
      <Header />
      {posts.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" py="$6">
          <Text color="$gray8">まだ投稿がありません。</Text>
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
        >
          {posts.map((post, index) => (
            <Post
              key={post.id ?? `${post.userId ?? "anon"}-${index}`}
              post={post}
            />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
};

export default ListPage;
