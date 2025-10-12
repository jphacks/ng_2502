import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { InputText } from "../components/InputText.jsx";
import { TextButton } from "../components/TextButton.jsx";
import { ProfileButton } from "../components/ProfileButton.jsx";
import { ProfileIcon } from "../components/ProfileIcon.jsx";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../api/users"; // 作成したAPI関数をインポート

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
import { WhiteTextButton } from "../components/WhiteTextButton.jsx";

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

export const ProfilePage = () => {
  // --- Contextから取得する変数に別名をつける ---
  const {
    username: globalUsername,
    setUsername: setGlobalUsername,
    iconColor: globalIconColor,
    setIconColor: setGlobalIconColor,
  } = useUser();
  const navigate = useNavigate();

  // --- このページ専用の「下書き用」stateを作成し、Contextの初期値を入れる ---
  const [localUsername, setLocalUsername] = useState(globalUsername ?? ""); // nullish coalescing operatorでnull/undefinedを空文字に変換
  const [localIconColor, setLocalIconColor] = useState(globalIconColor);
  const [mode, setMode] = useState("てんさく");

  // プロフィール情報を保存する処理
  const handleSave = async () => {
    // --- 保存時に、下書き(ローカルstate)を清書(Context)に反映させる ---
    setGlobalUsername(localUsername);
    setGlobalIconColor(localIconColor);

    try {
      // バックエンドには下書き(ローカルstate)の情報を送信
      const profileDate = {
        username: localUsername,
        iconColor: localIconColor,
        mode: mode,
      };

      const responseDate = await updateUserProfile(profileDate);

      console.log("プロフィール更新成功:", responseDate);
      navigate("/list");
    } catch (error) {
      console.error("プロフィールの更新に失敗しました:", error);
    }
  };

  return (
    <Box maxW="1400px" mx="auto" p={4}>
      <VStack spacing={8} align="stretch">
        {/* 1. 上部のナビゲーションバー */}
        <Flex justify="space-between" align="center">
          <WhiteTextButton
            variant="outline"
            borderRadius="full"
            onClick={() => navigate("/list")}
          >
            やめる
          </WhiteTextButton>
          <TextButton
            colorScheme="orange"
            borderRadius="full"
            onClick={handleSave}
          >
            けってい
          </TextButton>
        </Flex>

        {/* 2. メインのアイコンと名前編集エリア */}
        {/* --- UIはすべて下書き(ローカルstate)を参照・更新するように変更 --- */}
        <Flex
          direction={{ base: "column", md: "row" }} // ★スマホでは縦(column)、PC(md以上)では横(row)
          gap={4} // 要素間のスペース（spacingの代わり）
          w="100%"
          align="center" // 子要素を中央揃えにする
          padding={{ base: 4, md: "0 100px" }} // ★スマホでは左右のパディングを減らす
        >
          <ProfileIcon
            src={iconMap[localIconColor]?.src || iconMap.blue.src}
            alt={iconMap[localIconColor]?.alt || iconMap.blue.alt}
            size="2xl"
            boxShadow="md"
          />
          <Flex w="100%" justify="center">
            <InputText
              placeholder="なまえ"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              h={{ base: "80px", sm: "88px", lg: "96px" }}
              fontSize={{ base: "56px", sm: "64px", lg: "72px" }}
              textAlign="center"
              // ★スマホでは横幅を指定、PCでは親要素に合わせる
              w={{ base: "100%", md: "100%", lg: "100%" }}
            />
          </Flex>
        </Flex>

        {/* 3. アイコン選択エリア */}
        <VStack>
          <Text
            color="#FFB433"
            fontSize={{ base: "18px", sm: "20px", lg: "22px" }}
          >
            アイコンをえらんでね
          </Text>
          <Wrap spacing={4} justify="center">
            {Object.keys(iconMap).map((color) => (
              <WrapItem key={color}>
                <Box
                  as="button"
                  onClick={() => setLocalIconColor(color)} // 更新先をローカルに変更
                  borderWidth={localIconColor === color ? "3px" : "1px"} // 参照先をローカルに変更
                  borderColor={
                    localIconColor === color ? "#ffb433" : "gray.200"
                  } // 参照先をローカルに変更
                  borderRadius="full"
                  p="2px"
                  _focus={{ outline: "none", boxShadow: "none" }}
                >
                  <ProfileIcon
                    src={iconMap[color].src}
                    size={{ base: "md", sm: "lg", lg: "xl" }}
                  />
                </Box>
              </WrapItem>
            ))}
          </Wrap>
        </VStack>

        {/* 4. モード選択エリア */}
        <VStack>
          <Text
            color="#FFB433"
            fontSize={{ base: "18px", sm: "20px", lg: "22px" }}
          >
            モードをえらんでね
          </Text>
          <HStack>
            <ProfileButton
              onClick={() => setMode("てんさく")}
              isActive={mode === "てんさく"}
            >
              てんさく
            </ProfileButton>
            <ProfileButton
              onClick={() => setMode("じゆう")}
              isActive={mode === "じゆう"}
            >
              じゆう
            </ProfileButton>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};
