import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H4, Separator, Spinner, Text, View, YStack, XStack } from "tamagui";

import { InputComment } from "@/components/ui/InputComment";
import { NgReason } from "@/components/ui/NgReason";
import { Post } from "@/components/ui/Post";
import { API_BASE_URL } from "@/constants/api";
import { auth } from "@/firebase";

export default function PostPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const mainPostData = params.post ? JSON.parse(params.post as string) : null;
  const openComment = params.openComment === "true";

  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isNgOpen, setIsNgOpen] = useState(false);
  const [ngReason, setNgReason] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      if (!mainPostData?.id) {
        setIsLoadingComments(false);
        return;
      }
      setIsLoadingComments(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/replies/${mainPostData.id}`);
        setComments(response.data || []);
      } catch (error) {
        console.error("🔥 コメントの取得に失敗:", error);
        setComments([]);
      } finally {
        setIsLoadingComments(false);
      }
    };
    fetchComments();
  }, [mainPostData?.id]);

  useEffect(() => {
    if (openComment) {
      setIsCommentOpen(true);
    }
  }, [openComment]);

  const handleGoBack = () => router.back();

  const handleCommentSubmit = async (newCommentText: string) => {
    const user = auth.currentUser;
    if (!newCommentText.trim() || !user || !mainPostData?.id) return;

    try {
      const token = await user.getIdToken();

      const payload = {
        content: newCommentText,
        replyTo: mainPostData.id,
        imageUrl: null,
      };

      await axios.post(`${API_BASE_URL}/post`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsLoadingComments(true);
      const refreshResponse = await axios.get(
        `${API_BASE_URL}/replies/${mainPostData.id}`
      );
      setComments(refreshResponse.data || []);
      setIsLoadingComments(false);

      setIsCommentOpen(false);

    } catch (error: any) {
      console.error("🔥 投稿エラー詳細:", error.response?.data || error.message);

      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 400 && typeof detail === "string") {
        const extracted = detail.replace(/^不適切な投稿です[:：]\s?/, "");
        setNgReason(extracted || detail);
        setIsNgOpen(true);
      } else {
        Alert.alert("エラー", "投稿に失敗しました。通信状況を確認してください。");
      }
    }
  };

  return (
    <View flex={1} backgroundColor="#fff">
      <ScrollView style={{ flex: 1 }}>
        <YStack paddingTop={insets.top + 8} space="$4">
          <View alignSelf="flex-start">
            <Button
              size="$3"
              circular
              icon={<Ionicons name="chevron-back" size={24} color="#80CBC4" />}
              onPress={handleGoBack}
              backgroundColor="transparent"
            />
          </View>

          {mainPostData ? (
            <Post post={mainPostData} disablePostNavigation={true} />
          ) : (
            <View height={150} justifyContent="center" alignItems="center">
              <Text color="$gray10">投稿データが見つかりません。</Text>
            </View>
          )}

          <Separator marginVertical="$0" />

          <YStack space="$4" paddingBottom={insets.bottom + 80}>
            <H4 fontWeight="bold">コメント</H4>
            {isLoadingComments ? (
              <Spinner size="large" color="$orange10" />
            ) : (
              comments.map((comment) => (
                <Post
                  key={comment.id}
                  post={comment}
                  isComment={true}
                  isAiComment={comment.isAiComment}   // ← ★ 追加
                />
              ))
            )}
          </YStack>
        </YStack>
      </ScrollView>

      <View
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="#fff"
        borderTopWidth={1}
        borderColor="#ffb433"
        paddingBottom={insets.bottom + 8}
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <Pressable onPress={() => setIsCommentOpen(true)}>
          <XStack
            backgroundColor="$gray3"
            paddingHorizontal="$4"
            paddingVertical="$2"
            borderRadius="$10"
            alignItems="center"
            space="$2"
          >
            <Ionicons name="chatbubble-outline" size={20} color="#aaa" />
            <Text color="#aaa">コメントをかいてね...</Text>
          </XStack>
        </Pressable>
      </View>

      <InputComment
        visible={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        onSubmit={handleCommentSubmit}
      />

      <NgReason
        isOpen={isNgOpen}
        onClose={() => setIsNgOpen(false)}
        reason={ngReason}
      />
    </View>
  );
}
