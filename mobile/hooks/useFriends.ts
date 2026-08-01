import { useCallback, useState } from "react";
import { auth } from "@/firebase";
import { API_BASE_URL } from "@/constants/api";

export type FriendUser = {
  uid: string;
  username: string;
  iconColor: string;
};

export type FriendRequestResult = "not_found" | "already_exists" | null;

const getToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error("認証されていません");
  return user.getIdToken();
};

export const useFriends = () => {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const [friendsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/friends/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [friendsData, requestsData] = await Promise.all([
        friendsRes.json(),
        requestsRes.json(),
      ]);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
      setFriendRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (e) {
      console.error("ともだち取得エラー:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendFriendRequest = useCallback(
    async (angou: string): Promise<FriendRequestResult> => {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/friends/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ angou }),
      });
      if (res.status === 404) return "not_found";
      if (res.status === 409) return "already_exists";
      if (!res.ok) throw new Error("もうしこみに失敗しました");
      return null;
    },
    []
  );

  const acceptFriendRequest = useCallback(async (uid: string): Promise<void> => {
    const token = await getToken();
    const res = await fetch(`${API_BASE_URL}/friends/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });
    if (!res.ok) throw new Error("しょうにんに失敗しました");
    setFriendRequests((prev) => prev.filter((r) => r.uid !== uid));
    const accepted = friendRequests.find((r) => r.uid === uid);
    if (accepted) setFriends((prev) => [...prev, accepted]);
  }, [friendRequests]);

  return {
    friends,
    friendRequests,
    isLoading,
    fetchFriends,
    sendFriendRequest,
    acceptFriendRequest,
  };
};
