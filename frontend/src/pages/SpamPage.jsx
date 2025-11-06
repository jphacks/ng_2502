import React from "react";
import { useState, useEffect } from "react";
import { VStack, Button, Text, Box, useDisclosure } from "@chakra-ui/react";
import { IoMdWarning } from "react-icons/io";
import { AttentionModal } from "../components/AttentionModal";
//カウントダウン
const useCountDownInterval = (countTime, setCountTime) => {
  useEffect(() => {
    const countDownInterval = setInterval(() => {
      if (countTime === 0) {
        clearInterval(countDownInterval);
      }
      if (countTime && countTime > 0) {
        setCountTime(countTime - 1);
      }
    }, 1000);
    return () => {
      clearInterval(countDownInterval);
    };
  }, [countTime]);
};

export { useCountDownInterval };

const CenteredLayout = () => {
  const [countTime, setCountTime] = useState(10);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useCountDownInterval(countTime, setCountTime);
  useEffect(() => {
    if (countTime === 0) {
      onOpen();
    }
  }, [countTime, onOpen]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="#ff0000"
    >
      <VStack spacing={6}>
        <IoMdWarning color="#ffffff" size={40} />
        <Text
          fontSize={{ base: "25px", md: "60px", lg: "75px" }}
          color="white"
          fontWeight="bold"
        >
          ウイルスが見つかりました！
        </Text>
        <Text
          fontSize={{ base: "15px", md: "30px", lg: "50px" }}
          color="white"
          fontWeight="bold"
        >
          あなたのスマホはわるい人のせいでやばいことになっています。すぐにに下のボタンをクリックして、ウイルスをやっつけてください！
        </Text>

        <Box fontSize="5xl" fontWeight="bold" color="white" ml="2">
          00:{countTime % 60}{" "}
        </Box>

        <Button
          size={{ base: "30px", md: "40px", lg: "50px" }} // 画面サイズに応じてボタンのサイズを変更 (sm:モバイル, md:タブレット, lg:デスクトップ)
          fontSize={{ base: "20px", md: "30px", lg: "40px" }}
          p={2}
          m={10}
          color="black"
          bg="yellow"
          _hover={{ opacity: 0.8 }}
          border={"none"}
          _focus={{ boxShadow: "none", outline: "none" }}
          borderRadius={5}
          onClick={onOpen}
        >
          今すぐここをクリック！！！
        </Button>
        <AttentionModal isOpen={isOpen} onClose={onClose} />
      </VStack>
    </Box>
  );
};

export default CenteredLayout;
