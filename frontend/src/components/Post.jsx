import {
  VStack,
  HStack,
  Text,
  Box,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { CircleIcon } from "./CircleIcon";
import BlueIcon from "../assets/UserIcon_Blue.png";
import CreamIcon from "../assets/UserIcon_Cream.png";
import GreenIcon from "../assets/UserIcon_Green.png";
import MintIcon from "../assets/UserIcon_Mint.png";
import NavyIcon from "../assets/UserIcon_Navy.png";
import OliveIcon from "../assets/UserIcon_Olive.png";
import PurpleIcon from "../assets/UserIcon_Purple.png";
import RedIcon from "../assets/UserIcon_Red.png";
import YellowIcon from "../assets/UserIcon_Yellow.png";
import { ReactionButton } from "./ReactionButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputComment } from "./InputComment";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { SlSpeech } from "react-icons/sl";

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

const Post = ({ post, onCommentSubmit = () => {}, isComment = false }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { isOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // post propがない場合は何も表示しない
  if (!post) return null;

  const { content } = post;
  // user 情報がない場合に備えてデフォルトを用意
  const safeUser = post.user || { username: "ユーザー名", iconColor: "blue" };
  const { src, alt } = iconMap[safeUser.iconColor] || iconMap.blue;

  const handleLikeClick = (e) => {
    e.stopPropagation(); // 親要素へのイベント伝播を停止
    setIsLiked(!isLiked);
  };

  // コメントボタン押下時にpostpageへ遷移し、InputCommentを開くフラグを渡す
  const handleCommentClick = (e) => {
    e.stopPropagation();
    navigate("/post", { state: { post: post, openComment: true } });
  };

  const handlePostClick = () => {
    if (!isComment) {
      navigate("/post", { state: { post: post } });
    }
  };

  return (
    <>
      <VStack
        spacing={4}
        align="stretch"
        p={{ base: 3, md: 4 }}
        onClick={isComment ? undefined : handlePostClick}
        cursor={isComment ? "default" : "pointer"}
        _hover={{ bg: "gray.50" }}
      >
        <HStack spacing={{ base: 2, md: 3 }} align="center">
          <CircleIcon src={src} alt={alt} />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
              {safeUser.username || "ユーザー名"}
            </Text>
          </VStack>
        </HStack>
        <Box pl={{ base: "48px", md: "52px" }}>
          <Text fontSize={{ base: "md", md: "lg" }}>{content}</Text>
        </Box>
        <HStack spacing={4} justify="flex-end">
          <ReactionButton
            label="Like"
            icon={
              isLiked ? (
                <FaHeart fontSize={{ base: "16px", md: "20px" }} />
              ) : (
                <FaRegHeart fontSize={{ base: "16px", md: "20px" }} />
              )
            }
            onClick={handleLikeClick}
          />
          {!isComment && (
            <ReactionButton
              label="Comment"
              icon={<SlSpeech fontSize={{ base: "16px", md: "20px" }} />}
              onClick={handleCommentClick}
            />
          )}
        </HStack>
        <Divider borderColor="#80CBC4" />
      </VStack>
      {/* isCommentがtrueのときだけInputCommentを表示 */}
      {isComment && (
        <InputComment
          isOpen={isOpen}
          onClose={onClose}
          onCommentSubmit={onCommentSubmit}
        />
      )}
    </>
  );
};

export { Post };

export default Post;
