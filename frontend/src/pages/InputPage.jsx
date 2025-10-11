import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Textarea
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaImage, FaCamera } from 'react-icons/fa';
import { ProfileIcon } from '../components/ProfileIcon'; // パスは構成に合わせてください

export const InputPage = () => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    console.log('投稿内容:', text);
    // ここで投稿処理を行い、前のページに戻るなどのナビゲーションを行う
  };

  return (
    // ページ全体のコンテナ
    <Box maxW="600px" mx="auto" p={4} height="calc(100vh - 80px)">
      {/* ページ全体を縦に3分割するためのFlex */}
      <Flex direction="column" height="100%">
        {/* 1. 上部のナビゲーションバー */}
        <Flex justify="space-between" align="center" mb={4}>
          <Button variant="outline" borderRadius="full">
            やめる
          </Button>
          <Button
            colorScheme="orange"
            borderRadius="full"
            onClick={handleSubmit}
            isDisabled={!text.trim()} // テキストが空かスペースのみの場合は無効
          >
            とうこう
          </Button>
        </Flex>

        {/* 2. メインの入力エリア (残りの高さいっぱいに広げる) */}
        <Flex flex="1" my={4}>
          <ProfileIcon src="/UserIcon_Blue.png" name="自分" size="md" />
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="こんな発見したよ！"
            variant="unstyled" // 枠線を消す
            fontSize="lg"
            ml={4}
            height="100%"
            resize="none" // リサイズハンドルを消す
          />
        </Flex>

        {/* 3. 下部のアイコンボタン */}
        <HStack spacing={4}>
          <IconButton
            aria-label="画像を選択"
            icon={<FaImage size="24px" />}
            variant="ghost"
            color="orange.400"
          />
          <IconButton
            aria-label="カメラを起動"
            icon={<FaCamera size="24px" />}
            variant="ghost"
            color="orange.400"
          />
        </HStack>
      </Flex>
    </Box>
  );
};