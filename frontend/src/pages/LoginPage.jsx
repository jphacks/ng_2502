import { VStack, Image, Box } from "@chakra-ui/react";
import AppIcon from "../assets/AppIcon.png";
import { InputText } from "../components/InputText";
import { TextButton } from "../components/TextButton";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const LoginPage = () => {
  const { email, setEmail } = useUser();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // const handleLogin = () => {
  //   console.log({ email, password });
  //   navigate("/profile");
  // };

  // 既存ユーザーのログイン
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ ログイン成功:", userCredential.user.email);
      navigate("/profile"); // ログイン後ページへ
    } catch (error) {
      alert("ログインに失敗しました: " + error.message);
    }
  };

  // 新規登録
  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("🆕 新規登録成功:", userCredential.user.email);

      // ここでプロフィール初期設定画面へ遷移
      navigate("/profile-setup");
    } catch (error) {
      alert("新規登録に失敗しました: " + error.message);
    }
  };

  return (
    <Box display="flex" justifyContent="center">
      <VStack h="100vh" align="center" w="300px" spacing={4} pt={20}>
        <Image src={AppIcon} alt="アプリケーションアイコン" boxSize="120px" />
        <InputText
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputText
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <TextButton w="100%" onClick={handleLogin}>
          ログイン
        </TextButton>
        <TextButton w="100%" onClick={handleRegister}>
          あたらしくはじめる
        </TextButton>
      </VStack>
    </Box>
  );
};
