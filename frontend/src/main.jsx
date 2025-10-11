import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import { InputPage } from "./pages/InputPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { PostPage } from "./pages/PostPage.jsx";
import { ListPage } from "./pages/ListPage.jsx";
import "./index.css";

// 1. ChakraProvider をインポートします
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme/theme.js";
import { Post } from "./components/Post.jsx";
import { UserProvider } from "./components/UserProvider.jsx";
import { Layout } from "./components/Layout.jsx";

const router = createBrowserRouter([
  {
    // ヘッダーが不要なページ
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "input", // /input
    element: <InputPage />,
  },
  {
    path: "profile", // /profile
    element: <ProfilePage />,
  },
  {
    // ヘッダーを表示したいページ群
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "list", // /list
        element: <ListPage />,
      },
      {
        path: "post", // /post
        element: <PostPage />,
      },
      {
        path: "test",
        element: <Post />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. <App /> コンポーネント全体を <ChakraProvider> で囲みます */}
    <ChakraProvider theme={theme}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ChakraProvider>
  </React.StrictMode>
);
