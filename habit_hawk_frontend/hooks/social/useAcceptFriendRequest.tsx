import { useState } from "react";
import { acceptFriendRequest as acceptFriendRequestService } from "@/services/SocialServices";
import type { FriendshipResponse } from "@/types/social";

const useAcceptFriendRequest = () => {
  const [friendship, setFriendship] = useState<FriendshipResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptRequest = async (friendshipId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedFriendship = await acceptFriendRequestService(friendshipId);
      setFriendship(updatedFriendship);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept friend request");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { acceptRequest, friendship, loading, error };
};

export default useAcceptFriendRequest;
