import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import type { GestureResponderEvent } from "react-native";
import { Image, Pressable, Linking } from "react-native";
import { Separator, Text, View, XStack, YStack } from "tamagui";

import BlueIcon from "../../assets/images/UserIcon_Blue.png";
import CreamIcon from "../../assets/images/UserIcon_Cream.png";
import GreenIcon from "../../assets/images/UserIcon_Green.png";
import MintIcon from "../../assets/images/UserIcon_Mint.png";
import NavyIcon from "../../assets/images/UserIcon_Navy.png";
import OliveIcon from "../../assets/images/UserIcon_Olive.png";
import PurpleIcon from "../../assets/images/UserIcon_Purple.png";
import RedIcon from "../../assets/images/UserIcon_Red.png";
import YellowIcon from "../../assets/images/UserIcon_Yellow.png";

import { useUser } from "../../hooks/useUser";
import { auth } from "../../firebase";
import { API_BASE_URL } from "../../constants/api";
import { CircleIcon } from "./CircleIcon";
import { InputComment } from "./InputComment";
import { NgReason } from "./NgReason"; // ← ★ 教育モーダルを使う

const iconMap = {
  blue: { src: BlueIcon, alt: "Blue Icon" },
  cream: { src: CreamIcon, alt: "Cream Icon" },
  green: { src: GreenIcon, alt: "Green Icon" },
  mint: { src: MintIcon, alt: "Mint Icon" },
  navy: { src: NavyIcon, alt: "Navy Icon" },
  olive: { src: OliveIcon, alt: "Olive Icon" },
  purple: { src: PurpleIcon, alt: "Purple Icon" },
  red: { src: RedIcon, alt: "Red Icon" },
  yellow: { src: YellowIcon, alt: "Yellow Icon" },
};

