import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Wrap,
  WrapItem,
  Badge,
  Spinner,
  Center,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase"; // Firebase Auth をインポート

const API_URL = "https://ng-2502testesu.onrender.com";

const AchievementModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("ログインしていません");
          setAchievements([]);
          setIsLoading(false);
          return;
        }

        const token = await user.getIdToken(); // Firebaseトークンを取得
        const response = await axios.get(`${API_URL}/achievements`, {
          headers: {
            Authorization: `Bearer ${token}`, // トークンをヘッダーに追加
          },
        });

        setAchievements(response.data.achievements ?? []);
        console.log("✅ 称号取得:", response.data.achievements);
      } catch (err) {
        console.error("🔥 称号取得失敗:", err);
        setAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [isOpen]);

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal">
        称号一覧
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>称号一覧</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <Center py={4}>
                <Spinner color="teal.400" />
              </Center>
            ) : achievements.length > 0 ? (
              <Wrap spacing={2}>
                {achievements.map((title, index) => (
                  <WrapItem key={index}>
                    <Badge colorScheme="purple" fontSize="md">
                      {title}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            ) : (
              <Text color="gray.500">まだ称号はありません。</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AchievementModal;