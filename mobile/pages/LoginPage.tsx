import { useUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { Image } from "react-native";
import { YStack } from "tamagui";
import { InputText } from "../components/ui/InputText";
import { TextButton } from "../components/ui/TextButton";
import { WhiteTextButton } from "../components/ui/WhiteTextButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginPage = () => {
  const { email, setEmail } = useUser();
  const [password, setPassword] = useState("");
  const router = useRouter();

  // 既存ユーザーのログイン
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // --- ▼▼▼【重要】ここから追加 ▼▼▼ ---
      // ログイン成功後、IDトークンを取得
      const idToken = await userCredential.user.getIdToken();
      await AsyncStorage.setItem("firebaseIdToken", idToken);
      // --- ▲▲▲ ここまで追加 ▲▲▲ ---

      console.log("✅ ログイン成功:", userCredential.user.email);
      router.replace("/(tabs)/list"); // ログイン後ページへ
    } catch (error) {
      const firebaseError = error as FirebaseError;
      alert("ログインに失敗しました: " + firebaseError.message);
    }
  };

  // 新規登録
  const handleRegister = async () => {
    console.log("📝 新規登録開始:", { email, passwordLength: password.length });

    // パスワードの長さをチェック
    if (password.length < 6) {
      alert("パスワードは6文字以上で入力してください");
      return;
    }

    try {
      console.log("🔄 Firebase Auth に登録中...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("✅ Firebase Auth 登録成功:", userCredential.user.uid);

      // IDトークンを取得
      console.log("🔑 IDトークン取得中...");
      const idToken = await userCredential.user.getIdToken();
      console.log("🔑 IDトークン取得成功");

      console.log("💾 IDトークン保存中...");
      await AsyncStorage.setItem("firebaseIdToken", idToken);
      console.log("💾 IDトークン保存完了");

      console.log("🆕 新規登録成功:", userCredential.user.email);

      // Firebase Authの初期化を待つ
      console.log("⏳ 認証の初期化を待機中...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待つ

      console.log("🚀 /modeset へ遷移します");

      router.replace("./modeset"); // 新規登録後はモード設定へ
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("❌ 新規登録エラー:", error);
      console.error("❌ エラーコード:", firebaseError.code);
      console.error("❌ エラーメッセージ:", firebaseError.message);

      // エラーメッセージを日本語化
      let errorMessage = "新規登録に失敗しました";

      if (firebaseError.code === "auth/email-already-in-use") {
        errorMessage = "このメールアドレスは既に登録されています";
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = "メールアドレスの形式が正しくありません";
      } else if (firebaseError.code === "auth/weak-password") {
        errorMessage = "パスワードは6文字以上で入力してください";
      } else {
        errorMessage = `新規登録に失敗しました: ${firebaseError.message}`;
      }

      alert(errorMessage);
    }
  };

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$5"
      gap="$4"
    >
      <Image
        source={require("../assets/images/AppIcon.png")}
        style={{ width: 160, height: 160 }}
        resizeMode="contain"
      />
      <InputText
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        width="85%"
        alignSelf="center"
      />
      <InputText
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        width="85%"
        alignSelf="center"
      />
      <TextButton onPress={handleLogin} width="55%">
        ログイン
      </TextButton>
      <WhiteTextButton onPress={handleRegister} width="55%">
        あたらしくはじめる
      </WhiteTextButton>
    </YStack>
  );
};

export default LoginPage;
