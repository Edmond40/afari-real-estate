import { useCallback, useEffect, useState } from 'react';
import api from '../api';

export function useListing(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOne = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/listings/${id}`);
      setData(data?.data?.listing || data?.listing || data || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOne();
  }, [fetchOne]);

  return { listing: data, loading, error, refetch: fetchOne };
}
