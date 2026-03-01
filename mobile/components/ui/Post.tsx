import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable } from "react-native";
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
import { CircleIcon } from "./CircleIcon";
import { InputComment } from "./InputComment";

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

interface PostProps {
  post: {
    id?: string;
    userId?: string;
    user?: { username?: string; iconColor?: keyof typeof iconMap };
    content: string;
    predictedLikes?: number;
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

  const [isLiked, setIsLiked] = useState(isOwnPost ? true : false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const hasCommentSubmit = typeof onCommentSubmit === "function";

  if (!post) return null;

  const safeUser = post.user || { username: "ユーザー名", iconColor: "blue" };
  const iconKey = safeUser.iconColor || "blue";
  const { src, alt } = (iconMap as any)[iconKey] || (iconMap as any).blue;

  const handleLikeClick = (e: GestureResponderEvent) => {
    e.preventDefault?.();
    if (isOwnPost) return;
    setIsLiked(!isLiked);
  };

  const handlePostClick = () => {
    if (!disablePostNavigation && !isComment && post?.id) {
      router.push({
        pathname: "/post-detail" as any,
        params: { postId: post.id, post: JSON.stringify(post) },
      });
    }
  };

  const handleCommentClick = () => {
    if (!isComment && post?.id && !hasCommentSubmit) {
      router.push({
        pathname: "/post-detail" as any,
        params: { postId: post.id, post: JSON.stringify(post), openComment: "true" },
      });
      return;
    }
    setShowCommentInput(!showCommentInput);
  };

  return (
    <Pressable onPress={isComment ? undefined : handlePostClick}>
      <YStack space="$4" p="$3" backgroundColor="$background">
        <XStack space="$2" alignItems="center">
          <CircleIcon src={src} alt={alt} />
          <YStack alignItems="flex-start" space="$0">
            <Text fontWeight="bold" fontSize="$4">
              {safeUser.username || "ユーザー名"}
            </Text>
          </YStack>
        </XStack>

        <View pl="$12">
          <Text fontSize="$5" color="$gray900">
            {post.content}
          </Text>
        </View>

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
                {post.predictedLikes}
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

        <Separator borderColor="#80CBC4" />
      </YStack>

      <InputComment
        visible={showCommentInput} // isOpen -> visible
        onClose={() => setShowCommentInput(false)}
        onSubmit={onCommentSubmit ?? (() => {})} // onCommentSubmit -> onSubmit
      />
    </Pressable>
  );
};

export { Post };
export default Post;
