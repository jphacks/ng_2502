import { IconButton } from "@chakra-ui/react";

export const MarkButton = ({ icon, label, ...rest }) => {
  return (
    <IconButton
      bg="transparent"
      color="#FFB433"
      border={"none"}
      _hover={{ opacity: 0.8 }}
      _focus={{ boxShadow: "none", outline: "none" }}
      size={{ base: "lg", md: "lg", lg: "xl" }} // 画面サイズに応じてボタンのサイズを変更 (sm:モバイル, md:タブレット, lg:デスクトップ)
      fontSize={{ base: "30px", md: "34px", lg: "38px" }} // 画面サイズに応じてフォントサイズを変更
      aria-label={label}
      icon={icon}
      {...rest}
    ></IconButton>
  );
};
