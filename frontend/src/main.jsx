import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const InputPage = lazy(() => import("./pages/InputPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const PostPage = lazy(() => import("./pages/PostPage.jsx"));
const ListPage = lazy(() => import("./pages/ListPage.jsx"));
const Layout = lazy(() => import("./components/Layout.jsx"));
const Post = lazy(() => import("./components/Post.jsx"));
import "./index.css";

// 1. ChakraProvider をインポートします
import { ChakraProvider, Spinner, Center } from "@chakra-ui/react";
import theme from "./theme/theme.js";
import { UserProvider } from "./components/UserProvider.jsx";

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
        <Suspense
          fallback={
            <Center h="100vh">
              <Spinner size="xl" color="orange.400" />
            </Center>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </UserProvider>
    </ChakraProvider>
  </React.StrictMode>
);
