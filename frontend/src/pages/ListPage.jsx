import { VStack } from "@chakra-ui/react";
import { Post } from "../components/Post";
import { useUser } from "../hooks/useUser";

export const ListPage = () => {
  const { iconColor, email } = useUser();
  // サンプルデータとして配列を作成
  const posts = [
    {
      id: 1,
      user: { email: "user1@example.com", iconColor: "red" },
      content: "最初の投稿です！",
    },
    {
      id: 2,
      user: { email: email, iconColor: iconColor },
      content: "これはログインユーザーの投稿です。",
    },
    {
      id: 3,
      user: { email: "user3@example.com", iconColor: "green" },
      content: "Chakra UIは便利ですね。",
    },
  ];

  return (
    <VStack spacing={0} align="stretch">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </VStack>
  );
};
