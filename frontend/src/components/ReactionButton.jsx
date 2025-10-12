import { IconButton } from "@chakra-ui/react";

export const ReactionButton = ({ icon, label, ...rest }) => {
  return (
    <IconButton
      bg="transparent"
      color="#80CBC4"
      border={"none"}
      _hover={{ opacity: 0.8 }}
      _focus={{ boxShadow: "none", outline: "none" }}
      size={{ base: "sm", md: "md", lg: "lg" }} // 画面サイズに応じてボタンのサイズを変更 (sm:モバイル, md:タブレット, lg:デスクトップ)
      fontSize={{ base: "24px", md: "28px", lg: "32px" }} // 画面サイズに応じてフォントサイズを変更
      aria-label={label}
      icon={icon}
      {...rest}
    ></IconButton>
  );
};
