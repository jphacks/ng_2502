import { useContext } from "react";
// 先ほど作成したファイルからUserContextだけをインポート
import { UserContext } from "../context/UserContext.jsx";

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
