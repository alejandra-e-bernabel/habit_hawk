import { useState } from "react";
import { sendFriendRequest as sendFriendRequestService } from "@/services/SocialServices";
import type { FriendshipResponse } from "@/types/social";

const useSendFriendRequest = () => {
  const [friendship, setFriendship] = useState<FriendshipResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = async (username: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newFriendship = await sendFriendRequestService(username);
      setFriendship(newFriendship);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send friend request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, friendship, loading, error };
};

export default useSendFriendRequest;
