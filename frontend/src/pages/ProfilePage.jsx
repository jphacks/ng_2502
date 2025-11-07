import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Wrap,
  WrapItem,
  Spinner, // ローディング表示用
  Center, // 中央揃え用
  useToast, // メッセージ表示用
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react"; // useEffectを追加
import { InputText } from "../components/InputText.jsx";
import { TextButton } from "../components/TextButton.jsx";
import { ProfileButton } from "../components/ProfileButton.jsx";
import { ProfileIcon } from "../components/ProfileIcon.jsx";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // axiosをインポート
import { auth } from "../firebase"; // 認証情報を取得するため
import { onAuthStateChanged } from "firebase/auth"; // 追加
import { WhiteTextButton } from "../components/WhiteTextButton.jsx";

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

// FastAPIサーバーのURL
const API_URL = "https://ng-2502testesu.onrender.com";

const ProfilePage = () => {
  // --- Contextからグローバルな状態と更新関数を取得 ---
  const {
    username: globalUsername,
    setUsername: setGlobalUsername,
    iconColor: globalIconColor,
    setIconColor: setGlobalIconColor,
  } = useUser();
  const navigate = useNavigate();
  const toast = useToast(); // メッセージ表示用のフック

  // --- このページ専用の「下書き用」state ---
  // 初期値はContextから取るが、後でAPIから取得した値で上書きする
  const [localUsername, setLocalUsername] = useState(globalUsername ?? "");
  const [localIconColor, setLocalIconColor] = useState(globalIconColor);
  const [mode, setMode] = useState("てんさく");

  // --- 変更点1: ローディング状態を追加 ---
  const [isLoading, setIsLoading] = useState(true); // ページ読み込み中
  const [isSaving, setIsSaving] = useState(false); // 保存処理中

  // --- 変更点2: useEffectでプロフィール情報を取得 ---
  useEffect(() => {
    // Firebase Authの初期化を待つ
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ ユーザーが認証されていません");
        toast({
          title: "ログインが必要です",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
        return;
      }

      console.log("✅ 認証済みユーザー:", user.uid);
      setIsLoading(true);

      try {
        const idToken = await user.getIdToken();
        console.log("🔑 IDトークン取得成功");
        
        // バックエンドの GET /profile エンドポイントを呼び出す
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        console.log("✅ プロフィール取得成功:", response.data);
        // 取得したデータでローカルstateを更新
        setLocalUsername(response.data.username || globalUsername || "");
        setLocalIconColor(response.data.iconColor || globalIconColor || "blue");
        setMode(response.data.mode || "てんさく");
      } catch (error) {
        console.error("🔥 プロフィールの取得に失敗:", error);
        console.error("エラー詳細:", error.response?.data);
        toast({
          title: "プロフィールの取得に失敗しました",
          description: error.response?.data?.detail || error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    });

    // クリーンアップ関数
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 変更点3: handleSaveでAPIに送信する処理を実装 ---
  const handleSave = async () => {
    setIsSaving(true); // 保存処理開始
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "ログインが必要です",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsSaving(false);
      return;
    }

    // 保存するデータ
    const profileData = {
      username: localUsername,
      iconColor: localIconColor,
      mode: mode,
    };

    try {
      const idToken = await user.getIdToken();
      // バックエンドの PUT /profile エンドポイントにデータを送信
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${idToken}`, // ヘッダーにトークンを設定
        },
      });

      console.log("✅ プロフィール更新成功:", response.data);

      // 保存成功後、下書き(ローカルstate)を清書(Context)に反映させる
      setGlobalUsername(localUsername);
      setGlobalIconColor(localIconColor);

      toast({
        title: "プロフィールを保存しました",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/list"); // 保存後、一覧ページに戻る
    } catch (error) {
      console.error("🔥 プロフィールの更新に失敗しました:", error);
      toast({
        title: "プロフィールの保存に失敗しました",
        description: error.response?.data?.detail || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false); // 保存処理完了
    }
  };

  // --- ローディング中の表示 ---
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="orange.400" />
      </Center>
    );
  }

  // --- メインの表示 (JSX部分はほぼ変更なし、ローディング状態をボタンに追加) ---
  return (
    <Box maxW="1400px" mx="auto" p={4}>
      <VStack spacing={8} align="stretch">
        {/* 1. 上部のナビゲーションバー */}
        <Flex justify="space-between" align="center">
          <WhiteTextButton
            variant="outline"
            borderRadius="full"
            onClick={() => navigate("/list")}
            isDisabled={isSaving} // 保存中は無効化
          >
            やめる
          </WhiteTextButton>
          <TextButton
            colorScheme="orange"
            borderRadius="full"
            onClick={handleSave}
            isLoading={isSaving} // 保存中はスピナーを表示
            isDisabled={isSaving} // 保存中は無効化
          >
            けってい
          </TextButton>
        </Flex>

        {/* 2. メインのアイコンと名前編集エリア (InputTextをEditableに戻すのが推奨) */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          w="100%"
          align="center"
          padding={{ base: 4, md: "0 100px" }}
        >
          <ProfileIcon
            src={iconMap[localIconColor]?.src || iconMap.blue.src}
            alt={iconMap[localIconColor]?.alt || iconMap.blue.alt}
            size="2xl"
            boxShadow="md"
          />
          <Flex w="100%" justify="center">
            {/* 名前編集はEditableの方がUXが良いかもしれません */}
            <InputText
              placeholder="なまえ"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              h={{ base: "80px", sm: "88px", lg: "96px" }}
              fontSize={{ base: "56px", sm: "64px", lg: "72px" }}
              textAlign="center"
              w={{ base: "100%", md: "100%", lg: "100%" }}
              isDisabled={isSaving} // 保存中は無効化
            />
          </Flex>
        </Flex>

        {/* 3. アイコン選択エリア (変更なし、ボタン無効化を追加) */}
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
                  onClick={() => setLocalIconColor(color)}
                  borderWidth={localIconColor === color ? "3px" : "1px"}
                  borderColor={
                    localIconColor === color ? "#ffb433" : "gray.200"
                  }
                  borderRadius="full"
                  p="2px"
                  _focus={{ outline: "none", boxShadow: "none" }}
                  isDisabled={isSaving} // 保存中は無効化
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

        {/* 4. モード選択エリア (変更なし、ボタン無効化を追加) */}
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
              isDisabled={isSaving} // 保存中は無効化
            >
              てんさく
            </ProfileButton>
            <ProfileButton
              onClick={() => setMode("じゆう")}
              isActive={mode === "じゆう"}
              isDisabled={isSaving} // 保存中は無効化
            >
              じゆう
            </ProfileButton>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ProfilePage;
