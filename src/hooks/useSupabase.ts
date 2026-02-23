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
        .select('*')
        .order('created_at', { ascending: false });
      
      if (query) {
        const [field, operator, value] = query.match(/([^=]+)=([^.]+)\.(.+)/)?.slice(1) || [];
        if (field && operator && value) {
          supabaseQuery = supabaseQuery.filter(field, operator, value);
        }
      }

      const { data: result, error } = await supabaseQuery;

      if (error) throw error;
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

  const insert = async (item: Omit<T, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from(table)
      .insert([{ ...item, user_id: user.id }])
      .select();

    if (error) throw error;
    setData([result[0], ...data]);
    return result[0];
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    setData(prev => prev.filter(d => (d as any).id !== id));
  };

  return { data, loading, error, insert, update, remove, refresh: fetchData };
}
