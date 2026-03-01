import { Ionicons } from "@expo/vector-icons"; // 変更点: Expo標準のアイコン
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { Button, H4, Separator, Spinner, Text, View, YStack } from "tamagui";

// ※パスはプロジェクトの構成に合わせて調整してください（@/ を使った絶対パスを想定）
import { InputComment } from "@/components/ui/InputComment";
import { NgReason } from "@/components/ui/NgReason";
import { Post } from "@/components/ui/Post";
import { auth } from "@/firebase";
import { useUser } from "@/hooks/useUser";

const API_URL = "https://ng-2502testesu.onrender.com";

export default function PostPage() {
  const router = useRouter();
  const params = useLocalSearchParams(); // 変更点: Expo Routerのパラメータ取得

  // 変更点: Expo Routerは文字列でパラメータを渡すため、JSON.parseで復元する
  const mainPostData = params.post ? JSON.parse(params.post as string) : null;
  const openComment = params.openComment === "true";

  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // 変更点: ChakraのuseDisclosureの代わりに標準のuseStateを使用
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isNgOpen, setIsNgOpen] = useState(false);
  const [ngReason, setNgReason] = useState("");

  const { iconColor, username } = useUser();

  useEffect(() => {
    const fetchComments = async () => {
      if (!mainPostData?.id) {
        setIsLoadingComments(false);
        return;
      }
      setIsLoadingComments(true);
      try {
        const response = await axios.get(
          `${API_URL}/replies/${mainPostData.id}`,
        );
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

  const handleGoBack = () => router.back(); // 変更点: navigate('/list') から router.back() へ

  const handleCommentSubmit = async (newCommentText: string) => {
    const user = auth.currentUser;
    if (!newCommentText.trim() || !user || !mainPostData?.id) return;

    const commentPayload = {
      userId: user.uid,
      content: newCommentText,
      replyTo: mainPostData.id,
      imageUrl: null,
    };

    try {
      const response = await axios.post(`${API_URL}/post`, commentPayload);

      const newCommentForState = {
        id: response.data.postId,
        userId: user.uid,
        content: newCommentText,
        timestamp: new Date().toISOString(),
        likes: [],
        user: {
          username: username || "あなた",
          iconColor: iconColor || "blue",
        },
      };
      setComments((prev) => [...prev, newCommentForState]);
      setIsCommentOpen(false); // モーダルを閉じる
    } catch (error: any) {
      console.error("🔥 コメントの投稿に失敗しました:", error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 400 && typeof detail === "string") {
        const extracted = detail.replace(/^不適切な投稿です[:：]\s?/, "");
        setNgReason(extracted || detail);
        setIsNgOpen(true);
      } else {
        // 変更点: Webのalert()ではなく、RNのAlert.alert()を使用
        Alert.alert(
          "エラー",
          `コメントの投稿に失敗しました: ${detail || error.message}`,
        );
      }
    }
  };

  return (
    // 変更点: スマホ用にScrollViewで全体を囲む。背景色は白(#fff)など。
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack padding="$4" space="$4">
        {/* 戻るボタン */}
        <View alignSelf="flex-start">
          <Button
            size="$3"
            circular
            icon={<Ionicons name="chevron-back" size={24} color="#80CBC4" />}
            onPress={handleGoBack}
            backgroundColor="transparent"
            pressStyle={{ opacity: 0.7 }}
          />
        </View>

        {/* メイン投稿の表示 */}
        {mainPostData ? (
          <>
            <Post post={mainPostData} onCommentSubmit={handleCommentSubmit} />
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
          </>
        ) : (
          <View height={150} justifyContent="center" alignItems="center">
            <Text color="$gray10">投稿データが見つかりません。</Text>
          </View>
        )}

        <Separator marginVertical="$4" />

        {/* コメントセクション */}
        <YStack space="$4">
          <H4 fontWeight="bold">コメント</H4>

          {isLoadingComments ? (
            <View justifyContent="center" alignItems="center" padding="$4">
              <Spinner size="large" color="$orange10" />
            </View>
          ) : (
            <YStack space="$4">
              {/* AIコメントの表示 */}
              {mainPostData?.aiComments &&
                mainPostData.aiComments.length > 0 &&
                mainPostData.aiComments.map((aiComment: any, index: number) => {
                  const colors = [
                    "blue",
                    "cream",
                    "green",
                    "mint",
                    "navy",
                    "olive",
                    "purple",
                    "red",
                    "yellow",
                  ] as const;
                  const randomColor =
                    colors[Math.floor(Math.random() * colors.length)];
                  const usernames = [
                    "あい",
                    "じぇみー",
                    "ぐー",
                    "ちゃぴ",
                    "こぱ",
                    "ロット",
                    "りあ",
                    "ふぁいあ",
                    "アラン",
                    "くら",
                    "かに",
                    "くじら",
                    "ほっけ",
                    "たこ",
                    "さけ",
                    "たい",
                    "ぺんぎん",
                    "いるか",
                    "あざらし",
                    "カジキ",
                    "チュナ",
                    "ぱくぱく",
                    "もぐ",
                  ];
                  const randomUsername =
                    usernames[Math.floor(Math.random() * usernames.length)];

                  const commentText =
                    typeof aiComment === "string"
                      ? aiComment
                      : aiComment.comment;

                  const aiCommentPost = {
                    id: `ai-${mainPostData.id}-${index}`,
                    content: commentText,
                    user: { username: randomUsername, iconColor: randomColor },
                    timestamp: mainPostData.timestamp,
                    likes: [],
                  };
                  return (
                    <Post
                      key={aiCommentPost.id}
                      post={aiCommentPost}
                      isComment={true}
                      isAiComment={true}
                    />
                  );
                })}

              {/* 通常のコメントの表示 */}
              {comments.length === 0 &&
              (!mainPostData?.aiComments ||
                mainPostData.aiComments.length === 0) ? (
                <Text color="$gray10">まだコメントはありません。</Text>
              ) : (
                comments.map((comment) => (
                  <Post key={comment.id} post={comment} isComment={true} />
                ))
              )}
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
