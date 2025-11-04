import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, Wrap, WrapItem, Spinner, Center, Text
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase"; // 認証トークン取得のため
import { AchievementIcon } from "./AchievementIcon.jsx"; // .jsx 拡張子を推奨

const API_URL = "http://localhost:8000"; // FastAPIサーバー

export const AchievementsModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- エラーメッセージ用のstateを追加 ---
  const [error, setError] = useState(null);

  // モーダルが開いたときに、APIを叩いて実績データを取得
  useEffect(() => {
    // モーダルが開いていない、またはすでにデータ取得済みの場合は何もしない
    if (!isOpen) {
      return; 
    }
    
    // モーダルが開くたびにデータをリフレッシュする
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null); // エラーをリセット
      
      const user = auth.currentUser;
      if (!user) {
        console.warn("実績取得: ユーザー未ログイン");
        setError("ログインしていません。"); // ユーザーにエラーを表示
        setLoading(false);
        return;
      }
      
      try {
        const idToken = await user.getIdToken();
        const response = await axios.get(`${API_URL}/api/achievements/status`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        setStatus(response.data);
      } catch (error) {
        console.error("実績の取得に失敗:", error);
        // --- ユーザーにエラーを通知 ---
        setError("実績の取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [isOpen]); // isOpen が true になった瞬間に実行

  // --- 変更点3: モーダルの中身を出し分けるロジック ---
  const renderBodyContent = () => {
    // 1. ローディング中
    if (loading) {
      return <Center h="200px"><Spinner /></Center>;
    }
    // 2. エラー発生時
    if (error) {
      return <Center h="200px"><Text color="red.500">{error}</Text></Center>;
    }
    // 3. データ0件の場合
    if (status.length === 0) {
      return <Center h="200px"><Text color="gray.500">まだ達成した実績はありません。</Text></Center>;
    }
    // 4. 正常に表示
    return (
      <Wrap spacing={6} justify="center" p={4}>
        {status.map((ach) => (
          <WrapItem key={ach.id}>
            <AchievementIcon achievement={ach} />
          </WrapItem>
        ))}
      </Wrap>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="2xl">
        <ModalHeader>実績一覧</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {renderBodyContent()}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>とじる</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
