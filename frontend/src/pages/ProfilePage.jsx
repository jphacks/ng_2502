import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { InputText } from '../components/InputText.jsx';
import { TextButton } from '../components/TextButton.jsx';
import { ProfileButton } from '../components/ProfileButton.jsx';
import { ProfileIcon } from '../components/ProfileIcon.jsx';
import { useUser } from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- アイコンのインポートと対応表 ---
import BlueIcon from "../assets/UserIcon_Blue.png";
import CreamIcon from "../assets/UserIcon_Cream.png";
import GreenIcon from "../assets/UserIcon_Green.png";
import MintIcon from "../assets/UserIcon_Mint.png";
import NavyIcon from "../assets/UserIcon_Navy.png";
import OliveIcon from "../assets/UserIcon_Olive.png";
import PurpleIcon from "../assets/UserIcon_Purple.png";
import RedIcon from "../assets/UserIcon_Red.png";
import YellowIcon from "../assets/UserIcon_Yellow.png";

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

export const ProfilePage = () => {
  // --- Contextからグローバルな状態を取得 ---
  const { username, setUsername, iconColor, setIconColor } = useUser();
  const navigate = useNavigate();

  // --- このページ内だけで使う一時的な状態 ---
  const [mode, setMode] = useState('てんさく'); // 'てんさく' or 'じゆう'

  // プロフィール情報を保存する処理
  const handleSave = async () => {
  try {
    // バックエンドに更新情報を送信
    const response = await axios.put('http://localhost:8000/profile', {
      username: username,
      iconColor: iconColor,
      mode: mode,
    });
    console.log('プロフィール更新成功:', response.data);
    navigate('/list'); 

  } catch (error) {
    console.error('プロフィールの更新に失敗しました:', error);
  }
};

  return (
    <Box maxW="1400px" mx="auto" p={4}>
      <VStack spacing={8} align="stretch">
        {/* 1. 上部のナビゲーションバー */}
        <Flex justify="space-between" align="center">
          <TextButton variant="outline" borderRadius="full" onClick={() => navigate('/list')}>
            やめる
          </TextButton>
          <TextButton colorScheme="orange" borderRadius="full" onClick={handleSave}>
            けってい
          </TextButton>
        </Flex>

        {/* 2. メインのアイコンと名前編集エリア */}
        <HStack spacing={4} w="100%" justify="center" padding="0 100px">
          <ProfileIcon
            src={iconMap[iconColor]?.src || iconMap.blue.src}
            alt={iconMap[iconColor]?.alt || iconMap.blue.alt}
            size="2xl"
            boxShadow="md"
          />
          <InputText
            placeholder="なまえ"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            h={{ base: "80px", sm: "88px", lg: "96px" }}
            fontSize={{ base: "56px", sm: "64px", lg: "72px" }}
          />
        </HStack>

        {/* 3. アイコン選択エリア */}
        <VStack>
          <Text color="#FFB433" fontSize={{ base: "18px", sm: "20px", lg: "22px" }}>アイコンをえらんでね</Text>
          <Wrap spacing={4} justify="center">
            {Object.keys(iconMap).map((color) => (
              <WrapItem key={color}>
                <Box
                  as="button"
                  onClick={() => setIconColor(color)}
                  borderWidth={iconColor === color ? '3px' : '1px'}
                  borderColor={iconColor === color ? 'orange.400' : 'gray.200'}
                  borderRadius="full"
                  p="2px"
                >
                  <ProfileIcon src={iconMap[color].src} size={{ base: 'md', sm: 'lg', lg: 'xl' }} />
                </Box>
              </WrapItem>
            ))}
          </Wrap>   
        </VStack>

        {/* 4. モード選択エリア */}
        <VStack>
          <Text color="#FFB433" fontSize={{ base: "18px", sm: "20px", lg: "22px" }}>モードをえらんでね</Text>
          <HStack>
            <ProfileButton
              onClick={() => setMode('てんさく')}
              isActive={mode === 'てんさく'}
            >
              てんさく
            </ProfileButton>
            <ProfileButton
              onClick={() => setMode('じゆう')}
              isActive={mode === 'じゆう'}
            >
              じゆう
            </ProfileButton>
          </HStack>
        </VStack>

      </VStack>
    </Box>
  );
};