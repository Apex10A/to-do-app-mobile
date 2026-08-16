import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  created_at: string;
}

export const FREE_TODO_LIMIT = 5;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTodos(userId: string | undefined, plan: 'free' | 'pro') {
  const [todos, setTodos]       = useState<Todo[]>([]);
  const [loading, setLoading]   = useState(true);
  const mounted = useRef(true);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!mounted.current) return;
    if (!error) setTodos(
      ((data as Todo[]) ?? []).map(t => ({
        ...t,
        priority: (['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium') as Priority,
      }))
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    fetch();
    return () => { mounted.current = false; };
  }, [fetch]);

  // ── Cap check ─────────────────────────────────────────────────────────
  // Free users can have at most FREE_TODO_LIMIT todos.
  // Returns true if adding is allowed, false if cap is reached.
  const canAdd = plan === 'pro' || todos.length < FREE_TODO_LIMIT;

  // ── CREATE ────────────────────────────────────────────────────────────
  const addTodo = useCallback(async (
    text: string,
    priority: Priority = 'medium',
  ): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'Not signed in.' };
    if (!canAdd) return { error: 'cap' }; // caller checks 'cap' to show upgrade gate

    const tempId   = `temp-${Date.now()}`;
    const optimistic: Todo = {
      id: tempId, user_id: userId, text,
      completed: false, priority,
      created_at: new Date().toISOString(),
    };
    setTodos(prev => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from('todos')
      .insert({ text, completed: false, priority, user_id: userId })
      .select()
      .single();

    if (error) {
      setTodos(prev => prev.filter(t => t.id !== tempId));
      return { error: error.message };
    }
    setTodos(prev => prev.map(t => t.id === tempId ? (data as Todo) : t));
    return { error: null };
  }, [userId, canAdd]);

  // ── UPDATE (toggle) ───────────────────────────────────────────────────
  const toggleTodo = useCallback(async (
    id: string,
    currentCompleted: boolean,
  ): Promise<{ error: string | null }> => {
    const next = !currentCompleted;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: next } : t));

    const { error } = await supabase
      .from('todos')
      .update({ completed: next })
      .eq('id', id);

    if (error) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: currentCompleted } : t));
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // ── UPDATE (priority) ─────────────────────────────────────────────────
  // Priority changes are Pro-only for Low and High.
  // Medium is available to everyone.
  const updatePriority = useCallback(async (
    id: string,
    priority: Priority,
    currentPriority: Priority,
  ): Promise<{ error: string | null }> => {
    if (plan === 'free' && priority !== 'medium') {
      return { error: 'pro_feature' }; // caller shows upgrade gate
    }
    setTodos(prev => prev.map(t => t.id === id ? { ...t, priority } : t));

    const { error } = await supabase
      .from('todos')
      .update({ priority })
      .eq('id', id);

    if (error) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, priority: currentPriority } : t));
      return { error: error.message };
    }
    return { error: null };
  }, [plan]);

  // ── UPDATE (text edit) ────────────────────────────────────────────────
  const editTodo = useCallback(async (
    id: string,
    text: string,
    oldText: string,
  ): Promise<{ error: string | null }> => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t));

    const { error } = await supabase
      .from('todos')
      .update({ text })
      .eq('id', id);

    if (error) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, text: oldText } : t));
      return { error: error.message };
    }
    return { error: null };
  }, []);

  // ── DELETE ────────────────────────────────────────────────────────────
  const deleteTodo = useCallback(async (
    id: string,
  ): Promise<{ error: string | null }> => {
    const original = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      if (original) setTodos(prev => [original, ...prev]);
      return { error: error.message };
    }
    return { error: null };
  }, [todos]);

  // ── Derived ───────────────────────────────────────────────────────────
  const active    = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);
  const remaining = active.length;

  return {
    todos, loading, canAdd,
    active, completed, remaining,
    addTodo, toggleTodo, updatePriority, editTodo, deleteTodo,
    refresh: fetch,
  };
}
