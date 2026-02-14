import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";

// --- Firebase関連のインポート ---
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  connectFirestoreEmulator,
} from "firebase/firestore";

// ★★★ 設定エリア（ここだけ書き換えてください） ★★★
const PC_IP_ADDRESS = "192.168.0.7"; // ← ipconfigで調べたIPに書き換える（例: 192.168.1.15）
const API_URL = `http://${PC_IP_ADDRESS}:8000`; // バックエンドのURL
const TARGET_USER_ID = "test_user_B"; // 話し相手のID
const MY_USER_ID = "test_user_A"; // 自分のID（バックエンドのテスト設定に合わせる）

// --- Firebase初期化 ---
const firebaseConfig = {
  projectId: "myfirstfirebase-440d6", // プロジェクトID（firebase.jsonなどから確認）
  apiKey: "dummy-api-key", // エミュレータなのでダミーでOK
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ★ エミュレータに接続する設定
// すでに接続済みエラーが出るのを防ぐガード付き
try {
  // Firestoreエミュレータへの接続 (ポート8080)
  connectFirestoreEmulator(db, PC_IP_ADDRESS, 8080);
  console.log("Connected to Firestore Emulator");
} catch (e) {
  // リロード時などに「すでに接続済み」エラーが出ることがあるので無視
  console.log("Firestore emulator connection check:", e.message);
}

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [roomId, setRoomId] = useState(null); // 部屋IDを保持
  const [loading, setLoading] = useState(true);

  // 1. 画面を開いたら、まず「部屋」を確保する
  useEffect(() => {
    const setupRoom = async () => {
      try {
        console.log("Creating room...");
        // APIを叩いて部屋IDを取得
        const response = await fetch(`${API_URL}/dm/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: TARGET_USER_ID }),
        });

        if (!response.ok) throw new Error("Room creation failed");

        const data = await response.json();
        console.log("Room ID:", data.roomId);
        setRoomId(data.roomId);
      } catch (error) {
        Alert.alert(
          "エラー",
          "サーバーに接続できませんでした。\nIPアドレスやサーバー起動を確認してください。",
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    setupRoom();
  }, []);

  // 2. 部屋IDが決まったら、Firestoreを監視してメッセージを受信する
  useEffect(() => {
    if (!roomId) return;

    // messagesサブコレクションを監視
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc")); // 新しい順に取得

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content,
          senderId: data.senderId,
          // FirestoreのTimestamp型をJSのDate型に変換
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        };
      });
      setMessages(fetchedMessages);
    });

    // 画面を閉じる時に監視を終了する（クリーンアップ）
    return () => unsubscribe();
  }, [roomId]);

  // 3. メッセージ送信処理
  const handleSend = async () => {
    if (inputText.trim().length === 0 || !roomId) return;

    const contentToSend = inputText;
    setInputText(""); // 先に入力欄を空にする

    try {
      // APIを叩いて送信
      const response = await fetch(`${API_URL}/dm/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          content: contentToSend,
        }),
      });

      if (!response.ok) {
        throw new Error("Message send failed");
      }
      console.log("Message sent!");
    } catch (error) {
      Alert.alert("送信エラー", "メッセージが送れませんでした。");
      console.error(error);
      setInputText(contentToSend); // エラーなら入力を戻す
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === MY_USER_ID;
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.myMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
        </View>
        <Text style={styles.timeText}>
          {item.timestamp.getHours()}:
          {String(item.timestamp.getMinutes()).padStart(2, "0")}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Connecting to server...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with {TARGET_USER_ID}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        inverted={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.inputContainerWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="メッセージを入力..."
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>送信</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// スタイル定義（変更なし）
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    height: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 30,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  listContent: { paddingHorizontal: 10, paddingBottom: 10 },
  messageRow: { marginVertical: 5, flexDirection: "column", maxWidth: "80%" },
  myMessageRow: { alignSelf: "flex-end", alignItems: "flex-end" },
  otherMessageRow: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 4 },
  myBubble: { backgroundColor: "#007AFF", borderTopRightRadius: 2 },
  otherBubble: { backgroundColor: "#fff", borderTopLeftRadius: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },
  myMessageText: { color: "#fff" },
  otherMessageText: { color: "#333" },
  timeText: { fontSize: 10, color: "#888", marginHorizontal: 4 },
  inputContainerWrapper: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});
