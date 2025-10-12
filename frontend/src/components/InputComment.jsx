import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { useState } from "react";
import { TextButton } from "./TextButton";
import { InputText } from "./InputText";

export const InputComment = ({ isOpen, onClose, onCommentSubmit }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onCommentSubmit(comment); // 親コンポーネントにコメントを渡す
    setComment("");
    onClose(); // モーダルを閉じる
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>コメント</ModalHeader>
        <ModalCloseButton
          _focus={{ boxShadow: "none", outline: "none" }}
          border={"none"}
        />
        <ModalBody>
          <InputText
            placeholder="コメントをかく..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <TextButton
            mr={3}
            onClick={handleSubmit}
            isDisabled={!comment.trim()}
          >
            とうこう
          </TextButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
