import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import "./index.css";

// 1. ChakraProvider をインポートします
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme.js";
import { Post } from "./components/Post.jsx";

const router = createBrowserRouter([
  {
    path: "/", // ルートURL (例: http://localhost:5173/)
    element: <LoginPage />, // 最初に見せたいページ
  },
  {
    path: "/profile", // /profile というパス
    element: <ProfilePage />, // ProfilePageコンポーネントを表示
  },
  {
    path: "/test",
    element: <Post />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. <App /> コンポーネント全体を <ChakraProvider> で囲みます */}
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
