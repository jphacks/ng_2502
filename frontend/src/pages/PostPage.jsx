import { Box, Divider, Heading, IconButton, VStack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../components/Post";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";

export const PostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state || {}; // navigateから渡されたstateを取得
  const [comments, setComments] = useState([]);

  const handleGoBack = () => navigate("/list");
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
      <Box alignSelf="flex-start" pl={2} pt={2}>
        <IconButton
          aria-label="Back to list page"
          icon={<IoIosArrowBack size="24px" />}
          onClick={handleGoBack}
          variant="ghost"
          isRound
          _focus={{ boxShadow: "none", outline: "none" }}
          border={"none"}
          color="#80CBC4"
        />
      </Box>
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
