import React, { useState } from 'react';
import {
  Dialog, // Modalの代わりにDialogを使用
  XStack,
  YStack,
  Text,
  Image,
  useWindowDimensions,
} from 'tamagui';
import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

// 画像を一括で配列にする（個別のimportは不要）
const images = [
  require('../../assets/images/slide1.png'),
  require('../../assets/images/slide2.png'),
  require('../../assets/images/slide3.png'),
  require('../../assets/images/slide4.png'),
  require('../../assets/images/slide5.png'),
  require('../../assets/images/slide6.png'),
  require('../../assets/images/slide7.png'),
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [index, setIndex] = useState(0);
  const { height } = useWindowDimensions();

  const handleNext = () => setIndex((i) => (i + 1) % images.length);
  const handlePrev = () =>
    setIndex((i) => (i - 1 + images.length) % images.length);

  // 画像の最大高さを計算
  const imageHeight = Math.min(height * 0.7, 500);

  return (
    <Dialog 
      modal 
      open={isOpen} 
      onOpenChange={(open) => {
        // ダイアログ外をタップして閉じる場合の処理
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        {/* 背景の暗幕 */}
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          onPress={onClose} 
        />

        {/* コンテンツ本体 */}
        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          // アニメーションの初期位置と終了位置
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
          
          // スタイリング
          width="90%"
          maxWidth={600} // PC等で見過ぎないように制限
          backgroundColor="$white"
          borderRadius="$4"
          padding="$4"
        >
          {/* ヘッダー部分 (閉じるボタン) */}
          <XStack justifyContent="flex-end" paddingBottom="$2">
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{ padding: 4 }}
            >
              <Feather name="x" size={24} color="#80CBC4" />
            </Pressable>
          </XStack>

          {/* ボディ部分 (画像と操作) */}
          <YStack
            alignItems="center"
            justifyContent="center"
            space="$4"
          >
            {/* 画像コンテナ */}
            <YStack
              width="100%"
              height={imageHeight}
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              borderRadius="$2"
              backgroundColor="$gray2" // 画像読み込み前の背景
            >
              <Image
                source={images[index]}
                width="100%"
                height="100%"
                resizeMode="contain"
              />
            </YStack>

            {/* ナビゲーション操作 */}
            <XStack space="$4" alignItems="center" justifyContent="center">
              <Pressable
                onPress={handlePrev}
                style={styles.navButton}
              >
                <Feather name="chevron-left" size={30} color="#80CBC4" />
              </Pressable>

              <Text fontSize="$4" color="$gray600" minWidth={60} textAlign="center">
                {index + 1} / {images.length}
              </Text>

              <Pressable
                onPress={handleNext}
                style={styles.navButton}
              >
                <Feather name="chevron-right" size={30} color="#80CBC4" />
              </Pressable>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  navButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});