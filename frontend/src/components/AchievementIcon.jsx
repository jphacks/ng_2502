import { Box, Tooltip, Icon, Text } from "@chakra-ui/react";
import React from 'react';
import { FaQuestion } from "react-icons/fa";

export const AchievementIcon = ({ achievement, isUnlocked }) => {
  
  const displayIcon = achievement.icon || FaQuestion;
  const displayName = achievement.name;
  const displayDescription = isUnlocked ? achievement.description : "達成条件は秘密です";

  const iconColor = isUnlocked ? "orange.400" : "gray.500";
  const filterStyle = !isUnlocked ? "grayscale(100%)" : "none";
  const opacityValue = !isUnlocked ? 0.4 : 1.0;

  return (
    <Tooltip 
      label={`${displayName}: ${displayDescription}`} 
      fontSize="md" 
      hasArrow 
      placement="top"
    >
      <Box
        p={2} 
        textAlign="center" 
        filter={filterStyle}
        opacity={opacityValue}
        cursor="pointer"
        transition="all 0.2s ease"
        _hover={{
          transform: 'scale(1.1)',
        }}
      >
        <Icon 
          as={displayIcon}
          w={12}
          h={12}
          color={iconColor} 
        />
        <Text 
          fontSize="xs" 
          mt={1} 
          fontWeight="bold" 
          isTruncated
          color={isUnlocked ? "inherit" : "gray.600"}
        >
          {displayName}
        </Text>
      </Box>
    </Tooltip>
  );
};