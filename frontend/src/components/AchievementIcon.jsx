import { Box, Tooltip, Icon } from "@chakra-ui/react";
import React from 'react';
// 未達成の場合や、予備の「？」アイコンとして使います
import { FaQuestion } from "react-icons/fa";

/**
 * 実績を1つ表示するための、丸いアイコンコンポーネント
 * @param {object} achievement - achievementsMasterから取得した実績データ
 * @param {boolean} isUnlocked - この実績を達成したかどうか
 */
export const AchievementIcon = ({ achievement, isUnlocked }) => {
  
  // --- 1. 表示するアイコンを決定するロジック ---
  //
  // 達成していたら(isUnlockedがtrue)、マスターデータに定義されたアイコン(achievement.icon)を表示。
  // もしマスターデータにiconが未設定(undefined)だった場合は、安全のためにFaQuestionを表示。
  // まだ達成していなければ(isUnlockedがfalse)、FaQuestionを表示。
  const displayIcon = isUnlocked ? (achievement.icon || FaQuestion) : FaQuestion;
  
  // --- 2. 達成状況に応じて、見た目（スタイル）を動的に変更 ---
  const bgColor = isUnlocked ? "yellow.400" : "gray.200";
  const iconColor = isUnlocked ? "white" : "gray.500";
  const filterStyle = !isUnlocked ? "grayscale(80%)" : "none";
  const opacityValue = !isUnlocked ? 0.6 : 1.0;

  return (
    // --- 3. Tooltipで、アイコンにマウスを乗せると実績名と説明を表示 ---
    <Tooltip 
      label={`${achievement.name}: ${achievement.description}`} 
      fontSize="md" 
      hasArrow 
      placement="top"
    >
      <Box
        p={4} // 内側の余白
        bg={bgColor} // 決定した背景色を適用
        borderRadius="full" // 円形にする
        filter={filterStyle} // 決定したグレースケールを適用
        opacity={opacityValue} // 決定した透明度を適用
        boxShadow="md" // 影をつけて立体感を出す
        cursor="pointer" // マウスカーソルを指の形にする
        transition="all 0.2s ease" // アニメーションを滑らかにする
        _hover={{
          transform: 'scale(1.1)' // マウスを乗せたら少し大きくする
        }}
      >
        {/* --- 4. アイコン本体を表示 --- */}
        <Icon 
          as={displayIcon} // 決定したアイコン部品(FaHeartなど)をここで表示
          w={8} // アイコンの幅 (w={8} は 2rem または 32px)
          h={8} // アイコンの高さ
          color={iconColor} // 決定したアイコンの色を適用
        />
      </Box>
    </Tooltip>
  );
};