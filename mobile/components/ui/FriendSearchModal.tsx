import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import {
  Button,
  Dialog,
  Input,
  Text,
  Unspaced,
  XStack,
  YStack,
} from "tamagui";
import { FriendRequestResult } from "@/hooks/useFriends";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  myAngou: string;
  onSend: (angou: string) => Promise<FriendRequestResult>;
};

export const FriendSearchModal = ({ isOpen, onClose, myAngou, onSend }: Props) => {
  const [inputAngou, setInputAngou] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorType, setErrorType] = useState<FriendRequestResult>(null);

  const handleSend = async () => {
    if (!inputAngou.trim() || isSending) return;
    setIsSending(true);
    try {
      const result = await onSend(inputAngou.trim());
      if (result) {
        setErrorType(result);
      } else {
        setInputAngou("");
        onClose();
      }
    } catch {
      setErrorType("not_found");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.4}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            bordered
            elevate
            key="content"
            animation="quick"
            enterStyle={{ opacity: 0, scale: 0.95 }}
            exitStyle={{ opacity: 0, scale: 0.95 }}
            padding="$4"
            borderRadius="$6"
            width="85%"
          >
            <Unspaced>
              <Dialog.Close asChild>
                <Pressable
                  style={{ position: "absolute", top: 14, right: 14, zIndex: 1 }}
                  onPress={onClose}
                >
                  <FontAwesome name="times" size={18} color="#999" />
                </Pressable>
              </Dialog.Close>
            </Unspaced>

            <YStack gap="$3" marginTop="$2">
              <XStack gap="$2" alignItems="center">
                <Input
                  flex={1}
                  placeholder="ともだちのあんごう"
                  value={inputAngou}
                  onChangeText={setInputAngou}
                  borderColor="$gray5"
                  borderRadius="$4"
                  size="$4"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={handleSend} disabled={isSending}>
                  <FontAwesome
                    name="paper-plane"
                    size={22}
                    color={isSending ? "#ccc" : "#FFB433"}
                  />
                </Pressable>
              </XStack>
              <Text color="$gray8" fontSize="$3">
                じぶんのあんごう : {myAngou || "よみこみ中..."}
              </Text>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* エラーモーダル: 存在しない / 自分のあんごう */}
      <Dialog
        open={errorType === "not_found"}
        onOpenChange={(open) => !open && setErrorType(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay opacity={0.4} />
          <Dialog.Content
            bordered
            elevate
            padding="$5"
            borderRadius="$6"
            width="80%"
            alignItems="center"
            gap="$4"
          >
            <Text fontSize="$5" fontWeight="bold" color="$orange10" textAlign="center">
              ともだちが{"\n"}そんざいしないよ
            </Text>
            <Button
              backgroundColor="#FFB433"
              color="white"
              borderRadius="$6"
              width="100%"
              onPress={() => setErrorType(null)}
            >
              とじる
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* エラーモーダル: すでに申請中 / すでにともだち */}
      <Dialog
        open={errorType === "already_exists"}
        onOpenChange={(open) => !open && setErrorType(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay opacity={0.4} />
          <Dialog.Content
            bordered
            elevate
            padding="$5"
            borderRadius="$6"
            width="80%"
            alignItems="center"
            gap="$4"
          >
            <Text fontSize="$5" fontWeight="bold" color="$orange10" textAlign="center">
              すでに{"\n"}もうしこんだよ
            </Text>
            <Button
              backgroundColor="#FFB433"
              color="white"
              borderRadius="$6"
              width="100%"
              onPress={() => setErrorType(null)}
            >
              とじる
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  );
};
