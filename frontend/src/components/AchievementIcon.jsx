import {
  Box,
  Icon,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody
} from "@chakra-ui/react";
import React from 'react';
import { FaQuestion } from "react-icons/fa";

export const AchievementIcon = ({ achievement, isUnlocked }) => {
  
  const displayIcon = achievement.icon || FaQuestion;
  const displayName = achievement.name;
  const displayDescription = achievement.description

  const iconColor = isUnlocked ? "#FFB433" : "gray.500";
  const filterStyle = !isUnlocked ? "grayscale(100%)" : "none";
  const opacityValue = !isUnlocked ? 0.4 : 1.0;

  return (
    <Popover placement="top" isLazy>
      <PopoverTrigger>
        {/*
          この <Box> がタップ（クリック）するボタンの役割になります。
          中身は以前の <Box> とまったく同じです。
        */}
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
      </PopoverTrigger>
      
      {/*
        ↓ ここがタップした時に表示される「ポップアップの中身」です
      */}
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text fontWeight="bold">{displayName}</Text>
          <Text fontSize="sm">{displayDescription}</Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};