// URLを検出してクリック可能にする（test() バグ修正済み）
const renderTextWithLinks = (text: string): React.ReactNode[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <Text
          key={index}
          color="$blue10"
          textDecorationLine="underline"
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

interface PostProps {
  post: {
    id?: string;
    userId?: string;
    user?: { username?: string; iconColor?: keyof typeof iconMap };
    content: string;
    imageUrl?: string | null;
    predictedLikes?: number;
    isAiComment?: boolean;
    tab?: string;
    likes?: string[];

    // ★ 追加：危険投稿判定
    riskLevel?: "safe" | "danger";
    riskReason?: string;
  };
  onCommentSubmit?: (text: string) => void;
  isComment?: boolean;
  isAiComment?: boolean;
  currentUserId?: string;
  disablePostNavigation?: boolean;
}

const Post: React.FC<PostProps> = ({
  post,
  onCommentSubmit,
  isComment = false,
  isAiComment = false,
  currentUserId,
  disablePostNavigation = false,
}) => {
  const router = useRouter();
  const { email } = useUser();
  const viewerId = currentUserId ?? email ?? undefined;
  const isOwnPost = post?.userId && viewerId ? post.userId === viewerId : false;

  const isFriendsTab = post?.tab === "friends";
  const [isLiked, setIsLiked] = useState(isOwnPost ? true : false);
  const [localLikesCount, setLocalLikesCount] = useState(
    typeof post?.predictedLikes === "number" ? post.predictedLikes : 0
  );
  const [showCommentInput, setShowCommentInput] = useState(false);
  const hasCommentSubmit = typeof onCommentSubmit === "function";

  // ★ 教育モーダル用 state
  const [isEduOpen, setIsEduOpen] = useState(false);
  const [eduReason, setEduReason] = useState("");

  if (!post) return null;

  const safeUser = post.user || { username: "ユーザー名", iconColor: "blue" };
  const iconKey = safeUser.iconColor || "blue";
  const { src, alt } = (iconMap as any)[iconKey] || (iconMap as any).blue;

  const handleLikeClick = async (e: GestureResponderEvent) => {
    e.preventDefault?.();
    if (isOwnPost) return;

    const next = !isLiked;
    setIsLiked(next);

    // ともだちタブはAPIを呼び出し、いいね数をリアルタイム更新
    if (isFriendsTab && post.id) {
      setLocalLikesCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
      try {
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          const res = await fetch(`${API_BASE_URL}/like/${post.id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setLocalLikesCount(data.likes.length);
          }
        }
      } catch {
        // 楽観的更新を元に戻す
        setIsLiked(!next);
        setLocalLikesCount((prev) => (next ? Math.max(0, prev - 1) : prev + 1));
      }
    }

    // ★ いいね ON → danger のとき教育モーダル
    if (next && post.riskLevel === "danger") {
      setEduReason(post.riskReason ?? "");
      setIsEduOpen(true);
    }
  };

  const handlePostClick = () => {
    if (!disablePostNavigation && !isComment && post?.id) {
      const postToPass = isFriendsTab
        ? { ...post, predictedLikes: localLikesCount }
        : post;
      router.push({
        pathname: "/post-detail" as any,
        params: { postId: post.id, post: JSON.stringify(postToPass) },
      });
    }
  };

  const handleCommentClick = () => {
    if (!isComment && post?.id && !hasCommentSubmit) {
      router.push({
        pathname: "/post-detail" as any,
        params: {
          postId: post.id,
          post: JSON.stringify(post),
          openComment: "true",
        },
      });
      return;
    }
    setShowCommentInput(!showCommentInput);
  };

  return (
    <>
      <Pressable onPress={isComment ? undefined : handlePostClick}>
        <YStack space="$4" backgroundColor="$background">
          {/* ユーザー情報 */}
          <XStack space="$2" marginTop="$2" alignItems="center">
            <CircleIcon src={src} alt={alt} />
            <YStack alignItems="flex-start" space="$0">
              <Text fontWeight="bold" fontSize="$4">
                {safeUser.username || "ユーザー名"}
              </Text>
            </YStack>
          </XStack>

          {/* 本文 */}
          <View pl="$12">
            <Text fontSize="$5" color="$gray900">
              {isAiComment ? renderTextWithLinks(post.content) : post.content}
            </Text>

            {post.imageUrl && (
              <YStack mt="$3" borderRadius="$2" overflow="hidden">
                <Image
                  source={{ uri: post.imageUrl }}
                  style={{ width: "100%", height: 200, borderRadius: 8 }}
                />
              </YStack>
            )}
          </View>

          {/* いいね・コメント */}
          <XStack justifyContent="flex-end" space="$1">
            <XStack space="$1" alignItems="center">
              <Pressable onPress={handleLikeClick}>
                <FontAwesome6
                  name="heart"
                  size={20}
                  color={isLiked ? "#d32f2f" : "#999"}
                />
              </Pressable>

              {typeof post.predictedLikes === "number" && !isComment && (
                <Text
                  fontSize="$4"
                  color="#80CBC4"
                  fontFamily="monospace"
                  minWidth="$8"
                  textAlign="center"
                >
                  {isFriendsTab ? localLikesCount : post.predictedLikes}
                </Text>
              )}
            </XStack>

            {!isComment && (
              <View ml="$4">
                <Pressable onPress={handleCommentClick}>
                  <Text fontSize="$3" color="$gray600">
                    💬
                  </Text>
                </Pressable>
              </View>
            )}
          </XStack>

          {isComment && <Separator borderColor="#ffb433" />}
        </YStack>

        {/* コメント入力 */}
        <InputComment
          visible={showCommentInput}
          onClose={() => setShowCommentInput(false)}
          onSubmit={onCommentSubmit ?? (() => {})}
        />
      </Pressable>

      {/* ★ 教育モーダル */}
      <NgReason
        isOpen={isEduOpen}
        onClose={() => setIsEduOpen(false)}
        reason={eduReason}
      />
    </>
  );
};

export { Post };
export default Post;
