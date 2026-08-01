import { createContext } from "react";

export type TabType = "solo" | "friends";

export interface UserContextType {
  email: string;
  setEmail: (email: string) => void;
  iconColor: string;
  setIconColor: (color: string) => void;
  username: string;
  setUsername: (username: string) => void;
  comment: string;
  setComment: (comment: string) => void;
  postContent: string;
  setPostContent: (content: string) => void;
  isLoading: boolean;
  uid: string;
  angou: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);
