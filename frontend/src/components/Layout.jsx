import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export const Layout = () => {
  return (
    <Box>
      <Header />
      <Box as="main">
        <Outlet />
      </Box>
    </Box>
  );
};
