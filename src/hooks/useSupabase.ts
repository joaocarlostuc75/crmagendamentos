import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseData<T>(table: string, query: string = '', initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isFallback, setIsFallback] = useState(false);

  const getLocalKey = () => `beauty_agenda_fallback_${table}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from(table)
        .select('*');
      
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

      if (query) {
        const [field, operator, value] = query.match(/([^=]+)=([^.]+)\.(.+)/)?.slice(1) || [];
        if (field && operator && value) {
          supabaseQuery = supabaseQuery.filter(field, operator, value);
        }
      }

      const { data: result, error } = await supabaseQuery;

      if (error) {
        // Missing table (42P01) or other schema issues
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('not find')) {
          console.warn(`Table "${table}" not found. Falling back to localStorage.`);
          setIsFallback(true);
          const localData = localStorage.getItem(getLocalKey());
          setData(localData ? JSON.parse(localData) : initialData);
          return;
        }

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
      setIsFallback(false);
    } catch (err) {
      setError(err);
      console.error(`Error fetching ${table}:`, err);
      // Final fallback if everything fails
      setIsFallback(true);
      const localData = localStorage.getItem(getLocalKey());
      setData(localData ? JSON.parse(localData) : initialData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, query]);

  const saveLocal = (newData: T[]) => {
    localStorage.setItem(getLocalKey(), JSON.stringify(newData));
    setData(newData);
  };

  const insert = async (item: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    let currentItem = user ? { ...item, user_id: user.id } : item;
    
    if (isFallback) {
      const newItem = { ...currentItem, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
      saveLocal([newItem, ...data]);
      return newItem;
    }

    const attemptInsert = async (payload: any): Promise<any> => {
      const { data: result, error } = await supabase
        .from(table)
        .insert([payload])
        .select();

      if (error) {
        // Handle missing column errors (Postgres 42703 or PostgREST schema cache error)
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('schema cache') || error.message?.includes('not find')) {
          const match = error.message.match(/column "([^"]+)"/) || error.message.match(/find the '([^']+)' column/);
          const missingColumn = match ? match[1] : null;
          
          if (missingColumn && payload[missingColumn] !== undefined) {
            console.warn(`Removing missing column "${missingColumn}" from insert into ${table}`);
            const { [missingColumn]: _, ...newPayload } = payload;
            return attemptInsert(newPayload);
          }
          
          if (payload.user_id) {
            console.warn(`Removing user_id from insert into ${table} as it might be missing`);
            const { user_id, ...newPayload } = payload;
            return attemptInsert(newPayload);
          }
        }
        
        // If we still have an error, fall back to localStorage for this table
        console.error(`Insert failed for ${table}, falling back to localStorage:`, error);
        setIsFallback(true);
        const newItem = { ...payload, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString() };
        saveLocal([newItem, ...data]);
        return newItem;
      }
      
      if (result && result.length > 0) {
        setData([result[0], ...data]);
        return result[0];
      }
      return null;
    };

    try {
      return await attemptInsert(currentItem);
    } catch (err) {
      console.error(`Error inserting into ${table}:`, err);
      throw err;
    }
  };

  const update = async (id: string | number, item: Partial<T>) => {
    if (isFallback) {
      const newData = data.map(d => (d as any).id === id ? { ...d, ...item } : d);
      saveLocal(newData);
      return newData.find(d => (d as any).id === id);
    }

    const attemptUpdate = async (payload: any): Promise<any> => {
      const { data: result, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select();

      if (error) {
        // Handle missing column errors (Postgres 42703 or PostgREST schema cache error)
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('schema cache') || error.message?.includes('not find')) {
          const match = error.message.match(/column "([^"]+)"/) || error.message.match(/find the '([^']+)' column/);
          const missingColumn = match ? match[1] : null;
          
          if (missingColumn && payload[missingColumn] !== undefined) {
            console.warn(`Removing missing column "${missingColumn}" from update of ${table}`);
            const { [missingColumn]: _, ...newPayload } = payload;
            return attemptUpdate(newPayload);
          }
        }
        
        // Fallback to localStorage
        console.error(`Update failed for ${table}, falling back to localStorage:`, error);
        setIsFallback(true);
        const newData = data.map(d => (d as any).id === id ? { ...d, ...payload } : d);
        saveLocal(newData);
        return newData.find(d => (d as any).id === id);
      }
      
      if (result && result.length > 0) {
        setData(data.map(d => (d as any).id === id ? result[0] : d));
        return result[0];
      }
      return null;
    };

    try {
      return await attemptUpdate(item);
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      throw err;
    }
  };

  const remove = async (id: string | number) => {
    if (isFallback) {
      const newData = data.filter(d => (d as any).id !== id);
      saveLocal(newData);
      return;
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    setData(prev => prev.filter(d => (d as any).id !== id));
  };

  return { data, loading, error, insert, update, remove, refresh: fetchData, isFallback };
}
