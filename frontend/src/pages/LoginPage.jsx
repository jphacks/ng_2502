import { VStack, Image, Box } from "@chakra-ui/react";
import AppIcon from "../assets/AppIcon.png";
import { InputText } from "../components/InputText";
import { TextButton } from "../components/TextButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const LoginPage = () => {
  const [mailAdress, setMailAdress] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log({ mailAdress, password });
    navigate("/profile");
  };

  return (
    <Box display="flex" justifyContent="center">
      <VStack h="100vh" align="center" w="300px" spacing={4} pt={20}>
        <Image src={AppIcon} alt="アプリケーションアイコン" boxSize="120px" />
        <InputText
          placeholder="メールアドレス"
          value={mailAdress}
          onChange={(e) => setMailAdress(e.target.value)}
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
        <TextButton w="100%">あたらしくはじめる</TextButton>
      </VStack>
    </Box>
  );
};
