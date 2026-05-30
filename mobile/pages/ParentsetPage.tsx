import { useState, useCallback } from "react";
import { TextInput, Alert, Switch, ScrollView } from "react-native";
import { Text, YStack, XStack } from "tamagui";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WhiteTextButton } from "@/components/ui/WhiteTextButton";
import { TextButton } from "@/components/ui/TextButton";
import { auth } from "@/firebase";
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

export default function ModePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

  //親パスワードの有無
  const [hasParentPassword, setHasParentPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  //パスワード確認済み、一時保存用の状態
  const [verifiedPassword, setVerifiedPassword] = useState(false);

  //modeとフレンドのロック設定
  const [currentModeLock, setCurrentModeLock] = useState(true);
  const [currentFriendLock, setCurrentFriendLock] = useState(true);

  //親パスワードの有無をAPIから取得
  const fetchHasParentPassword = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const response = await axios.get(
        `${API_BASE_URL}/profile/has-parent-password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(response.data);

      setHasParentPassword(response.data.has_parent_password);
    } catch (error) {
      console.error("取得失敗", error);
    }
  };

  //modeLockの状態をAPIから取得
  const fetchModeLock = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const response = await axios.get(
        `${API_BASE_URL}/profile/get-mode-lock`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(response.data);

      setCurrentModeLock(response.data.mode_lock);
    } catch (error) {
      console.error("mode lock 取得失敗", error);
    }
  };

  //friendLockの状態をAPIから取得
  const fetchFriendLock = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();

      const response = await axios.get(
        `${API_BASE_URL}/profile/get-friend-lock`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(response.data);

      setCurrentFriendLock(response.data.friend_lock);
    } catch (error) {
      console.error("friend lock 取得失敗", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHasParentPassword();
      fetchModeLock();
      fetchFriendLock();
    }, []),
  );

  // const [pendingMode, setPendingMode] = useState<"てんさく" | "じゆう" | null>(
  //   null,
  // );

  //パスワード設定のAPI呼び出し
  //パスワードが正しいかどうかの確認
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

  //パスワードの設定
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

  //PINの入力を処理する関数
  const handlePinSubmit = async () => {
    if (!/^\d{4}$/.test(newPassword)) {
      //^= 先頭 \d= 数字 {4}= 4回 $= 終端
      Alert.alert("エラー", "4桁の数字を入力してください");
      return;
    }

    // 初回設定
    if (!hasParentPassword) {
      setVerifiedPassword(true);

      Alert.alert("設定完了", "「けってい」を押すと保存します");

      // setCurrentPassword("");
      // setNewPassword("");

      return;
    }

    // 2回目以降
    const ok = await verifyParentPassword(currentPassword);

    if (!ok) {
      Alert.alert("エラー", "現在のパスワードが違います");
      return;
    }

    if (ok) {
      setVerifiedPassword(true);

      Alert.alert("設定完了", "「けってい」を押すとパスワードが変更されます");

      // setCurrentPassword("");
      // setNewPassword("");
    }
  };

  //modeのパスワードon/off設定
  const setModeLock = async (modeLock: boolean) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(
        `${API_BASE_URL}/profile/mode-lock`,
        {
          mode_lock: modeLock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return true;
    } catch (error) {
      console.error("mode lock 保存失敗", error);

      return false;
    }
  };

  //friendLockのパスワードon/off設定
  const setFriendLock = async (friendLock: boolean) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.post(
        `${API_BASE_URL}/profile/friend-lock`,
        {
          friend_lock: friendLock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return true;
    } catch (error) {
      console.error("friend lock 保存失敗", error);

      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      setIsSaving(false);
      return;
    }

    try {
      //const idToken = await user.getIdToken();
      // const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
      //   headers: { Authorization: `Bearer ${idToken}` },
      // });

      if (verifiedPassword) {
        const ok = await setParentPassword(newPassword);

        if (!ok) {
          return;
        }
      }

      const modeLockOk = await setModeLock(currentModeLock);

      if (!modeLockOk) {
        Alert.alert("エラー", "モードロックの保存に失敗しました");
        return;
      }

      const friendLockOk = await setFriendLock(currentFriendLock);

      if (!friendLockOk) {
        Alert.alert("エラー", "ともだちロックの保存に失敗しました");
        return;
      }

      (console.log("✅ 保護者設定更新成功:"), //response.data);
        Alert.alert("成功", "保護者設定を保存しました"));
      router.replace("/modeset"); // 完了後はモード設定画面へ遷移
    } catch (error: any) {
      console.error("🔥 保護者設定の更新に失敗しました:", error);
      //コメントが不適切な場合は、APIからのエラーメッセージを表示する
      const message =
        error.response?.data?.detail || "保護者設定を保存できませんでした";

      Alert.alert("保護者設定を変更できません", message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
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

          {/*タイトル*/}
          <YStack alignItems="center" space="$4" paddingBottom="$8">
            <Text color="#FFB433" fontSize={20} fontWeight="bold">
              保護者用{"\n"}パスワード設定
            </Text>
          </YStack>
          {/* 現在のパスワード */}
          {hasParentPassword && (
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="現在のパスワード"
              keyboardType="number-pad" // 数字キーボードを表示
              secureTextEntry
              maxLength={4} // 4桁に制限
              style={{
                borderWidth: 1,
                borderColor: "#F5A623",
                borderRadius: 14,
                padding: 14,
                fontSize: 20,
                backgroundColor: "white",
              }}
            />
          )}
          {/* 新しいパスワード */}
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="新しいパスワード"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={{
              borderWidth: 1,
              borderColor: "#F5A623",
              borderRadius: 14,
              padding: 14,
              fontSize: 20,
              backgroundColor: "white",
            }}
          />

          <TextButton onPress={handlePinSubmit}>完了</TextButton>

          {/* ON/OFF設定 */}
          <YStack space="$5" marginTop="$6">
            <Text fontSize={28} fontWeight="bold">
              パスワードをかける
            </Text>

            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={24}>モード切り替え</Text>

              <Switch
                value={currentModeLock}
                onValueChange={setCurrentModeLock}
              />
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={24}>ともだち追加</Text>

              <Switch
                value={currentFriendLock}
                onValueChange={setCurrentFriendLock}
              />
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </>
  );
}
