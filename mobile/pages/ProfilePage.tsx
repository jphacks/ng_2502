import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spinner, Text, View, XStack, YStack } from "tamagui";

import { auth } from "@/firebase";
import { API_BASE_URL } from "@/constants/api";
import { useUser } from "@/hooks/useUser";
import { onAuthStateChanged } from "firebase/auth";

import { InputText } from "@/components/ui/InputText";
import { ProfileButton } from "@/components/ui/ProfileButton";
import { ProfileIcon } from "@/components/ui/ProfileIcon";
import { TextButton } from "@/components/ui/TextButton";
import { WhiteTextButton } from "@/components/ui/WhiteTextButton";
import { FontAwesome } from "@expo/vector-icons";

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

export default function ProfilePage() {
  const {
    username: globalUsername,
    setUsername: setGlobalUsername,
    comment: globalComment,
    setComment: setGlobalComment,
    iconColor: globalIconColor,
    setIconColor: setGlobalIconColor,
  } = useUser();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [localUsername, setLocalUsername] = useState(globalUsername ?? "");
  //コメント入力欄
  const [localComment, setLocalComment] = useState(globalComment ?? "");
  const [localIconColor, setLocalIconColor] = useState(
    globalIconColor || "blue",
  );
  // 親パスワードの有無(モード)
  //const [hasParentPassword, setHasParentPassword] = useState(false);
  // 現在選ばれているモード
  //const [mode, setMode] = useState<"てんさく" | "じゆう">("てんさく");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  //4桁数字パスワードにするための変更
  //const [pinModalVisible, setPinModalVisible] = useState(false);

  //const [pinInput, setPinInput] = useState("");

  //const [pendingMode, setPendingMode] = useState<"てんさく" | "じゆう" | null>(
  //  null,
  //);

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

      // メール認証が完了しているか確認
      await user.reload();
      if (!user.emailVerified) {
        console.log("❌ メール未認証");
        alert("メール認証してください");
        router.replace("/login");
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
      comment: localComment,
      iconColor: localIconColor,
      //mode: mode,
    };

    try {
      const idToken = await user.getIdToken();
      const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      console.log("✅ プロフィール更新成功:", response.data);

      setGlobalUsername(localUsername);
      setGlobalIconColor(localIconColor);
      setGlobalComment(localComment);

      Alert.alert("成功", "プロフィールを保存しました");
      router.replace("/(tabs)/list"); // 完了後は一覧画面へ遷移
    } catch (error: any) {
      console.error("🔥 プロフィールの更新に失敗しました:", error);
      //コメントが不適切な場合は、APIからのエラーメッセージを表示する
      const message =
        error.response?.data?.detail || "プロフィールを保存できませんでした";

      Alert.alert("コメントをへんこうできません", message);
    } finally {
      setIsSaving(false);
    }
  };

  //パスワード設定のAPI呼び出し
  //const verifyParentPassword = async (password: string) => {
  //const user = auth.currentUser;
  //if (!user) return false;

  //const idToken = await user.getIdToken();

  //try {
  //await axios.post(
  //`${API_BASE_URL}/profile/verify-parent-password`,
  //{ password },
  //{
  //headers: { Authorization: `Bearer ${idToken}` },
  //},
  //);

  //return true;
  //} catch {
  //return false;
  //}
  //};

  //const setParentPassword = async (pin: string) => {
  //try {
  //const token = await auth.currentUser?.getIdToken();

  //await axios.post(
  //`${API_BASE_URL}/profile/parent-password`,
  //{
  //password: pin,
  //},
  //{
  //headers: {
  // Authorization: `Bearer ${token}`,
  //     },
  //   },
  // );

  //   setHasParentPassword(true);

  //     return true;
  //   } catch (error) {
  //     console.error("🔥 PIN設定失敗", error);

  //     Alert.alert("エラー", "PIN設定に失敗しました");

  //     return false;
  //   }
  // };

  // const handlePinSubmit = async () => {
  //   if (!/^\d{4}$/.test(pinInput)) {
  //     Alert.alert("エラー", "4桁の数字を入力してください");
  //     return;
  //   }

  //   // 初回設定
  //   if (!hasParentPassword) {
  //     const ok = await setParentPassword(pinInput);

  //     if (ok) {
  //       setPinModalVisible(false);

  //       if (pendingMode) {
  //         setMode(pendingMode);
  //       }
  //     }

  //     return;
  //   }

  //   // 2回目以降
  //   const ok = await verifyParentPassword(pinInput);

  //   if (!ok) {
  //     Alert.alert("エラー", "PINが違います");
  //     return;
  //   }

  //   if (pendingMode) {
  //     setMode(pendingMode);
  //   }

  //   setPinModalVisible(false);
  // };

  // const changeMode = async (newMode: "てんさく" | "じゆう") => {
  //   setPendingMode(newMode);
  //   setPinInput("");
  //   setPinModalVisible(true);
  // };

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
    <>
      {/* 4桁PIN入力のモーダル
      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor="rgba(0,0,0,0.4)"
        >
          <View
            backgroundColor="white"
            padding="$6"
            borderRadius={20}
            width="80%"
            alignItems="center"
            gap="$4"
          >
            <Text fontSize={20} fontWeight="bold">
              {hasParentPassword ? "保護者PINを入力" : "4桁PINを設定"}
            </Text>
            <TextInput
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="number-pad" // 数字キーボードを表示
              secureTextEntry // 入力を隠す
              maxLength={4} // 4桁に制限
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                width: 120,
                fontSize: 28,
                textAlign: "center",
                padding: 12,
                borderRadius: 10,
                letterSpacing: 10,
              }}
            />
            <XStack gap="$4">
              <WhiteTextButton
                onPress={() => {
                  setPinModalVisible(false);
                }}
              >
                <Text>キャンセル</Text>
              </WhiteTextButton>
              <TextButton onPress={handlePinSubmit}>OK</TextButton>
            </XStack>
          </View>
        </View>
      </Modal> */}
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
              disabled={isSaving} // isDisabled -> disabled
            >
              <Text>やめる</Text>
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

          {/* 3. ひとことコメント入力 */}
          <YStack space="$3" alignItems="center">
            <View width="100%" maxWidth={400}>
              <InputText
                placeholder="ひとこと"
                value={localComment}
                onChangeText={setLocalComment}
                editable={!isSaving}
              />
            </View>
          </YStack>

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
                    borderColor:
                      localIconColor === color ? "#ffb433" : "#E2E8F0",
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

          {/* 4. モード選択エリア
          <YStack alignItems="center" space="$4" paddingBottom="$8">
            <Text color="#FFB433" fontSize={20} fontWeight="bold">
              モードをえらんでね
            </Text>
            <XStack space="$4">
              <ProfileButton
                onPress={() => changeMode("てんさく")} // onClick -> onPress
                isActive={mode === "てんさく"}
                disabled={isSaving}
              >
                てんさく
              </ProfileButton>
              <ProfileButton
                onPress={() => changeMode("じゆう")}
                isActive={mode === "じゆう"}
                disabled={isSaving}
              >
                じゆう
              </ProfileButton>
            </XStack>
          </YStack> */}
        </YStack>
      </ScrollView>
      {/* ボトムナビゲーション */}
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingBottom={insets.bottom + 8}
        paddingTop="$3"
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="$gray3"
        justifyContent="space-around"
        alignItems="center"
      >
        <Pressable>
          <FontAwesome name="bell-o" size={24} color="#FFB433" />
        </Pressable>
        <Pressable onPress={() => router.push("/(tabs)/list")}>
          <FontAwesome name="home" size={26} color="#FFB433" />
        </Pressable>
        <Pressable>
          <FontAwesome name="comment-o" size={24} color="#FFB433" />
        </Pressable>
      </XStack>
    </>
  );
}
