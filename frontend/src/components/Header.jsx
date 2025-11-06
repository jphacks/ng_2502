  import { Box, Flex, useDisclosure, IconButton } from "@chakra-ui/react";// ★修正点1: IconButton を chakra-ui からインポートする
  import { Link } from "react-router-dom";
  import { ImageButton } from "./ImageButton";
  import { CircleIcon } from "./CircleIcon";
  import AppIconNoText from "../assets/AppIconNotext.png";
  import { TextButton } from "./TextButton";
  import { useUser } from "../hooks/useUser";
  import Tutorial from "./Tutorial";
  import { FaRegQuestionCircle, FaTrophy } from "react-icons/fa"; // ★変更点1: FaTrophyを追加
  import { MarkButton } from "./MarkButton";

  // --- 変更点2: ステップ3で作成したモーダルをインポート ---
  import { AchievementModal } from "./AchievementModal.jsx"; // ← { } で囲む

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

  // 変更点3: コメントアウト
  //import AchievementModal from "../components/AchievementModal";

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

    // --- 変更点4: モーダルごとに別々の開閉フックを用意 ---
    // チュートリアル用 (担当3のコード)
    const { isOpen: isTutorialOpen, onOpen: onTutorialOpen, onClose: onTutorialClose } = useDisclosure();
    // 実績一覧用 (あなたのコード)
    const { isOpen: isAchievementOpen, onOpen: onAchievementOpen, onClose: onAchievementClose } = useDisclosure();

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
          {/* --- 変更点5: 実績ボタンをここに配置 --- */}
          <IconButton
            aria-label="実績一覧"
            icon={<FaTrophy />}
            onClick={onAchievementOpen} // ★クリックで実績モーダルを開く
            variant="ghost"
            color="gray.600"
            _hover={{ color: "orange.400" }}
          />
          {/* (AchievementModalの呼び出しは、競合を避けるためFlexの最後に移動) */}
        </Box>
        <Box>
          <Link to="/list">
            <ImageButton img={AppIconNoText} alt="SNR Logo" />
          </Link>
        </Box>
        <Box flex="1" display="flex" justifyContent="flex-end" gap={2}>
          <MarkButton
            label="Tutorial"
            onClick={onTutorialOpen} // ← チュートリアルモーダルを開く
            icon={<FaRegQuestionCircle />}
          />
          <Link to="/input">
            <TextButton>つくる</TextButton>
          </Link>
        </Box>
        {/* --- 変更点6: モーダル本体は、Flexの最後にまとめて配置 --- */}
        {/* (これにより、表示・非表示に関わらずレイアウトが崩れない) */}
        <Tutorial isOpen={isTutorialOpen} onClose={onTutorialClose} />
        <AchievementModal isOpen={isAchievementOpen} onClose={onAchievementClose} />
      </Flex>
    );
  };
