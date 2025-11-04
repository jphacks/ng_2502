import { Box, Tooltip, Icon, Badge } from "@chakra-ui/react";
import React from 'react'; // Reactのインポートを追加

import { 
  FaHeart, 
  FaWalking, 
  FaQuestion, 
  FaRegThumbsUp, 
  FaPersonRays, 
  FaFire, 
  FaCrown 
} from "react-icons/fa";
import { 
  PiSunHorizonDuotone, 
  PiBirdLight 
} from "react-icons/pi"; // Phosphor Icons
import { 
  GiAmpleDress 
} from "react-icons/gi"; // Game Icons

// --- iconMap にすべてのアイコンを登録 ---
// アイコン名の文字列から、実際のコンポーネントにマッピング
const iconMap = {
  // Font Awesome
  FaWalking: FaWalking,
  FaRegThumbsUp: FaRegThumbsUp,
  FaHeart: FaHeart,
  FaPersonRays: FaPersonRays,
  FaFire: FaFire,
  FaCrown: FaCrown,
  // Game Icons
  GiAmpleDress: GiAmpleDress,
  // Phosphor Icons
  PiSunHorizonDuotone: PiSunHorizonDuotone,
  PiBirdLight: PiBirdLight,
  // フォールバック用
  FaQuestion: FaQuestion,
};

export const AchievementIcon = ({ achievement }) => {
  const isUnlocked = achievement.unlocked;
  
  // --- より安全なアイコンの選択ロジック ---
  // 1. マスターリストからアイコンコンポーネントを探す
  const iconComponent = iconMap[achievement.icon];
  
  // 2. 達成済み(isUnlocked)なら、iconComponentを表示。
  //    もしiconComponentが見つからなくても、安全のためにFaQuestionを表示。
  //    未達成なら、FaQuestionを表示。
  const displayIcon = isUnlocked ? (iconComponent || FaQuestion) : FaQuestion;
  
  return (
    // Tooltipでホバー時に名前と説明を表示
    <Tooltip label={`${achievement.name}: ${achievement.description}`} fontSize="md" hasArrow placement="top">
      <Box
        p={4}
        bg={isUnlocked ? "yellow.400" : "gray.200"} // 達成/未達成で色を変える
        borderRadius="full"
        filter={!isUnlocked ? "grayscale(80%)" : "none"} // 未達成ならグレーアウト
        opacity={!isUnlocked ? 0.6 : 1.0}
        boxShadow="md"
        cursor="pointer"
        position="relative" // バッジを配置するために必要
      >
        <Icon 
          as={displayIcon} 
          w={8} 
          h={8} 
          color={isUnlocked ? "white" : "gray.500"} 
        />
      </Box>
    </Tooltip>
  );
};
