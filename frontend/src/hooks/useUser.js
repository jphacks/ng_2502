import { useContext } from "react";
import { UserContext } from "../context/UserContext.jsx";

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
