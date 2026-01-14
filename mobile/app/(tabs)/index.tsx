import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/ui/Header";
import { InputText } from "@/components/ui/InputText";
import { InputComment } from "@/components/ui/InputComment";
import { MarkButton } from "@/components/ui/MarkButton";
import { CircleIcon } from "@/components/ui/CircleIcon";
import { AchievementIcon } from "@/components/ui/AchievementIcon";
import { AchievementModal } from "@/components/ui/AchievementModal";
import { AttentionModal } from "@/components/ui/AttentionModal";
import { ImageButton } from "@/components/ui/ImageButton";
import Layout from "@/components/ui/Layout";

export default function HomeScreen() {
  const [isCommentVisible, setIsCommentVisible] = useState(false);
  const [isAchievementVisible, setIsAchievementVisible] = useState(false);
  const [isAttentionVisible, setIsAttentionVisible] = useState(false);

  const mockAchievements = [
    {
      id: "welcome_snr",
      name: "はじめて",
      description: "SNRを使いはじめたね",
      icon: <Text style={{ fontSize: 32 }}>🎉</Text>,
    },
    {
      id: "first_post",
      name: "さいしょの投稿",
      description: "さいしょの投稿をしたよ",
      icon: <Text style={{ fontSize: 32 }}>📝</Text>,
    },
    {
      id: "ten_posts",
      name: "10かい投稿",
      description: "10かいの投稿をしたよ",
      icon: <Text style={{ fontSize: 32 }}>⭐</Text>,
    },
  ];

  const mockUserIcon = require("@/assets/images/partial-react-logo.png");

  return (
    <ScrollView style={styles.container}>
      <Header
        title="SNR"
        iconSrc={mockUserIcon}
        onPressTutorial={() => alert("チュートリアル")}
        onPressCreate={() => setIsCommentVisible(true)}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentPadding}
      >
        <Text style={styles.sectionTitle}>入力コンポーネント</Text>
        <InputText
          label="ユーザーネーム"
          placeholder="なまえをかいてね"
          editable
        />
        <InputText
          label="メッセージ"
          placeholder="メッセージをかいてね"
          editable
          multiline
        />

        <Text style={styles.sectionTitle}>ボタンコンポーネント</Text>
        <MarkButton
          icon={<Text style={styles.buttonIcon}>+</Text>}
          onPress={() => setIsCommentVisible(true)}
        />

        <Text style={styles.sectionTitle}>アイコンコンポーネント</Text>
        <CircleIcon src={mockUserIcon} size={80} />

        <Text style={styles.sectionTitle}>バッジコンポーネント</Text>
        <AchievementIcon achievement={mockAchievements[0]} isUnlocked={true} />

        <Text style={styles.sectionTitle}>Layoutコンポーネント</Text>
        <View style={styles.layoutDemo}>
          <Layout
            header={
              <View style={styles.layoutHeader}>
                <Text style={styles.layoutHeaderText}>レイアウト</Text>
              </View>
            }
          >
            <Text style={styles.layoutBody}>
              これはLayoutコンポーネントの内容です
            </Text>
          </Layout>
        </View>

        <Text style={styles.sectionTitle}>ImageButtonコンポーネント</Text>
        <ImageButton
          source={mockUserIcon}
          onPress={() => alert("ImageButtonがタップされました")}
        />

        <Text style={styles.sectionTitle}>AttentionModalコンポーネント</Text>
        <MarkButton
          icon={<Text style={styles.buttonIcon}>!</Text>}
          onPress={() => setIsAttentionVisible(true)}
        />
      </ScrollView>

      <InputComment
        visible={isCommentVisible}
        onClose={() => setIsCommentVisible(false)}
        onSubmit={(text) => {
          alert(`コメント: ${text}`);
        }}
      />

      <AchievementModal
        visible={isAchievementVisible}
        onClose={() => setIsAchievementVisible(false)}
        achievements={mockAchievements}
        unlockedIds={["welcome_snr", "first_post"]}
      />

      <AttentionModal
        visible={isAttentionVisible}
        onClose={() => setIsAttentionVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 12,
    color: "#333",
  },
  buttonIcon: {
    fontSize: 24,
    color: "#FFB433",
    fontWeight: "700",
  },
  layoutDemo: {
    height: 120,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  layoutHeader: {
    backgroundColor: "#FFB433",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  layoutHeaderText: {
    color: "#fff",
    fontWeight: "700",
  },
  layoutBody: {
    padding: 12,
    color: "#666",
  },
});
