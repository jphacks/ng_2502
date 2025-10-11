import { VStack, Image, Box } from "@chakra-ui/react";
import AppIcon from "../assets/AppIcon.png";
import { InputText } from "../components/InputText";
import { TextButton } from "../components/TextButton";

export const LoginPage = () => {
  return (
    <Box display="flex" justifyContent="center">
      <VStack h="100vh" align="center" w="300px" spacing={4} pt={20}>
        <Image src={AppIcon} alt="アプリケーションアイコン" boxSize="120px" />
        <InputText placeholder="メールアドレス" />
        <InputText placeholder="パスワード" type="password" />
        <TextButton w="100%">ログイン</TextButton>
        <TextButton w="100%">あたらしくはじめる</TextButton>
      </VStack>
    </Box>
  );
};
