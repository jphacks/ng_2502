import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Box,
} from "@chakra-ui/react";

// NG理由を表示するためのモーダル
// props:
// - isOpen: boolean モーダルの開閉
// - onClose: () => void 閉じるハンドラ
// - reason: string 表示するNG理由
export const NgReason = ({ isOpen, onClose, reason = "" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>このとうこうはよくないよ！</ModalHeader>
        <ModalCloseButton
          _focus={{ boxShadow: "none", outline: "none" }}
          border={"none"}
        />
        <ModalBody>
          <Box bg="orange.50" borderRadius="md" p={4}>
            <Text whiteSpace="pre-wrap">{reason}</Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
