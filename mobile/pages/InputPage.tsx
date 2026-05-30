import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";
import { NgReason } from "../components/ui/NgReason";
import { PostInput, SelectedImage } from "../components/ui/PostInput";
import { ProfileIcon } from "../components/ui/ProfileIcon";
import { WhiteTextButton } from "../components/ui/WhiteTextButton";
import { API_BASE_URL } from "../constants/api";
import { storage, auth } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUser } from "../hooks/useUser";
import * as ImageManipulator from "expo-image-manipulator";

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
  const [isToFollower, setIsToFollower] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isNgOpen, setIsNgOpen] = useState(false);
  const [ngReason, setNgReason] = useState("");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { iconColor } = useUser();

  const iconUri = useMemo(() => {
    const source = iconMap[iconColor] ?? iconMap.blue;
    return Image.resolveAssetSource(source).uri;
  }, [iconColor]);

  const uploadImage = async (
    imageUri: string,
    imageName: string,
  ): Promise<string> => {
    try {
      setIsUploading(true);

      // HEIF/HEIC画像をJPEGに変換
      const ext = imageName.split(".").pop()?.toLowerCase();
      let finalUri = imageUri;
      let finalName = imageName;

      if (ext === "heic" || ext === "heif") {
        try {
          const manipulated = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 1920, height: 1920 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
          );
          finalUri = manipulated.uri;
          finalName = imageName.replace(/\.(heic|heif)$/i, ".jpg");
          console.log("✅ HEIF→JPEG変換成功");
        } catch (convertError) {
          console.warn(
            "HEIF変換失敗、元のイメージでアップロード:",
            convertError,
          );
        }
      }

      // Fetch image blob from URI
      const response = await fetch(finalUri);
      const blob = await response.blob();

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const uuid = Math.random().toString(36).substring(2, 15);
      const uploadName = `posts/${timestamp}_${uuid}_${finalName}`;
      const storageRef = ref(storage, uploadName);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      console.log("✅ 画像アップロード成功:", downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error("🔥 画像アップロードエラー:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!text.trim() || !user) {
      console.warn("テキストが入力されていないか、ログインしていません。");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage.uri, selectedImage.name);
        } catch (uploadError) {
          console.error("画像アップロード失敗:", uploadError);
          Alert.alert("画像アップロード失敗", "再度お試しください");
          setIsSubmitting(false);
          return;
        }
      }

      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: text,
          imageUrl,
          replyTo: null,
          isToFollower,
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
          disabled={!text.trim() || isSubmitting || isUploading}
          accessibilityLabel="とうこう"
          backgroundColor="#FFB433"
          color="#FFFFFF"
          borderWidth={0}
          paddingHorizontal="$4"
          borderRadius="$2"
          fontWeight="600"
          fontSize={16}
          opacity={!text.trim() || isSubmitting || isUploading ? 0.5 : 1}
          $platform-web={{
            cursor:
              !text.trim() || isSubmitting || isUploading
                ? "not-allowed"
                : "pointer",
          }}
          hoverStyle={{
            backgroundColor: "#ffb120",
            opacity: 0.8,
          }}
          pressStyle={{
            opacity: 0.7,
          }}
        >
          <Feather
            name={isUploading ? "loader" : "send"}
            size={20}
            color="#FFFFFF"
          />
        </Button>
      </XStack>

      <XStack flex={1} gap="$3">
        <ProfileIcon src={iconUri} name="自分" size="md" />
        <YStack flex={1}>
          <XStack gap="$2" mb="$2">
            <Button
              onPress={() => setIsToFollower(false)}
              backgroundColor={isToFollower ? "#F3F4F6" : "#FFB433"}
              color={isToFollower ? "#374151" : "#FFFFFF"}
              borderWidth={0}
              borderRadius="$10"
              paddingHorizontal="$3"
              fontSize={14}
              fontWeight="600"
            >
              みんな向け
            </Button>
            <Button
              onPress={() => setIsToFollower(true)}
              backgroundColor={isToFollower ? "#FFB433" : "#F3F4F6"}
              color={isToFollower ? "#FFFFFF" : "#374151"}
              borderWidth={0}
              borderRadius="$10"
              paddingHorizontal="$3"
              fontSize={14}
              fontWeight="600"
            >
              友達向け
            </Button>
          </XStack>
          <PostInput
            value={text}
            onChangeText={(inputText: string) => {
              if (inputText.length <= 140) {
                setText(inputText);
              }
            }}
            onImageSelect={setSelectedImage}
            placeholder="こんな発見したよ！"
            style={styles.postInput}
          />
          <XStack justifyContent="space-between" alignItems="center" mt="$2">
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
