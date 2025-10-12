import { Box, Divider, Heading, IconButton, VStack } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Post } from "../components/Post";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useUser } from "../hooks/useUser";
import { InputComment } from "../components/InputComment";
import { useDisclosure } from "@chakra-ui/react";
import { useEffect } from "react";

const PostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post, openComment } = location.state || {}; // openCommentを受け取る
  const [comments, setComments] = useState([]);
  const { iconColor, username } = useUser();

  // InputCommentの開閉制御
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ページ遷移時にopenCommentがtrueならInputCommentを開く
  useEffect(() => {
    if (openComment) {
      onOpen();
    }
  }, [openComment, onOpen]);

  const handleGoBack = () => navigate("/list");
  const handleCommentSubmit = (newComment) => {
    const commentPost = {
      id: `comment-${Date.now()}`,
      content: newComment,
      user: {
        username: username,
        iconColor: iconColor,
      },
    };
    setComments((prevComments) => [...prevComments, commentPost]);
    onClose(); // コメント送信後はInputCommentを閉じる
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
      {post && (
        <>
          <Post post={post} onCommentSubmit={handleCommentSubmit} />
          {/* InputCommentをモーダルとして表示 */}
          <InputComment
            isOpen={isOpen}
            onClose={onClose}
            onCommentSubmit={handleCommentSubmit}
          />
        </>
      )}
      <Divider />
      <Box p={4}>
        <Heading size="md" mb={4}>
          コメント
        </Heading>
        <VStack spacing={4} align="stretch">
          {comments.map((comment) => (
            <Post key={comment.id} post={comment} isComment={true} />
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};

export default PostPage;