import { Text, View, XStack, YStack } from "tamagui";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { ProfileButton } from "@/components/ui/ProfileButton";
import axios from "axios";
import { auth } from "@/firebase";
import { API_BASE_URL } from "@/constants/api";
import { WhiteTextButton } from "@/components/ui/WhiteTextButton";
import { TextButton } from "@/components/ui/TextButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ModePage() {
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  //親パスワードの有無
  const [hasParentPassword, setHasParentPassword] = useState(false);

  // 現在選ばれているモード
  const [mode, setMode] = useState<"てんさく" | "じゆう">("てんさく");

  //4桁数字パスワードにするための変更
  const [pinModalVisible, setPinModalVisible] = useState(false);

  const [pinInput, setPinInput] = useState("");

  const [pendingMode, setPendingMode] = useState<"てんさく" | "じゆう" | null>(
    null,
  );

  //パスワード設定のAPI呼び出し
  const verifyParentPassword = async (password: string) => {
    const user = auth.currentUser;
    if (!user) return false;

    const idToken = await user.getIdToken();

    try {
      await axios.post(
        `${API_BASE_URL}/profile/verify-parent-password`,
        { password },
        {
          headers: { Authorization: `Bearer ${idToken}` },
        },
      );

      return true;
    } catch {
      return false;
    }
  };

  const setParentPassword = async (pin: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();

      await axios.post(
        `${API_BASE_URL}/profile/parent-password`,
        {
          password: pin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setHasParentPassword(true);

      return true;
    } catch (error) {
      console.error("🔥 PIN設定失敗", error);

      Alert.alert("エラー", "PIN設定に失敗しました");

      return false;
    }
  };

  const handlePinSubmit = async () => {
    if (!/^\d{4}$/.test(pinInput)) {
      Alert.alert("エラー", "4桁の数字を入力してください");
      return;
    }

    // 初回設定
    if (!hasParentPassword) {
      const ok = await setParentPassword(pinInput);

      if (ok) {
        setPinModalVisible(false);

        if (pendingMode) {
          setMode(pendingMode);
        }
      }

      return;
    }

    // 2回目以降
    const ok = await verifyParentPassword(pinInput);

    if (!ok) {
      Alert.alert("エラー", "PINが違います");
      return;
    }

    if (pendingMode) {
      setMode(pendingMode);
    }

    setPinModalVisible(false);
  };

  const changeMode = async (newMode: "てんさく" | "じゆう") => {
    setPendingMode(newMode);
    setPinInput("");
    setPinModalVisible(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      setIsSaving(false);
      return;
    }

    const profileData = {
      mode: mode,
    };

    try {
      const idToken = await user.getIdToken();
      const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      console.log("✅ プロフィール更新成功:", response.data);
      Alert.alert("成功", "モード設定を保存しました");
      router.replace("/profile"); // 完了後は一覧画面へ遷移
    } catch (error: any) {
      console.error("🔥 モード設定の更新に失敗しました:", error);
      //コメントが不適切な場合は、APIからのエラーメッセージを表示する
      const message =
        error.response?.data?.detail || "モード設定を保存できませんでした";

      Alert.alert("モード設定を変更できません", message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 4桁PIN入力のモーダル */}
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
      </Modal>
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

          {/* 4. モード選択エリア */}
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
          </YStack>

          {/* おうちの人の設定ボタン */}
          <TouchableOpacity
            //onPress={() => router.push("/parent-setting")}
            style={{
              marginTop: 60,
              backgroundColor: "#F5A623",
              paddingVertical: 18,
              paddingHorizontal: 40,
              borderRadius: 20,
            }}
          >
            <Text color="white" fontSize={22} fontWeight="bold">
              おうちのひとのせってい
            </Text>
          </TouchableOpacity>
        </YStack>
      </ScrollView>
    </>
  );
}
