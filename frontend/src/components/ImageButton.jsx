import { Button } from "@chakra-ui/react";

export const ImageButton = ({ img, alt, ...rest }) => {
  return (
    <Button
      {...rest}
      // TextButton と同じサイズトークンを使って高さを揃える
      size={{ base: "sm", md: "md", lg: "lg" }}
      p={0} // パディングを削除
      border="none"
      _hover={{ opacity: 0.8 }}
      _focus={{ boxShadow: "none", outline: "none" }}
      bg="transparent"
    >
      <img
        src={img}
        alt={alt}
        style={{ width: "auto", height: "100%", objectFit: "contain" }}
      />
    </Button>
  );
};
