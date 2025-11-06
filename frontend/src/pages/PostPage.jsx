import {
  Box,
  Divider,
  Heading,
  IconButton,
  VStack,
  Spinner,
  Center,
  Text,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../components/Post";
import { useState, useEffect } from "react"; // useEffectを追加
import { IoIosArrowBack } from "react-icons/io";
import { useUser } from "../hooks/useUser";
import { InputComment } from "../components/InputComment";
import { NgReason } from "../components/NgReason";
import { useDisclosure } from "@chakra-ui/react";
import axios from "axios"; // axiosをインポート
import { auth } from "../firebase"; // ログインユーザー情報を取得

// FastAPIサーバーのURL
const API_URL = "https://ng-2502testesu.onrender.com";

const PostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // location.stateから渡されるメインの投稿データ
  const { post: mainPostData, openComment } = location.state || {};

  // --- 変更点1: コメント用のstateとローディングstateを追加 ---
  const [comments, setComments] = useState([]); // DBから取得したコメントを入れる箱
  const [isLoadingComments, setIsLoadingComments] = useState(true); // コメント読み込み中フラグ

  const { iconColor, username } = useUser(); // Contextから現在のユーザー情報を取得
  const { isOpen, onOpen, onClose } = useDisclosure(); // コメント入力モーダルの制御
  // NG理由モーダル
  const {
    isOpen: isNgOpen,
    onOpen: onNgOpen,
    onClose: onNgClose,
  } = useDisclosure();
  const [ngReason, setNgReason] = useState("");

  // --- 変更点2: useEffectでコメントを取得する処理を追加 ---
  useEffect(() => {
    const fetchComments = async () => {
      if (!mainPostData?.id) {
        setIsLoadingComments(false);
        return; // メインの投稿IDがなければ何もしない
      }
      setIsLoadingComments(true);
      try {
        // FastAPIの /replies/{postId} エンドポイントを呼び出す
        const response = await axios.get(
          `${API_URL}/replies/${mainPostData.id}`
        );
        // バックエンドがユーザー情報を含めて返すので、そのまま使用
        setComments(response.data || []);
        console.log("✅ コメントを取得:", response.data);
      } catch (error) {
        console.error("🔥 コメントの取得に失敗:", error);
        setComments([]); // エラー時は空にする
      } finally {
        setIsLoadingComments(false); // 読み込み完了
      }
    };

    fetchComments();
  }, [mainPostData?.id]); // mainPostData.idが変わった時だけ再実行

  // ページ遷移時にopenCommentがtrueならInputCommentを開く (変更なし)
  useEffect(() => {
    if (openComment) {
      onOpen();
    }
  }, [openComment, onOpen]);

  const handleGoBack = () => navigate("/list");

  // --- 変更点3: handleCommentSubmitを修正し、APIに送信する処理を追加 ---
  const handleCommentSubmit = async (newCommentText) => {
    const user = auth.currentUser;
    // テキストが空か、未ログインか、メイン投稿がなければ処理中断
    if (!newCommentText.trim() || !user || !mainPostData?.id) {
      console.warn(
        "コメント内容がないか、ログインしていないか、元投稿がありません。"
      );
      return;
    }

    // バックエンドに送るデータを作成
    const commentPayload = {
      userId: user.uid,
      content: newCommentText,
      replyTo: mainPostData.id, // どの投稿への返信かを示すID
      imageUrl: null,
    };

    try {
      // FastAPIの /post エンドポイントにデータを送信
      const response = await axios.post(`${API_URL}/post`, commentPayload);
      console.log("✅ コメント投稿成功:", response.data);

      // 投稿成功後：ローカルのstateにも追加して即時反映（楽観的UI更新）
      const newCommentForState = {
        id: response.data.postId, // バックエンドが生成したIDを使う
        userId: user.uid,
        content: newCommentText,
        timestamp: new Date().toISOString(), // 仮のタイムスタンプ
        likes: [],
        user: {
          // ユーザー情報を付与（Postコンポーネントが表示に使うため）
          username: username || "あなた", // Contextのusernameを使う
          iconColor: iconColor || "blue", // ContextのiconColorを使う
        },
      };
      setComments((prevComments) => [...prevComments, newCommentForState]);
      onClose(); // コメント送信後はInputCommentを閉じる
    } catch (error) {
      console.error("🔥 コメントの投稿に失敗しました:", error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      if (status === 400 && typeof detail === "string") {
        const extracted = detail.replace(/^不適切な投稿です[:：]\s?/, "");
        setNgReason(extracted || detail);
        onNgOpen();
      } else {
        alert(`コメントの投稿に失敗しました: ${detail || error.message}`);
      }
    }
  };

  return (
    <VStack spacing={0} align="stretch">
      {/* 戻るボタン (変更なし) */}
      <Box alignSelf="flex-start" pl={2} pt={2}>
        <IconButton
          aria-label="Back to list page"
          icon={<IoIosArrowBack size="24px" />}
          onClick={handleGoBack}
          variant="ghost"
          isRound
          _focus={{ boxShadow: "none", outline: "none" }}
          border={"none"}
          color="#80CBC4" // 色はお好みで
        />
      </Box>

      {/* メイン投稿の表示 (postDataを渡すように修正) */}
      {mainPostData ? (
        <>
          <Post post={mainPostData} onCommentSubmit={handleCommentSubmit} />
          {/* InputComment (変更なし) */}
          <InputComment
            isOpen={isOpen}
            onClose={onClose}
            onCommentSubmit={handleCommentSubmit}
          />
          {/* NG理由モーダル */}
          <NgReason isOpen={isNgOpen} onClose={onNgClose} reason={ngReason} />
        </>
      ) : (
        <Center h="20vh">
          <Text color="gray.500">投稿データが見つかりません。</Text>
        </Center>
      )}

      <Divider />

      {/* コメントセクション */}
      <Box p={4}>
        <Heading size="md" mb={4}>
          コメント
        </Heading>
        {/* --- 変更点4: コメントのローディング表示を追加 --- */}
        {isLoadingComments ? (
          <Center>
            <Spinner color="orange.400" />
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            {/* AIコメントの表示 */}
            {mainPostData?.aiComments &&
              mainPostData.aiComments.length > 0 &&
              mainPostData.aiComments.map((aiComment, index) => {
                // ランダムなアイコンカラーを選択
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
                ];
                const randomColor =
                  colors[Math.floor(Math.random() * colors.length)];

                // ランダムなユーザー名を選択
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
                ];
                const randomUsername =
                  usernames[Math.floor(Math.random() * usernames.length)];

                // aiCommentが文字列の場合とオブジェクトの場合に対応
                const commentText =
                  typeof aiComment === "string" ? aiComment : aiComment.comment;

                // AIコメント用のPostデータを作成
                const aiCommentPost = {
                  id: `ai-${mainPostData.id}-${index}`,
                  content: commentText,
                  user: {
                    username: randomUsername,
                    iconColor: randomColor,
                  },
                  timestamp: mainPostData.timestamp,
                  likes: [],
                };
                return (
                  <Post
                    key={aiCommentPost.id}
                    post={aiCommentPost}
                    isComment={true}
                  />
                );
              })}

            {/* 通常のコメントの表示 */}
            {comments.length === 0 &&
            (!mainPostData?.aiComments ||
              mainPostData.aiComments.length === 0) ? (
              <Text color="gray.500">まだコメントはありません。</Text>
            ) : (
              comments.map((comment) => (
                // コメントもPostコンポーネントで表示 (postDataを渡すように修正)
                <Post key={comment.id} post={comment} isComment={true} />
              ))
            )}
          </VStack>
        )}
      </Box>
    </VStack>
  );
};

export default PostPage;
