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
  isToFollower?: boolean;
};

const FollowerListPage = () => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const response = await fetch(`${API_BASE_URL}/posts/followers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let detail: string | undefined;
          try {
            const data = await response.json();
            detail = data?.detail;
          } catch {
            try {
              detail = await response.text();
            } catch {
              detail = undefined;
            }
          }

          throw new Error(detail || `Request failed (${response.status})`);
        }

        const data = await response.json();
        const followerOnlyPosts = Array.isArray(data) ? (data as PostItem[]) : [];

        console.log("✅ 友達向け投稿を取得:", followerOnlyPosts);
        setPosts(followerOnlyPosts);
      } catch (error) {
        console.error("🔥 投稿データの取得中にエラーが発生しました:", error);
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
          <Text color="$gray8">友達向けの投稿はまだありません。</Text>
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

export default FollowerListPage;
