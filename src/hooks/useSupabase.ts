import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseData<T>(table: string, query: string = '', initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from(table)
        .select('*');
      
      // Only order by created_at if it's likely to exist or if we can check metadata (which we can't easily).
      // For now, let's just try to order, but if it fails, we might need a retry without order.
      // Actually, better to just order by id if created_at is not guaranteed, or let the caller specify.
      // For this app, let's assume created_at exists for most, but maybe not all.
      // Let's try to order by created_at, but catch the specific error if column doesn't exist?
      // No, Supabase query builder doesn't throw on build, only on await.
      
      // Let's just default to created_at for now, but if it fails, we can't easily retry in this structure without complexity.
      // Let's assume standard tables have created_at.
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

      if (query) {
        const [field, operator, value] = query.match(/([^=]+)=([^.]+)\.(.+)/)?.slice(1) || [];
        if (field && operator && value) {
          supabaseQuery = supabaseQuery.filter(field, operator, value);
        }
      }

      const { data: result, error } = await supabaseQuery;

      if (error) {
        // If error is about missing column, try again without ordering
        if (error.code === '42703') { // Undefined column
             const { data: retryResult, error: retryError } = await supabase
                .from(table)
                .select('*');
             if (retryError) throw retryError;
             setData(retryResult || []);
             return;
        }
        throw error;
      }
      setData(result || []);
    } catch (err) {
      setError(err);
      console.error(`Error fetching ${table}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, query]);

  const insert = async (item: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // We'll try to insert with user_id if user exists, 
    // but if it fails with "column does not exist", we retry without it.
    try {
      const payload = user ? { ...item, user_id: user.id } : item;
      const { data: result, error } = await supabase
        .from(table)
        .insert([payload])
        .select();

      if (error) {
        if (error.code === '42703') { // Undefined column user_id
          const { data: retryResult, error: retryError } = await supabase
            .from(table)
            .insert([item])
            .select();
          if (retryError) throw retryError;
          setData([retryResult[0], ...data]);
          return retryResult[0];
        }
        throw error;
      }
      setData([result[0], ...data]);
      return result[0];
    } catch (err) {
      console.error(`Error inserting into ${table}:`, err);
      throw err;
    }
  };

  const update = async (id: string | number, item: Partial<T>) => {
    const { data: result, error } = await supabase
      .from(table)
      .update(item)
      .eq('id', id)
      .select();

    if (error) throw error;
    setData(data.map(d => (d as any).id === id ? result[0] : d));
    return result[0];
  };

  const remove = async (id: string | number) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    setData(prev => prev.filter(d => (d as any).id !== id));
  };

  return { data, loading, error, insert, update, remove, refresh: fetchData };
}
