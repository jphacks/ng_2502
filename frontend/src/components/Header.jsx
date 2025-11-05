import { Box, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ImageButton } from "./ImageButton";
import { CircleIcon } from "./CircleIcon";
import AppIconNoText from "../assets/AppIconNotext.png";
import { TextButton } from "./TextButton";
import { useUser } from "../hooks/useUser";
// --- アイコンのインポートと対応表 ---
import BlueIcon from "../assets/UserIcon_Blue.png";
import CreamIcon from "../assets/UserIcon_Cream.png";
import GreenIcon from "../assets/UserIcon_Green.png";
import MintIcon from "../assets/UserIcon_Mint.png";
import NavyIcon from "../assets/UserIcon_Navy.png";
import OliveIcon from "../assets/UserIcon_Olive.png";
import PurpleIcon from "../assets/UserIcon_Purple.png";
import RedIcon from "../assets/UserIcon_Red.png";
import YellowIcon from "../assets/UserIcon_Yellow.png";

// --- ★実績変更点1 ---
import { useDisclosure, IconButton } from "@chakra-ui/react";
import { FaTrophy } from "react-icons/fa"; // 実績アイコン
import { AchievementsModal } from "./AchievementsModal";

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

export const Header = () => {
  const { iconColor } = useUser();
  const { src, alt } = iconMap[iconColor] || iconMap.blue;

  // --- ★実績変更点2 ---
  // モーダル開閉のためのフック
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding={{ base: 3, md: 4 }}
      position="sticky"
      top={0}
      zIndex="sticky"
      w="100%"
      bg="#FFFFFF"
    >
      <Box flex="1" display="flex" alignItems="center" gap={2}>
        <Link to="/profile">
        <CircleIcon src={src} alt={alt} />
        </Link>
      </Box>

      {/* --- ★実績変更点3 --- */}
      <IconButton
        aria-label="実績一覧"
        icon={<FaTrophy />}
        onClick={onOpen} // クリックでモーダルを開く
        variant="ghost"
      />
      {/* ヘッダーのどこかにモーダル本体を配置 (表示はisOpenで制御される) */}
      <AchievementsModal isOpen={isOpen} onClose={onClose} />

      <Box>
        <Link to="/list">
          <ImageButton img={AppIconNoText} alt="SNR Logo" />
        </Link>
      </Box>
      <Box flex="1" display="flex" justifyContent="flex-end">
        <Link to="/input">
          <TextButton>つくる</TextButton>
        </Link>
      </Box>
    </Flex>
  );
};
