import { useState, useEffect, useCallback } from "react";
import { getFriends as getFriendsService } from "@/services/SocialServices";
import type { FriendListItem } from "@/types/social";

const useGetFriends = () => {
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFriendsService();
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch friends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return { friends, loading, error, refetch: fetchFriends };
};

export default useGetFriends;
