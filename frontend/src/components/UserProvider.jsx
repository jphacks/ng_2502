import { useState, useMemo } from "react";
import { UserContext } from "../context/UserContext.jsx";

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [iconColor, setIconColor] = useState("blue"); // デフォルトは青
  const [username, setUsername] = useState("");
  const [postContent, setPostContent] = useState("");

  // useMemoでcontextの値をメモ化し、不要な再レンダリングを防ぎます
  const value = useMemo(
    () => ({
      email,
      setEmail,
      iconColor,
      setIconColor,
      username,
      setUsername,
      postContent,
      setPostContent,
    }),
    [email, iconColor, username, postContent]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
