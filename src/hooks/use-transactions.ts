import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  reference: string;
  amount: number;       // in kobo
  currency: string;
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    setTransactions((data as Transaction[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { transactions, loading, refresh: fetch };
}
