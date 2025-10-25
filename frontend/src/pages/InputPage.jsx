import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { FaImage, FaCamera } from "react-icons/fa";
import { ProfileIcon } from "../components/ProfileIcon";
import { PostInput } from "../components/PostInput";
import { TextButton } from "../components/TextButton";
import { MarkButton } from "../components/MarkButton";
import { WhiteTextButton } from "../components/WhiteTextButton";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- 変更点1: Firebase AuthとAPIのURLを追加 ---
import { auth } from "../firebase"; // ログインユーザー情報を取得するためにインポート

// .envファイルで管理するのがベストですが、ここでは直接記述します
const API_URL = "http://localhost:8000";

// --- アイコンのインポートと対応表 (変更なし) ---
import BlueIcon from "../assets/UserIcon_Blue.png";
import CreamIcon from "../assets/UserIcon_Cream.png";
import GreenIcon from "../assets/UserIcon_Green.png";
import MintIcon from "../assets/UserIcon_Mint.png";
import NavyIcon from "../assets/UserIcon_Navy.png";
import OliveIcon from "../assets/UserIcon_Olive.png";
import PurpleIcon from "../assets/UserIcon_Purple.png";
import RedIcon from "../assets/UserIcon_Red.png";
import YellowIcon from "../assets/UserIcon_Yellow.png";

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

const InputPage = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const { iconColor } = useUser();
  const { src, alt } = iconMap[iconColor] || iconMap.blue;

  // --- 変更点2: handleSubmitの中身をFastAPIへの通信処理に修正 ---
  const handleSubmit = async () => {
    const user = auth.currentUser; // 現在ログインしているユーザーを取得
    // テキストが空か、ユーザーがログインしていない場合は処理を中断
    if (!text.trim() || !user) {
      console.warn("テキストが入力されていないか、ログインしていません。");
      return;
    }

    try {
      // FastAPIの /post エンドポイントにデータを送信
      const response = await axios.post(`${API_URL}/post`, {
        userId: user.uid, // Firebase Authから取得したユーザーID
        content: text,    // 入力されたテキスト
      });

      console.log("✅ 投稿成功:", response.data);

      // 投稿成功後、投稿一覧ページに移動
      navigate("/list");
    } catch (error) {
      console.error("🔥 投稿に失敗しました:", error);
      // ここでユーザーにエラーメッセージを表示する処理などを追加できます
    }
  };

  return (
    // ページ全体のコンテナ
    <Box maxW="1400px" mx="auto" p={4} height="calc(100vh - 80px)">
      {/* ページ全体を縦に3分割するためのFlex */}
      <Flex direction="column" height="100%">
        {/* 1. 上部のナビゲーションバー */}
        <Flex justify="space-between" align="center" mb={4}>
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
            onClick={handleSubmit}
            isDisabled={!text.trim()} // テキストが空かスペースのみの場合は無効
          >
            とうこう
          </TextButton>
        </Flex>

        {/* 2. メインの入力エリア (残りの高さいっぱいに広げる) */}
        <Flex flex="1" my={4} direction="column">
          <Flex flex="1">
            <ProfileIcon src={src} alt={alt} name="自分" size="md" />
            <PostInput
              value={text}
              onChange={(e) => {
                const inputText = e.target.value;
                // 140文字を超えていたら、それ以上入力させない
                if (inputText.length <= 140) {
                  setText(inputText);
                }
              }}
              placeholder="こんな発見したよ！"
              variant="unstyled" // 枠線を消す
              fontSize="lg"
              ml={4}
              height="100%"
              resize="none" // リサイズハンドルを消す
            />
          </Flex>
          
          <Flex justify="flex-end" color={text.length > 140 ? "red.500" : "gray.500"}>
            {text.length} / 140
          </Flex>
        </Flex>

        {/* 3. 下部のアイコンボタン */}
        <HStack spacing={4}>
          <MarkButton label="Image" icon={<FaImage />} />
          <MarkButton label="Camera" icon={<FaCamera />} />
        </HStack>
      </Flex>
    </Box>
  );
};

export default InputPage;
