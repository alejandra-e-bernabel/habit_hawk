import { useState } from "react";

import { applyFreeze as applyFreezeService } from "@/services/FreezeServices";
import type { FreezeApplyRequest, FreezeResponse } from "@/types/freezes";

const useApplyFreeze = () => {
  const [appliedFreeze, setAppliedFreeze] = useState<FreezeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyFreeze = async (
    freezeId: number,
    data: FreezeApplyRequest
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedFreeze = await applyFreezeService(freezeId, data);
      setAppliedFreeze(updatedFreeze);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply freeze");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { applyFreeze, appliedFreeze, loading, error };
};

export default useApplyFreeze;
