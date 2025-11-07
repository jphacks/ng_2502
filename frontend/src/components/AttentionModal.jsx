import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { TextButton } from "./TextButton";
import { Link } from "react-router-dom";

export const AttentionModal = ({ isOpen, onClose, onCommentSubmit }) => {
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
        <ModalHeader>タイトル</ModalHeader>
        <ModalCloseButton
          _focus={{ boxShadow: "none", outline: "none" }}
          border={"none"}
        />
        <ModalBody>
          <Text>
            あやしいリンクをおすとこんな風にこわいめにあっちゃうよ。あやしいリンクは絶対にさわらないようにしよう
          </Text>
        </ModalBody>
        <ModalFooter>
          <Link to="/list">
            <TextButton>とうこうページにもどる</TextButton>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
