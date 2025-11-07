import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  SimpleGrid,
  Spinner,
  Center,
  Text,
  Flex,
  useToast // エラー通知用
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase"; // 認証トークン取得のため
import { AchievementIcon } from "./AchievementIcon"; // ステップ2で作成
import { ACHIEVEMENTS_MASTER } from "../constants/achievementsMaster"; // ステップ1で作成

// 本番環境では VITE_API_URL を使い、
// ローカル開発環境では（|| の右側） "http://localhost:8000" を使う
const API_URL = "https://ng-2502testesu.onrender.com";

/**
 * 実績一覧をAPIから取得して表示するモーダルコンポーネント
 * @param {boolean} isOpen - モーダルが開いているか (親から渡される)
 * @param {function} onClose - モーダルを閉じる関数 (親から渡される)
 */
export const AchievementModal = ({ isOpen, onClose }) => {
  // 1. stateの定義
  // unlockedIds: APIから取得した「達成済み実績のIDリスト」を保存する (例: ["post_10", "like_total_100"])
  const [unlockedIds, setUnlockedIds] = useState([]);
  // loading: 読み込み中かどうかを示す「旗」
  const [loading, setLoading] = useState(true);
  // error: エラーメッセージ
  const [error, setError] = useState(null);
  const toast = useToast(); // エラー通知UI

  // 2. API通信の実行
  // useEffectは、「[ ]」の中身が変わったときに実行される
  // 今回は [isOpen] を指定したので、モーダルが開いた(isOpenがtrueになった)瞬間に実行される
  useEffect(() => {
    // モーダルが開いていなければ、通信しない
    if (!isOpen) return;

    // 実行する処理
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null); // エラーをリセット
      
      const user = auth.currentUser;
      if (!user) {
        console.warn("実績取得: ユーザー未ログイン");
        setError("ログインしていません。");
        setLoading(false);
        return;
      }
      
      try {
        // Firebase Authから認証トークン（通行証）を取得
        const idToken = await user.getIdToken();
        
        // バックエンド(FastAPI)の /api/achievements/status APIを呼び出す
        const response = await axios.get(`${API_URL}/achievements`, {
          headers: {
            Authorization: `Bearer ${idToken}` // 認証トークンをヘッダーに付けて送信
          }
        });
        
        // バックエンドからは { achievements: ["post_10", "like_total_100"] } のようなデータが返ってくる
        setUnlockedIds(response.data.achievements || []);

      } catch (err) {
        console.error("🔥 実績の取得に失敗:", err);
        setError("実績の取得に失敗しました。");
        toast({
          title: "エラー",
          description: "実績の取得に失敗しました。時間をおいて再度お試しください。",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false); // 成功しても失敗しても、ローディングは解除
      }
    };

    fetchAchievements();

  }, [isOpen, toast]); // isOpen または toast が変わったときに再実行 (実質、isOpenがtrueになったとき)

  // 3. 表示するデータの作成
  // ACHIEVEMENTS_MASTER（すべての実績リスト）を元に、
  // APIから取得した unlockedIds（達成済みリスト）と照合する
  const allAchievements = Object.keys(ACHIEVEMENTS_MASTER).map(id => {
    // マスターリストから実績情報を取得
    const achievementData = ACHIEVEMENTS_MASTER[id];
    // APIから取得したリストにIDが含まれているかチェック
    const isUnlocked = unlockedIds.includes(id) || id === "welcome_snr";

    // 画面表示用の完全なオブジェクトを作成して返す
    return {
      id: id,
      ...achievementData, // name, description, icon を展開
      isUnlocked: isUnlocked // 達成済みかどうか
    };
  });

  // 4. モーダルの中身を「ローディング中」「エラー時」「成功時」で切り替え
  const renderBodyContent = () => {
    // 4a. ローディング中
    if (loading) {
      return (
        <Center h="200px">
          <Spinner size="xl" color="orange.400" />
        </Center>
      );
    }
    // 4b. エラー発生時
    if (error) {
      return (
        <Center h="200px">
          <Text color="red.500">{error}</Text>
        </Center>
      );
    }
    // 4c. 成功時（実績が0件の場合も含む）
    return (
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} p={4} justifyItems="center">
        {allAchievements.length > 0 ? (
          allAchievements.map((ach) => (
            
            <AchievementIcon
              key={ach.id}
              achievement={ach}
              isUnlocked={ach.isUnlocked}
            />
          ))
        ) : (
          <Text color="gray.500">実績がまだありません。</Text>
        )}
      </SimpleGrid>
    );
  };

  // 5. モーダル本体のJSX
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="2xl" mx={4}>
        <ModalHeader>
          <Flex justify="space-between" align="center">
            {/* Chakra UIの<ModalHeader>はデフォルトで 
              fontSize="xl" fontWeight="semibold" が当たるため、
              <Text>コンポーネントでスタイルを継承しつつ、
              ボタンと横並びにする
            */}
            <Text as="span" fontSize="inherit" fontWeight="inherit">
              あつめたバッジ
            </Text>
            <Button
              size="sm"
              variant="outline"
              borderWidth="2px"
              color="#FFB433"
              borderColor="#FFB433"
              _hover={{ color: "orange.400", borderColor: "orange.400" }}
              onClick={onClose}
              _focus={{
                boxShadow: "none", // Chakra UIの影を消す
                outline: "none"    // ブラウザの枠線も消す
              }}
              _focusVisible={{
                boxShadow: "none", // Tabキー選択時の影も消す
                outline: "none"    // Tabキー選択時の枠線も消す
              }}
            >
              とじる
            </Button>
          </Flex>
        </ModalHeader>
        <ModalBody>
          {renderBodyContent()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};