import { onAuthStateChanged, User } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { Text, YStack } from "tamagui";
import { useFocusEffect } from "expo-router";
import { Header } from "../components/ui/Header";
import { Post } from "../components/ui/Post";
import { TabSelector } from "../components/ui/TabSelector";
import { useUserContext } from "../components/ui/UserProvider";
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
  riskLevel?: "safe" | "danger";
  riskReason?: string;
  tab?: string;
  likes?: string[];
};
let aiGenerated = false;

const ListPage = () => {
  const { activeTab, setActiveTab } = useUserContext();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 初回マウント判定（useFocusEffect の初回スキップ用）
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user && !aiGenerated) {
        aiGenerated = true;
        const token = await user.getIdToken();
        fetch(`${API_BASE_URL}/post/ai`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // タブ切り替え・ユーザー変化時に投稿を再取得
  useEffect(() => {
    if (!currentUser) {
      setPosts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const token = await currentUser.getIdToken();
        const includeFriends = activeTab === "friends";
        const response = await fetch(
          `${API_BASE_URL}/posts?includeFriends=${includeFriends}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("🔥 投稿取得エラー:", error);
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, activeTab]);

  // PostPage から戻ったときにサイレント再取得（いいね数を同期）
  useFocusEffect(
    useCallback(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      if (!currentUser) return;
      (async () => {
        try {
          const token = await currentUser.getIdToken();
          const includeFriends = activeTab === "friends";
          const res = await fetch(
            `${API_BASE_URL}/posts?includeFriends=${includeFriends}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          if (Array.isArray(data)) setPosts(data);
        } catch {}
      })();
    }, [currentUser, activeTab])
  );

  return (
    <YStack flex={1}>
      <Header />
      <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
      {loading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color="#FFB433" />
        </YStack>
      ) : posts.length === 0 ? (
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
