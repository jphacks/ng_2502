import axios from "axios";
import { Pencil, Settings } from "@tamagui/lucide-icons";
import { YStack, XStack, Text, Circle, Button, View, Spinner } from "tamagui";
import { useRouter } from "expo-router";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { API_BASE_URL } from "@/constants/api";
import { useUser } from "@/hooks/useUser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WhiteTextButton } from "@/components/ui/WhiteTextButton";
import { ProfileIcon } from "@/components/ui/ProfileIcon";

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

export default function Mypage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    username: globalUsername,
    comment: globalComment,
    iconColor: globalIconColor,
  } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [localUsername, setLocalUsername] = useState(globalUsername ?? "");
  //コメント入力欄
  const [localComment, setLocalComment] = useState(globalComment ?? "");
  const [localIconColor, setLocalIconColor] = useState(
    globalIconColor || "blue",
  );

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

        const response = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        console.log("✅ プロフィール取得成功:", response.data);
        setLocalUsername(response.data.username || globalUsername || "");
        setLocalIconColor(response.data.iconColor || globalIconColor || "blue");
        setLocalComment(response.data.comment || globalComment || "");
        //setMode(response.data.mode || "てんさく");
        //setHasParentPassword(response.data.hasParentPassword || false);
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
        paddingTop={insets.top + 16}
        space="$8"
        maxWidth={800}
        alignSelf="center"
        width="100%"
      >
        {/* 1. 上部のナビゲーションバー */}
        <XStack justifyContent="space-between" alignItems="center">
          <WhiteTextButton
            onPress={() => router.back()} // onClick -> onPress
          >
            <Text>もどる</Text>
          </WhiteTextButton>
          <TouchableOpacity onPress={() => router.push("/modeset")}>
            <Settings size={32} color="#F5A623" />
          </TouchableOpacity>
        </XStack>

        <YStack alignItems="center" space="$4" paddingBottom="$8">
          <XStack
            alignItems="center"
            padding={20}
            backgroundColor="white"
            gap="$4"
          >
            <ProfileIcon
              src={iconMap[localIconColor]?.src || iconMap.blue.src}
              alt={iconMap[localIconColor]?.alt || iconMap.blue.alt}
              size="xl"
            />

            {/* 名前とコメント */}
            <YStack flex={1} gap="$1">
              <XStack alignItems="center" gap="$2">
                {/* ユーザー名 */}
                <Text fontSize={24} fontWeight="bold">
                  {localUsername}
                </Text>

                {/* 編集ボタン */}
                <Button
                  size="$2"
                  circular
                  backgroundColor="transparent"
                  pressStyle={{ opacity: 0.7 }}
                  onPress={() => router.push("/profile")}
                >
                  <Pencil size={18} color="#F5A623" />
                </Button>
              </XStack>

              {/* コメント */}
              <Text fontSize={14} color="#666">
                {localComment}
              </Text>
            </YStack>
          </XStack>
          {/* ともだち追加ボタン */}
          <TouchableOpacity
            //onPress={() => router.push("./parentsetting")}
            style={{
              marginTop: 60,
              backgroundColor: "#F5A623",
              paddingVertical: 18,
              paddingHorizontal: 40,
              borderRadius: 20,
            }}
          >
            <Text color="white" fontSize={22} fontWeight="bold">
              ともだちをさがす
            </Text>
          </TouchableOpacity>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
