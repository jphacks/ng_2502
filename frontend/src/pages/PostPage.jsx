import { Box, Divider, Heading, VStack } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { Post } from "../components/Post";
import { useState } from "react";

export const PostPage = () => {
  const location = useLocation();
  const { post } = location.state || {}; // navigateから渡されたstateを取得
  const [comments, setComments] = useState([]);

  const handleCommentSubmit = (newComment) => {
    // 新しいコメントオブジェクトを作成
    const commentPost = {
      id: `comment-${Date.now()}`, // 一意のIDを生成
      content: newComment,
      user: {
        // 実際にはログインユーザーの情報を入れる
        email: "current.user@example.com",
        iconColor: "green",
      },
    };
    setComments((prevComments) => [...prevComments, commentPost]);
  };

  return (
    <VStack spacing={4} align="stretch">
      {post && <Post post={post} onCommentSubmit={handleCommentSubmit} />}
      <Divider />
      <Box p={4}>
        <Heading size="md" mb={4}>
          コメント
        </Heading>
        {/* コメントリストをPostコンポーネントを使って表示 */}
        <VStack spacing={4} align="stretch">
          {comments.map((comment) => (
            <Post key={comment.id} post={comment} isComment={true} />
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};
