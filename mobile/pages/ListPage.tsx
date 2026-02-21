import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { YStack, Text } from "tamagui";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Post } from "../components/ui/Post";
import { Header } from "../components/ui/Header";

const API_URL = "https://ng-2502testesu.onrender.com";

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
  predictedLikes?: number;
};

const ListPage = () => {
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
        const response = await fetch(`${API_URL}/posts`, {
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
        console.log("✅ APIから投稿データを取得しました:", data);
        setPosts(Array.isArray(data) ? data : []);
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
          <Text color="$gray8">
            まだ投稿がありません。最初の投稿をしてみましょう！
          </Text>
        </YStack>
      ) : (
        posts.map((post, index) => (
          <Post
            key={post.id ?? `${post.userId ?? "anon"}-${index}`}
            post={post}
          />
        ))
      )}
    </YStack>
  );
};

export default ListPage;
