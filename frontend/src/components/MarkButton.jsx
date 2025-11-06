import { IconButton } from "@chakra-ui/react";

export const MarkButton = ({ icon, label, ...rest }) => {
  return (
    <IconButton
      bg="transparent"
      color="#FFB433"
      border={"none"}
      _hover={{ opacity: 0.95 }}
      _focus={{ boxShadow: "none", outline: "none" }}
      // より大きな物理サイズを指定して視認性を向上
      w={{ base: "64px", md: "72px", lg: "80px" }}
      h={{ base: "64px", md: "72px", lg: "80px" }}
      minW={{ base: "64px", md: "72px", lg: "80px" }}
      // アイコン自体を大きくする
      fontSize={{ base: "28px", md: "34px", lg: "40px" }}
      borderRadius={{ base: "12px", md: "14px", lg: "16px" }}
      aria-label={label}
      icon={icon}
      {...rest}
    />
  );
};
