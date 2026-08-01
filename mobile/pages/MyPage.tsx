import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Image,
  Separator,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { Pencil, Settings } from "@tamagui/lucide-icons";
import { FriendSearchModal } from "@/components/ui/FriendSearchModal";
import { useUser } from "@/hooks/useUser";
import { useFriends, FriendUser } from "@/hooks/useFriends";
import { WhiteTextButton } from "@/components/ui/WhiteTextButton";
import { ProfileIcon } from "@/components/ui/ProfileIcon";
import { auth } from "@/firebase";
import { API_BASE_URL } from "@/constants/api";

const iconMap: Record<string, any> = {
  blue: require("@/assets/images/UserIcon_Blue.png"),
  cream: require("@/assets/images/UserIcon_Cream.png"),
  green: require("@/assets/images/UserIcon_Green.png"),
  mint: require("@/assets/images/UserIcon_Mint.png"),
  navy: require("@/assets/images/UserIcon_Navy.png"),
  olive: require("@/assets/images/UserIcon_Olive.png"),
  purple: require("@/assets/images/UserIcon_Purple.png"),
  red: require("@/assets/images/UserIcon_Red.png"),
  yellow: require("@/assets/images/UserIcon_Yellow.png"),
};

const AVATAR_SIZE = 64;
const FRIEND_AVATAR_SIZE = 44;

const Avatar = ({
  iconColor,
  size = AVATAR_SIZE,
}: {
  iconColor: string;
  size?: number;
}) => (
  <Image
    source={iconMap[iconColor] ?? iconMap.blue}
    width={size}
    height={size}
    borderRadius={size / 2}
  />
);

const FriendRow = ({ friend }: { friend: FriendUser }) => (
  <XStack
    alignItems="center"
    gap="$3"
    paddingVertical="$2"
    paddingHorizontal="$4"
  >
    <Avatar iconColor={friend.iconColor} size={FRIEND_AVATAR_SIZE} />
    <Text fontSize="$4" color="$gray12">
      {friend.username}
    </Text>
  </XStack>
);

const RequestRow = ({
  request,
  onAccept,
}: {
  request: FriendUser;
  onAccept: (uid: string) => void;
}) => (
  <XStack
    alignItems="center"
    gap="$3"
    paddingVertical="$2"
    paddingHorizontal="$4"
    justifyContent="space-between"
  >
    <XStack alignItems="center" gap="$3">
      <Avatar iconColor={request.iconColor} size={FRIEND_AVATAR_SIZE} />
      <Text fontSize="$4" color="$gray12">
        {request.username}
      </Text>
    </XStack>
    <Button
      size="$3"
      backgroundColor="#FFB433"
      color="white"
      borderRadius="$5"
      onPress={() => onAccept(request.uid)}
      pressStyle={{ opacity: 0.8 }}
    >
      ともだちになる
    </Button>
  </XStack>
);

type Profile = {
  //いったんこれに合わせる
  username: string;
  comment: string;
  iconColor: string;
  mode: string;
  angou: string;
};

