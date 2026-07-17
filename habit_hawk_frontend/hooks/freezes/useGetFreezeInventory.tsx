import { useCallback, useEffect, useState } from "react";

import { getFreezeInventory as getFreezeInventoryService } from "@/services/FreezeServices";
import type { FreezeInventoryResponse } from "@/types/freezes";

const useGetFreezeInventory = () => {
  const [inventory, setInventory] = useState<FreezeInventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFreezeInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFreezeInventoryService();
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch freezes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreezeInventory();
  }, [fetchFreezeInventory]);

  return { inventory, loading, error, refetch: fetchFreezeInventory };
};

export default useGetFreezeInventory;
