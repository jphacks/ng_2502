import { Image } from "@chakra-ui/react";
export const CircleIcon = ({ src, alt }) => {
  return (
    <Image
      src={src}
      alt={alt}
      borderRadius={"full"}
      boxSize={{ base: "40px", md: "50px", lg: "60px" }} // 画面サイズに応じてアイコンのサイズを変更 (sm:モバイル, md:タブレット, lg:デスクトップ)
      Fit="cover" // 画像のアスペクト比を維持しつつ、コンテナに収まるように調整
    />
  );
};
