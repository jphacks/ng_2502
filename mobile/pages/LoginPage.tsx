import { useUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { YStack } from "tamagui";
import { InputText } from "../components/ui/InputText";
import { TextButton } from "../components/ui/TextButton";
import { WhiteTextButton } from "../components/ui/WhiteTextButton";

const LoginPage = () => {
  const { email, setEmail } = useUser();
  const [password, setPassword] = useState("");
  const router = useRouter();
  const isRegisteringRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }
      try {
        await user.reload();

        if (!user.emailVerified) {
          if (!isRegisteringRef.current) {
            await signOut(auth);
          }
          return;
        }

        router.replace("/(tabs)/list");
      } catch (error) {
        console.error(
          "❌ ユーザー情報のリロード中にエラーが発生しました:",
          error,
        );
      }
    });

    return unsubscribe;
  }, [router]);

  // 既存ユーザーのログイン
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;
      await user.reload();

      if (!user.emailVerified) {
        await signOut(auth);
        alert("メール認証してください");
        return;
      }

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
    isRegisteringRef.current = true;

    // パスワードの長さをチェック
    if (password.length < 6) {
      alert("パスワードは6文字以上で入力してください");
      isRegisteringRef.current = false;
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

      //メールアドレス認証
      const user = userCredential.user;
      console.log("📧 メール送信開始");
      await sendEmailVerification(user);
      await signOut(auth);
      alert("確認メールを送信しました。メール認証後にログインしてください。");
      console.log("📧 メール認証送信成功:", user.email);
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
    } finally {
      isRegisteringRef.current = false;
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
