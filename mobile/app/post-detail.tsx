import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, YStack, Button } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostDetailScreen() {
  const router = useRouter();
  // 前の画面から渡された postId を取得
  const { postId } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4" alignItems="center" justifyContent="center">
        <Text fontSize="$6" fontWeight="bold">
          投稿詳細
        </Text>
        
        <Text fontSize="$4">
          投稿ID: {postId}
        </Text>

        <Button onPress={() => router.back()}>
          <Text>戻る</Text>
        </Button>
      </YStack>
    </SafeAreaView>
  );
}