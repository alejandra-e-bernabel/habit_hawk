import { useState, useEffect, useCallback } from "react";
import { getPendingRequests as getPendingRequestsService } from "@/services/SocialServices";
import type { FriendshipResponse } from "@/types/social";

const useGetPendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState<FriendshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingRequestsService();
      setPendingRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  return { pendingRequests, loading, error, refetch: fetchPendingRequests };
};

export default useGetPendingRequests;
