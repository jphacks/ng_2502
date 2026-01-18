import { X } from '@tamagui/lucide-icons'; // アイコンを利用する場合
import { Button, Dialog, XStack, YStack } from 'tamagui';

type NgReasonProps = {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
};

export const NgReason = ({ isOpen, onClose, reason = "" }: NgReasonProps) => {
  return (
    <Dialog
      modal
      open={isOpen}
      onOpenChange={(open) => {
        // ダイアログが閉じられる動作（背景タップなど）をした時にonCloseを呼ぶ
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        {/* 背景のオーバーレイ */}
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          onPress={onClose} // 明示的に背景タップで閉じる場合
        />

        {/* モーダルの中身 */}
        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
          w="90%" // スマホ向けに幅を調整
          maxWidth={600}
        >
          {/* ヘッダー部分 */}
          <XStack alignItems="center" justifyContent="space-between" mb="$4">
            <Dialog.Title fontSize="$6" fontWeight="bold">
              このとうこうはよくないよ！
            </Dialog.Title>
            
            {/* 閉じるボタン */}
            <Dialog.Close asChild>
              <Button
                size="$3"
                circular
                icon={X} // @tamagui/lucide-iconsがない場合は <Text>✕</Text> などで代用
                onPress={onClose}
                chromeless // 背景色なしのボタンスタイル
              />
            </Dialog.Close>
          </XStack>

          {/* 本文エリア（ChakraのBox bg="orange.50"部分） */}
          <YStack
            backgroundColor="$orange3" // Tamaguiのテーマカラー（または直接 '#FFFAF0'）
            borderRadius="$4"
            padding="$4"
          >
            <Dialog.Description color="$color" lineHeight="$5">
              {reason}
            </Dialog.Description>
          </YStack>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};