import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { Spinner, Text, View, XStack, YStack } from "tamagui";

import { auth } from "@/firebase";
import { useUser } from "@/hooks/useUser";
import { onAuthStateChanged } from "firebase/auth";

import { InputText } from "@/components/ui/InputText";
import { ProfileButton } from "@/components/ui/ProfileButton";
import { ProfileIcon } from "@/components/ui/ProfileIcon";
import { TextButton } from "@/components/ui/TextButton";
import { WhiteTextButton } from "@/components/ui/WhiteTextButton";

const iconMap: Record<string, { src: any; alt: string }> = {
  blue: { src: require("@/assets/images/UserIcon_Blue.png"), alt: "Blue Icon" },
  cream: {
    src: require("@/assets/images/UserIcon_Cream.png"),
    alt: "Cream Icon",
  },
  green: {
    src: require("@/assets/images/UserIcon_Green.png"),
    alt: "Green Icon",
  },
  mint: { src: require("@/assets/images/UserIcon_Mint.png"), alt: "Mint Icon" },
  navy: { src: require("@/assets/images/UserIcon_Navy.png"), alt: "Navy Icon" },
  olive: {
    src: require("@/assets/images/UserIcon_Olive.png"),
    alt: "Olive Icon",
  },
  purple: {
    src: require("@/assets/images/UserIcon_Purple.png"),
    alt: "Purple Icon",
  },
  red: { src: require("@/assets/images/UserIcon_Red.png"), alt: "Red Icon" },
  yellow: {
    src: require("@/assets/images/UserIcon_Yellow.png"),
    alt: "Yellow Icon",
  },
};

type IconColor =
  | "blue"
  | "cream"
  | "green"
  | "mint"
  | "navy"
  | "olive"
  | "purple"
  | "red"
  | "yellow";

const API_URL = "https://ng-2502testesu.onrender.com";

export default function ProfilePage() {
  const {
    username: globalUsername,
    setUsername: setGlobalUsername,
    iconColor: globalIconColor,
    setIconColor: setGlobalIconColor,
  } = useUser();

  const router = useRouter();

  const [localUsername, setLocalUsername] = useState(globalUsername ?? "");
  const [localIconColor, setLocalIconColor] = useState(
    globalIconColor || "blue",
  );
  const [mode, setMode] = useState<"てんさく" | "じゆう">("てんさく");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    /*
    // 🚧 UI確認用のテストモード: 強制的にローディングを解除して画面を表示します
    console.log("🚧 テストモード: 認証をスキップします");
    setIsLoading(false);
    */

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ ユーザーが認証されていません");
        Alert.alert("エラー", "ログインが必要です");
        router.replace("/login"); // 戻れないように遷移
        return;
      }

      console.log("✅ 認証済みユーザー:", user.uid);
      setIsLoading(true);

      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        console.log("✅ プロフィール取得成功:", response.data);
        setLocalUsername(response.data.username || globalUsername || "");
        setLocalIconColor(response.data.iconColor || globalIconColor || "blue");
        setMode(response.data.mode || "てんさく");
      } catch (error: any) {
        console.error("🔥 プロフィールの取得に失敗:", error);
        Alert.alert(
          "取得エラー",
          error.response?.data?.detail || error.message,
        );
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      setIsSaving(false);
      return;
    }

    const profileData = {
      username: localUsername,
      iconColor: localIconColor,
      mode: mode,
    };

    try {
      const idToken = await user.getIdToken();
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      console.log("✅ プロフィール更新成功:", response.data);

      setGlobalUsername(localUsername);
      setGlobalIconColor(localIconColor);

      Alert.alert("成功", "プロフィールを保存しました");
      router.back(); // 完了したら一覧画面などへ戻る
    } catch (error: any) {
      console.error("🔥 プロフィールの更新に失敗しました:", error);
      Alert.alert("保存エラー", error.response?.data?.detail || error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#fff"
      >
        <Spinner size="large" color="$orange10" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack
        padding="$4"
        space="$8"
        maxWidth={800}
        alignSelf="center"
        width="100%"
      >
        {/* 1. 上部のナビゲーションバー */}
        <XStack justifyContent="space-between" alignItems="center">
          <WhiteTextButton
            onPress={() => router.back()} // onClick -> onPress
            disabled={isSaving} // isDisabled -> disabled
          >
            やめる
          </WhiteTextButton>
          <TextButton onPress={handleSave} disabled={isSaving}>
            {isSaving ? "ほぞん中..." : "けってい"}
          </TextButton>
        </XStack>

        {/* 2. メインのアイコンと名前編集エリア */}
        <XStack
          space="$6"
          alignItems="center"
          justifyContent="center"
          paddingVertical="$4"
          width="100%"
        >
          <ProfileIcon
            src={iconMap[localIconColor]?.src || iconMap.blue.src}
            alt={iconMap[localIconColor]?.alt || iconMap.blue.alt}
            size="xl"
          />
          {/* 横並びの時は width="100%" ではなく flex={1} を使うと綺麗に収まります */}
          <View flex={1} maxWidth={400}>
            <InputText
              placeholder="なまえ"
              value={localUsername}
              onChangeText={setLocalUsername}
              editable={!isSaving}
            />
          </View>
        </XStack>

        {/* 3. アイコン選択エリア */}
        <YStack alignItems="center" space="$4">
          <Text color="#FFB433" fontSize={20} fontWeight="bold">
            アイコンをえらんでね
          </Text>
          <XStack flexWrap="wrap" justifyContent="center" gap="$3">
            {Object.keys(iconMap).map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setLocalIconColor(color as IconColor)}
                disabled={isSaving}
                style={{
                  borderWidth: localIconColor === color ? 3 : 1,
                  borderColor: localIconColor === color ? "#ffb433" : "#E2E8F0",
                  borderRadius: 999, // 完全な円にする
                  padding: 4,
                }}
              >
                <ProfileIcon
                  src={iconMap[color].src}
                  size="md" // サムネイル用に小さめ
                />
              </TouchableOpacity>
            ))}
          </XStack>
        </YStack>

        {/* 4. モード選択エリア */}
        <YStack alignItems="center" space="$4" paddingBottom="$8">
          <Text color="#FFB433" fontSize={20} fontWeight="bold">
            モードをえらんでね
          </Text>
          <XStack space="$4">
            <ProfileButton
              onPress={() => setMode("てんさく")} // onClick -> onPress
              isActive={mode === "てんさく"}
              disabled={isSaving}
            >
              てんさく
            </ProfileButton>
            <ProfileButton
              onPress={() => setMode("じゆう")}
              isActive={mode === "じゆう"}
              disabled={isSaving}
            >
              じゆう
            </ProfileButton>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