export default function MyPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile>({
    username: "",
    comment: "",
    iconColor: "blue",
    mode: "",
    angou: "",
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const {
    friends,
    friendRequests,
    isLoading,
    fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
  } = useFriends();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  // プロフィールを ProfilePage と同じパターンで直接取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ ユーザーが認証されていません");
        Alert.alert("エラー", "ログインが必要です");
        router.replace("/login");
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const res = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setProfile({
          username: res.data.username ?? "",
          comment: res.data.comment ?? "",
          iconColor: res.data.iconColor ?? "blue",
          mode: res.data.mode ?? "",
          angou: res.data.angou ?? "",
        });
      } catch (e) {
        console.error("プロフィール取得エラー:", e);
      } finally {
        setIsProfileLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleAccept = async (uid: string) => {
    setIsAccepting(uid);
    try {
      await acceptFriendRequest(uid);
    } catch {
      Alert.alert("エラー", "しょうにんに失敗したよ");
    } finally {
      setIsAccepting(null);
    }
  };

  if (isProfileLoading) {
    return (
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="white"
      >
        <Spinner size="large" color="$orange10" />
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="white">
      {/* ヘッダー */}
      <XStack
        paddingTop={insets.top + 8}
        paddingBottom="$3"
        paddingHorizontal="$4"
        alignItems="center"
        justifyContent="space-between"
      >
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#FFB433" />
        </Pressable>
        <Pressable onPress={() => router.push("/modeset")}>
          <FontAwesome name="cog" size={22} color="#FFB433" />
        </Pressable>
      </XStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* プロフィール */}
        <YStack alignItems="center" paddingTop="$4" paddingBottom="$5" gap="$2">
          <Avatar iconColor={profile.iconColor} size={AVATAR_SIZE} />
          <XStack alignItems="center" gap="$2" marginTop="$2">
            <Text fontSize="$6" fontWeight="bold" color="$gray12">
              {profile.username || "ユーザー名"}
            </Text>
            <Pressable onPress={() => router.push("/profile")}>
              <FontAwesome name="pencil" size={16} color="#FFB433" />
            </Pressable>
          </XStack>
          <Text fontSize="$3" color="$gray9">
            {profile.comment || "コメントはまだ設定されていません"}
          </Text>
          {profile.mode ? (
            <Text fontSize="$3" color="$gray8">
              {profile.mode}モード
            </Text>
          ) : null}
        </YStack>

        {/* ともだちをさがすボタン */}
        <YStack paddingHorizontal="$4" marginBottom="$5">
          <Pressable onPress={() => setIsSearchOpen(true)}>
            <XStack
              backgroundColor="#FFB433"
              borderRadius="$6"
              paddingVertical="$3"
              paddingHorizontal="$5"
              alignItems="center"
              justifyContent="center"
              gap="$2"
            >
              <FontAwesome name="user-plus" size={18} color="white" />
              <Text color="white" fontSize="$5" fontWeight="bold">
                ともだちをさがす
              </Text>
            </XStack>
          </Pressable>
        </YStack>

        {/* こうほ（申請中） */}
        {friendRequests.length > 0 && (
          <YStack marginBottom="$4">
            <Text
              fontSize="$4"
              fontWeight="bold"
              color="$gray10"
              paddingHorizontal="$4"
              marginBottom="$2"
            >
              こうほ
            </Text>
            {friendRequests.map((req) => (
              <RequestRow
                key={req.uid}
                request={req}
                onAccept={isAccepting ? () => {} : handleAccept}
              />
            ))}
          </YStack>
        )}

        {/* ともだちリスト */}
        <YStack>
          <Text
            fontSize="$4"
            fontWeight="bold"
            color="$gray12"
            paddingHorizontal="$4"
            marginBottom="$1"
          >
            ともだち
          </Text>
          <Separator borderColor="$gray4" />

          {isLoading ? (
            <YStack alignItems="center" paddingVertical="$6">
              <Spinner size="small" color="$orange10" />
            </YStack>
          ) : friends.length === 0 ? (
            <YStack alignItems="center" paddingVertical="$6">
              <Text color="$gray7" fontSize="$3">
                まだともだちがいないよ
              </Text>
            </YStack>
          ) : (
            friends.map((friend) => (
              <FriendRow key={friend.uid} friend={friend} />
            ))
          )}
        </YStack>
      </ScrollView>

      {/* ボトムナビゲーション */}
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingBottom={insets.bottom + 8}
        paddingTop="$3"
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="$gray3"
        justifyContent="space-around"
        alignItems="center"
      >
        <Pressable>
          <FontAwesome name="bell-o" size={24} color="#FFB433" />
        </Pressable>
        <Pressable onPress={() => router.push("/(tabs)/list")}>
          <FontAwesome name="home" size={26} color="#FFB433" />
        </Pressable>
        <Pressable>
          <FontAwesome name="comment-o" size={24} color="#FFB433" />
        </Pressable>
      </XStack>

      {/* ともだちをさがすモーダル */}
      <FriendSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        myAngou={profile.angou}
        onSend={sendFriendRequest}
      />
    </View>
  );
}
