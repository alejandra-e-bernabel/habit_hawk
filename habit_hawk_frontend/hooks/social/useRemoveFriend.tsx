import { useState } from "react";
import { removeFriend as removeFriendService } from "@/services/SocialServices";

const useRemoveFriend = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeFriend = async (friendshipId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await removeFriendService(friendshipId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove friend");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { removeFriend, loading, error };
};

export default useRemoveFriend;
