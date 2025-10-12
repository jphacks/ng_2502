import { Button } from "@chakra-ui/react";
import React from "react";

export const ProfileButton = ({ isActive, children, ...rest }) => {

  // isActiveがtrue、または、isActiveが指定されなかった(undefined)場合にオレンジにする
  const isButtonActive = isActive === true || isActive === undefined;

  const bgColor = isButtonActive ? "#FFB433" : "gray.200";
  const textColor = isButtonActive ? "#FFFFFF" : "gray.600";
  
  return (
    <Button
      {...rest}
      bg={bgColor}
      color={textColor}
      variant={"solid"}
      border={"none"}
      _hover={{ opacity: 0.8 }}
      _focus={{ boxShadow: "none", outline: "none" }}
      h={{ base: "48px", sm: "56px", lg: "72px" }} // 高さを指定
      px={{ base: 4, sm: 6, lg: 8 }} // 横の余白を指定
      fontSize={{ base: "18px", sm: "20px", lg: "22px" }} // 文字サイズを指定
    >
      {children}
    </Button>
  );
};
