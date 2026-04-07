import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  View,
  Image,
  Alert,
  Pressable,
} from "react-native";
import { Text, XStack, YStack } from "tamagui";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

export interface SelectedImage {
  uri: string;
  name: string;
  fileSize?: number;
}

interface PostInputProps {
  value?: string;
  onChange?: (text: string) => void;
  onChangeText?: (text: string) => void;
  onImageSelect?: (image: SelectedImage | null) => void;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  [key: string]: any;
}

export const PostInput: React.FC<PostInputProps> = ({
  value,
  onChange,
  onChangeText,
  onImageSelect,
  placeholder = "いまどうしてる？",
  editable = true,
  multiline = true,
  numberOfLines = 5,
  ...rest
}) => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );

  const handleChangeText = (text: string) => {
    // React NativeのTextInputコールバック
    if (onChangeText) {
      onChangeText(text);
    }
    // Reactのchangeイベント互換性
    if (onChange) {
      onChange(text);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const { uri } = asset;
      const filename = uri.split("/").pop() || "image.jpg";

      // ファイル形式のバリデーション
      const ext = filename.split(".").pop()?.toLowerCase();
      const validExtensions = ["jpg", "jpeg", "png", "webp", "heif", "heic"];
      if (!ext || !validExtensions.includes(ext)) {
        Alert.alert(
          "非対応形式",
          "jpg/png/webp/heif/heic のファイルをお選びください",
        );
        return;
      }

      // ファイルサイズのバリデーション（5MB上限）
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert("ファイルが大きい", "5MB以下のファイルをお選びください");
        return;
      }

      const imageData = { uri, name: filename, fileSize: asset.fileSize };
      setSelectedImage(imageData);
      if (onImageSelect) {
        onImageSelect(imageData);
      }
    } catch (error) {
      console.error("画像選択エラー:", error);
      Alert.alert("エラー", "画像の選択に失敗しました");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <YStack space="$2">
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChangeText}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#999"
        {...rest}
      />

      {/* 画像選択ボタン */}
      <XStack space="$2" alignItems="center">
        <Pressable onPress={pickImage} style={styles.imageButton}>
          <XStack space="$2" alignItems="center">
            <Feather name="image" size={20} color="#80CBC4" />
          </XStack>
        </Pressable>

        {selectedImage && (
          <Text fontSize="$2" color="$gray600">
            選択済み: {selectedImage.name}
          </Text>
        )}
      </XStack>

      {/* 画像プレビュー */}
      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.imagePreview}
          />
          <Pressable onPress={removeImage} style={styles.removeButton}>
            <Feather name="x-circle" size={24} color="#fff" />
          </Pressable>
        </View>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  input: {
    minHeight: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "System",
    textAlignVertical: "top",
  },
  imageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#80CBC4",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  imagePreviewContainer: {
    position: "relative",
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 4,
  },
});

export default PostInput;
