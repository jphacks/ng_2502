import { VStack } from "@chakra-ui/react";
import { Post } from "../components/Post";

export const ListPage = () => {
  // サンプルデータとして配列を作成
  const posts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <VStack spacing={0} align="stretch">
      {posts.map((post, index) => (
        <Post key={index} />
      ))}
    </VStack>
  );
};
