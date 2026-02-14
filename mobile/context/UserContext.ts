import { createContext } from "react";

export interface UserContextType {
  email: string;
  setEmail: (email: string) => void;
  iconColor: string;
  setIconColor: (color: string) => void;
  username: string;
  setUsername: (username: string) => void;
  postContent: string;
  setPostContent: (content: string) => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
