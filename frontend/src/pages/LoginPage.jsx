import { VStack, Image, Box } from "@chakra-ui/react";
import AppIcon from "../assets/AppIcon.png";
import { InputText } from "../components/InputText";
import { TextButton } from "../components/TextButton";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { WhiteTextButton } from "../components/WhiteTextButton";
import axios from "axios";

const LoginPage = () => {
  const { email, setEmail } = useUser();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // const handleLogin = () => {
  //   console.log({ email, password });
  //   navigate("/profile");
  // };

  // 既存ユーザーのログイン
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // --- ▼▼▼【重要】ここから追加 ▼▼▼ ---
      // ログイン成功後、IDトークンを取得
      const idToken = await userCredential.user.getIdToken();
      // localStorageにIDトークンを保存
      localStorage.setItem("firebaseIdToken", idToken);
      // --- ▲▲▲ ここまで追加 ▲▲▲ ---

      console.log("✅ ログイン成功:", userCredential.user.email);
      navigate("/profile"); // ログイン後ページへ
    } catch (error) {
      alert("ログインに失敗しました: " + error.message);
    }
  };

  // 新規登録
  const handleRegister = async () => {
    //Authにユーザー登録
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // --- ▼▼▼【重要】ここから追加 ▼▼▼ ---
      // 新規登録が成功すると自動でログインされるので、IDトークンを取得
      const idToken = await userCredential.user.getIdToken();
      // localStorageにIDトークンを保存
      localStorage.setItem("firebaseIdToken", idToken);
      // --- ▲▲▲ ここまで追加 ▲▲▲ ---
      console.log("🆕 新規登録成功:", user.email);

      // FastAPI に Firestore 登録リクエスト送信
      await axios.post("http://localhost:8000/create-user", {
        //本番デプロイ時はURLをデプロイ先に変更すること
        uid: user.uid,
        email: user.email,
      });

      console.log("✅ Firestore 登録成功");

      navigate("/profile");
    } catch (error) {
      alert("新規登録に失敗しました: " + error.message);
    }
  };

  return (
    <Box display="flex" justifyContent="center">
      <VStack
        h="100vh"
        align="center"
        w={{ base: "90%", sm: "300px", md: "400px", lg: "500px" }}
        spacing={4}
        pt={20}
        // padding={5}
      >
        <Image
          src={AppIcon}
          alt="アプリケーションアイコン"
          boxSize={{ base: "100px", sm: "140px", md: "150px", lg: "200px" }}
        />
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
        <TextButton w="80%" onClick={handleLogin}>
          ログイン
        </TextButton>
        <WhiteTextButton w="80%" onClick={handleRegister}>
          あたらしくはじめる
        </WhiteTextButton>
      </VStack>
    </Box>
  );
};

export default LoginPage;
