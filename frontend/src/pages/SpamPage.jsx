import React from "react";
import { VStack, Button, Text, Center, Image, Box } from "@chakra-ui/react";

const CenteredLayout = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bg="gray.50"
    >
      <VStack spacing={6}>
        <Image
          src="https://images.unsplash.com/photo-1667420170858-39d40cb413e3?auto=format&fit=crop&w=800&q=80"
          alt="アイコン"
          boxSize="150px"
        />
        <Text fontSize="xl">ようこそ！</Text>
        <Button colorScheme="teal">はじめる</Button>
      </VStack>
    </Box>
  );
};

export default CenteredLayout;
