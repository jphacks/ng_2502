import { useState, useMemo } from "react";
import { UserContext } from "../context/UserContext.jsx";

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [iconColor, setIconColor] = useState("blue"); // デフォルトは青
  const [postContent, setPostContent] = useState("");

  // useMemoでcontextの値をメモ化し、不要な再レンダリングを防ぎます
  const value = useMemo(
    () => ({
      email,
      setEmail,
      iconColor,
      setIconColor,
      postContent,
      setPostContent,
    }),
    [email, iconColor, postContent]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
