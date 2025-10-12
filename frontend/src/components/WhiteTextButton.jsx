import { Button } from "@chakra-ui/react";

export const WhiteTextButton = ({ children, ...rest }) => {
  return (
    <Button
      {...rest}
      bg="#FFFFFF"
      color="#FFB433"
      variant={"solid"}
      border="2px solid"
      borderColor="#FFB433"
      _hover={{
        opacity: 0.8,
        borderColor: "#c78728ff", // ホバー時に枠線の色を暗くする
      }}
      _focus={{ boxShadow: "none", outline: "none" }}
      size={{ base: "sm", md: "md", lg: "lg" }}
      fontSize={{ base: "14px", md: "16px", lg: "18px" }}
    >
      {children}
    </Button>
  );
};
