import { Ionicons } from "@expo/vector-icons"; // Expo標準のアイコンパック
import React, { useEffect, useState } from "react";
import { Button, Text, View, YStack } from "tamagui";

// ※ AttentionModal のパスは実際のフォルダ構成に合わせて調整してください
import { AttentionModal } from "@/components/ui/AttentionModal";

// --- カウントダウン用のカスタムフック (TypeScriptの型を追加) ---
export const useCountDownInterval = (
  countTime: number,
  setCountTime: React.Dispatch<React.SetStateAction<number>>,
) => {
  useEffect(() => {
    const countDownInterval = setInterval(() => {
      if (countTime === 0) {
        clearInterval(countDownInterval);
      }
      if (countTime > 0) {
        setCountTime(countTime - 1);
      }
    }, 1000);
    return () => {
      clearInterval(countDownInterval);
    };
  }, [countTime, setCountTime]); // ESLintの警告対策で setCountTime を追加
};

// --- メインコンポーネント ---
export default function SpamPage() {
  const [countTime, setCountTime] = useState(10);

  // Chakra UI の useDisclosure の代わり
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  // タイマーフックの呼び出し
  useCountDownInterval(countTime, setCountTime);

  // カウントが0になったらモーダルを開く
  useEffect(() => {
    if (countTime === 0) {
      onOpen();
    }
  }, [countTime]);

  return (
    // 画面全体を赤く塗りつぶすコンテナ
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="#ff0000"
      padding="$4"
    >
      <YStack space="$6" alignItems="center">
        {/* 警告アイコン */}
        <Ionicons name="warning" size={80} color="#ffffff" />

        {/* タイトルテキスト */}
        <Text fontSize={32} color="white" fontWeight="bold" textAlign="center">
          ウイルスが見つかりました！
        </Text>

        {/* 説明テキスト */}
        <Text
          fontSize={18}
          color="white"
          fontWeight="bold"
          textAlign="center"
          paddingHorizontal="$4"
        >
          あなたのスマホはわるい人のせいでやばいことになっています。すぐに下のボタンをタップして、ウイルスをやっつけてください！
        </Text>

        {/* カウントダウンタイマー (1桁の時は0を補完) */}
        <Text fontSize={48} fontWeight="bold" color="white">
          00:{countTime < 10 ? `0${countTime}` : countTime}
        </Text>

        {/* アクションボタン */}
        <Button
          size="$6"
          backgroundColor="yellow"
          color="black"
          fontWeight="bold"
          fontSize={20}
          borderRadius={8}
          onPress={onOpen}
          pressStyle={{ opacity: 0.8 }}
          marginTop="$4"
        >
          今すぐここをタップ！！！
        </Button>

        {/* モーダルコンポーネント */}
        {/* ※ AttentionModal 側でプロパティ名を `visible` にしている場合は visible={isOpen} に修正してください */}
        <AttentionModal visible={isOpen} onClose={onClose} />
      </YStack>
    </View>
  );
}
