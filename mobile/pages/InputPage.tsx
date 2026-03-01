import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";
import { NgReason } from "../components/ui/NgReason";
import { PostInput } from "../components/ui/PostInput";
import { ProfileIcon } from "../components/ui/ProfileIcon";
import { WhiteTextButton } from "../components/ui/WhiteTextButton";
import { API_BASE_URL } from "../constants/api";
import { auth } from "../firebase";
import { useUser } from "../hooks/useUser";

const iconMap = {
  blue: require("../assets/images/UserIcon_Blue.png"),
  cream: require("../assets/images/UserIcon_Cream.png"),
  green: require("../assets/images/UserIcon_Green.png"),
  mint: require("../assets/images/UserIcon_Mint.png"),
  navy: require("../assets/images/UserIcon_Navy.png"),
  olive: require("../assets/images/UserIcon_Olive.png"),
  purple: require("../assets/images/UserIcon_Purple.png"),
  red: require("../assets/images/UserIcon_Red.png"),
  yellow: require("../assets/images/UserIcon_Yellow.png"),
} as const;

const InputPage = () => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNgOpen, setIsNgOpen] = useState(false);
  const [ngReason, setNgReason] = useState("");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { iconColor } = useUser();

  const iconUri = useMemo(() => {
    const source = iconMap[iconColor] ?? iconMap.blue;
    return Image.resolveAssetSource(source).uri;
  }, [iconColor]);

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!text.trim() || !user) {
      console.warn("テキストが入力されていないか、ログインしていません。");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text,
          imageUrl: null,
          replyTo: null,
        }),
      });

      if (!response.ok) {
        let detail: string | undefined;
        try {
          const data = await response.json();
          detail = data?.detail;
        } catch {
          try {
            detail = await response.text();
          } catch {
            detail = undefined;
          }
        }

        const error: Error & { status?: number; detail?: string } = new Error(
          detail || `Request failed (${response.status})`,
        );
        error.status = response.status;
        error.detail = detail;
        throw error;
      }

      const data = await response.json();
      console.log("✅ 投稿成功:", data);
      router.push("/(tabs)/list");
    } catch (error) {
      setIsSubmitting(false);
      const err = error as {
        status?: number;
        detail?: string;
        message?: string;
      };
      const status = err.status;
      const detail = err.detail || err.message;

      if (status === 400 && typeof detail === "string") {
        const extracted = detail.replace(/^不適切な投稿です[:：]\s?/, "");
        setNgReason(extracted || detail);
        setIsNgOpen(true);
      } else {
        alert(detail || "投稿に失敗しました");
      }
    }
  };

  return (
    <YStack style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <XStack justifyContent="space-between" alignItems="center" mb="$3">
        <WhiteTextButton
          onPress={() => router.push("/(tabs)/list")}
          accessibilityLabel="やめる"
        >
          <Feather name="x" size={20} color="#FFB433" />
        </WhiteTextButton>
        <Button
          onPress={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          accessibilityLabel="とうこう"
          backgroundColor="#FFB433"
          color="#FFFFFF"
          borderWidth={0}
          paddingHorizontal="$4"
          borderRadius="$2"
          fontWeight="600"
          fontSize={16}
          opacity={!text.trim() || isSubmitting ? 0.5 : 1}
          $platform-web={{
            cursor: !text.trim() || isSubmitting ? "not-allowed" : "pointer",
          }}
          hoverStyle={{
            backgroundColor: "#ffb120",
            opacity: 0.8,
          }}
          pressStyle={{
            opacity: 0.7,
          }}
        >
          <Feather name="send" size={20} color="#FFFFFF" />
        </Button>
      </XStack>

      <XStack flex={1} gap="$3">
        <ProfileIcon src={iconUri} name="自分" size="md" />
        <YStack flex={1}>
          <PostInput
            value={text}
            onChangeText={(inputText: string) => {
              if (inputText.length <= 140) {
                setText(inputText);
              }
            }}
            placeholder="こんな発見したよ！"
            style={styles.postInput}
          />
          <XStack justifyContent="flex-end" mt="$2">
            <Text color={text.length > 140 ? "$red10" : "$gray10"}>
              {text.length} / 140
            </Text>
          </XStack>
        </YStack>
      </XStack>

      <NgReason
        isOpen={isNgOpen}
        onClose={() => setIsNgOpen(false)}
        reason={ngReason}
      />
    </YStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  postInput: {
    minHeight: 180,
  },
});

export default InputPage;
