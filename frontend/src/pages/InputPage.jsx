import {
  Box,
  Flex,
  HStack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaImage, FaCamera } from 'react-icons/fa';
import { ProfileIcon } from '../components/ProfileIcon'; // パスは構成に合わせてください
import { PostInput } from '../components/PostInput';
import { TextButton } from '../components/TextButton';
import { MarkButton } from '../components/MarkButton';
import BlueIcon from "../assets/UserIcon_Blue.png";
import CreamIcon from "../assets/UserIcon_Cream.png";
import GreenIcon from "../assets/UserIcon_Green.png";
import MintIcon from "../assets/UserIcon_Mint.png";
import NavyIcon from "../assets/UserIcon_Navy.png";
import OliveIcon from "../assets/UserIcon_Olive.png";
import PurpleIcon from "../assets/UserIcon_Purple.png";
import RedIcon from "../assets/UserIcon_Red.png";
import YellowIcon from "../assets/UserIcon_Yellow.png"; // 画像のパスは適宜変更してください
import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. axiosをインポート

const iconMap = {
  blue:   { src: BlueIcon,   alt: "Blue Icon" },
  cream:  { src: CreamIcon,  alt: "Cream Icon" },
  green:  { src: GreenIcon,  alt: "Green Icon" },
  mint:   { src: MintIcon,   alt: "Mint Icon" },
  navy:   { src: NavyIcon,   alt: "Navy Icon" },
  olive:  { src: OliveIcon,  alt: "Olive Icon" },
  purple: { src: PurpleIcon, alt: "Purple Icon" },
  red:    { src: RedIcon,    alt: "Red Icon" },
  yellow: { src: YellowIcon, alt: "Yellow Icon" },
};

export const InputPage = () => {
  const [text, setText] = useState('');
  const navigate = useNavigate();

  // 4. useUserフックを使って、Contextから現在のiconColorを取得
  const { iconColor } = useUser();
  // 5. iconColorに基づいて、表示するアイコンのsrcとaltを決定
  const { src, alt } = iconMap[iconColor] || iconMap.blue; // デフォルトは青

  // 2. handleSubmitを非同期関数(async)に変更
  const handleSubmit = async () => {
    if (!text.trim()) return; // 空の投稿はしない

    try {
      // 3. バックエンドのAPIに投稿内容を送信
      //    URLはあなたのバックエンドAPIのエンドポイントに置き換えてください
      const response = await axios.post('http://localhost:8000/posts', {
        text: text,
        // userId: 'some_user_id' // 実際はログインしているユーザーIDなども送る
      });

      // 4. バックエンドから受け取ったデータ（新しい投稿）をコンソールに表示
      console.log('投稿成功:', response.data);

      // 5. 投稿成功後、投稿一覧ページに移動
      navigate('list');

    } catch (error) {
      console.error('投稿に失敗しました:', error);
      // ここでユーザーにエラーメッセージを表示する処理などを追加できます
    }
  };

  return (
    // ページ全体のコンテナ
    <Box maxW="1400px" mx="auto" p={4} height="calc(100vh - 80px)">
      {/* ページ全体を縦に3分割するためのFlex */}
      <Flex direction="column" height="100%">
        {/* 1. 上部のナビゲーションバー */}
        <Flex justify="space-between" align="center" mb={4}>
          <TextButton
            variant="outline"
            borderRadius="full"
            // 6. 「やめる」ボタンにクリックイベントを追加
            onClick={() => navigate('/list')}
          >
            やめる
          </TextButton>
          <TextButton
            colorScheme="orange"
            borderRadius="full"
            onClick={handleSubmit}
            isDisabled={!text.trim()} // テキストが空かスペースのみの場合は無効
          >
            とうこうする
          </TextButton>
        </Flex>

        {/* 2. メインの入力エリア (残りの高さいっぱいに広げる) */}
        <Flex flex="1" my={4}>
          <ProfileIcon src={src} alt={alt} name="自分" size="md" />
          <PostInput
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
          <MarkButton label="Camera" icon={<FaImage />} />
          <MarkButton label="Camera" icon={<FaCamera />} />
        </HStack>
      </Flex>
    </Box>
  );
};