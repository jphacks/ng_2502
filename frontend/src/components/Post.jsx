import { VStack, HStack, Text, Box, Divider } from "@chakra-ui/react";
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
import { useUser } from "../hooks/useUser";
import { ReactionButton } from "./ReactionButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export const Post = () => {
  const { iconColor, email } = useUser();
  const { src, alt } = iconMap[iconColor] || iconMap.blue;
  const [isLiked, setIsLiked] = useState(false);
  const navigate = useNavigate();

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };
  const postContent = "これは投稿のテキストです。";

  const handleCommentClick = () => {
    navigate("/post");
  };

  return (
    <VStack spacing={4} align="stretch" p={{ base: 3, md: 4 }}>
      <HStack spacing={{ base: 2, md: 3 }} align="center">
        <CircleIcon src={src} alt={alt} />
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
            {email || "ユーザー名"}
          </Text>
        </VStack>
      </HStack>
      <Box>
        <Text fontSize={{ base: "md", md: "lg" }}>{postContent}</Text>
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
        <ReactionButton
          label="Comment"
          icon={<SlSpeech fontSize={{ base: "16px", md: "20px" }} />}
          onClick={handleCommentClick}
        />
      </HStack>
      <Divider borderColor="#80CBC4" />
    </VStack>
  );
};
