import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/toast';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Greeting helper
// ---------------------------------------------------------------------------
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---------------------------------------------------------------------------
// TodoItem
// ---------------------------------------------------------------------------
function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.todoRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      {/*
        Checkbox — tapping it TOGGLES completed.
        A todo moves to the "Completed" filter tab as soon as you check it,
        and back to "Active" when you uncheck it.
      */}
      <Pressable
        onPress={() => onToggle(todo.id, todo.completed)}
        style={[
          styles.checkbox,
          { borderColor: theme.accent },
          todo.completed && { backgroundColor: theme.accent, borderColor: theme.accent },
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}>
        {todo.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      <Text
        style={[
          styles.todoText,
          { color: theme.text },
          todo.completed && { textDecorationLine: 'line-through', color: theme.textSecondary },
        ]}>
        {todo.text}
      </Text>

      <Pressable
        onPress={() => onDelete(todo.id)}
        style={styles.deleteBtn}
        accessibilityRole="button"
        accessibilityLabel={`Delete "${todo.text}"`}>
        <Text style={[styles.deleteIcon, { color: theme.textSecondary }]}>✕</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// FilterTab
// ---------------------------------------------------------------------------
function FilterTab({
  label,
  value,
  active,
  count,
  onPress,
}: {
  label: string;
  value: Filter;
  active: boolean;
  count: number;
  onPress: (v: Filter) => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[
        styles.filterTab,
        { borderColor: theme.border },
        active && { backgroundColor: theme.accent, borderColor: theme.accent },
      ]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}>
      <Text
        style={[
          styles.filterTabText,
          { color: active ? theme.accentText : theme.textSecondary },
          active && { fontFamily: Fonts.semibold },
        ]}>
        {label}
        {count > 0 ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function TodoScreen() {
  const theme              = useTheme();
  const { showToast }      = useToast();
  const { profile }        = useProfile();

  const [todos, setTodos]   = useState<Todo[]>([]);
  const [input, setInput]   = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [fetching, setFetching] = useState(true);

  // ── Fetch all todos for the signed-in user ────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function load() {
      setFetching(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) { showToast(error.message, 'error'); }
      else        { setTodos(data ?? []); }
      setFetching(false);
    }

    load();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── CREATE ────────────────────────────────────────────────────────────
  async function handleAdd() {
    const text = input.trim();
    if (!text) return;

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic: Todo = { id: tempId, text, completed: false, created_at: new Date().toISOString() };
    setTodos(prev => [optimistic, ...prev]);
    setInput('');

    const { data, error } = await supabase
      .from('todos')
      .insert({ text, completed: false, user_id: profile?.id })
      .select()
      .single();

    if (error) {
      // Roll back
      setTodos(prev => prev.filter(t => t.id !== tempId));
      setInput(text);
      showToast(error.message, 'error');
    } else {
      // Replace temp with real row
      setTodos(prev => prev.map(t => t.id === tempId ? data : t));
    }
  }

  // ── UPDATE (toggle completed) ─────────────────────────────────────────
  // Tapping the checkbox flips `completed`.
  // The filter tabs then control which ones you SEE:
  //   • "Active"    → shows only completed = false
  //   • "Completed" → shows only completed = true
  //   • "All"       → shows everything
  async function handleToggle(id: string, currentCompleted: boolean) {
    const next = !currentCompleted;

    // Optimistic update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: next } : t));

    const { error } = await supabase
      .from('todos')
      .update({ completed: next })
      .eq('id', id);

    if (error) {
      // Roll back
      setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: currentCompleted } : t));
      showToast(error.message, 'error');
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const original = todos.find(t => t.id === id);

    // Optimistic remove
    setTodos(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      // Roll back
      if (original) setTodos(prev => [original, ...prev]);
      showToast(error.message, 'error');
    } else {
      showToast('Task deleted.', 'info');
    }
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const active    = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);
  const filtered  =
    filter === 'active'    ? active    :
    filter === 'completed' ? completed :
    todos;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>

        {/* Greeting header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {greeting()},
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            {firstName} 👋
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {active.length === 0
              ? 'All caught up!'
              : `${active.length} task${active.length !== 1 ? 's' : ''} remaining`}
          </Text>
        </View>

        {/* Input row */}
        <View style={[styles.inputRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Add a new task…"
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            accessibilityLabel="New task input"
          />
          <Pressable
            onPress={handleAdd}
            style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
            disabled={!input.trim()}
            accessibilityRole="button"
            accessibilityLabel="Add task">
            <Text style={[styles.addBtnText, { color: Brand.championBlue }]}>＋</Text>
          </Pressable>
        </View>

        {/* Filter tabs — each shows a count so you know how many are in each bucket */}
        <View style={styles.filterRow}>
          <FilterTab value="all"       label="All"       active={filter === 'all'}       count={todos.length}      onPress={setFilter} />
          <FilterTab value="active"    label="Active"    active={filter === 'active'}    count={active.length}     onPress={setFilter} />
          <FilterTab value="completed" label="Done"      active={filter === 'completed'} count={completed.length}  onPress={setFilter} />
        </View>

        {/* List */}
        {fetching ? (
          <View style={styles.empty}>
            <ActivityIndicator color={Brand.lavenderTonic} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
            renderItem={({ item }) => (
              <TodoItem todo={item} onToggle={handleToggle} onDelete={handleDelete} />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {filter === 'completed' ? 'Nothing completed yet.' :
                   filter === 'active'    ? 'All done! 🎉' :
                                           'No tasks yet. Add one above.'}
                </Text>
              </View>
            }
          />
        )}

      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen:   { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.four },

  header:   { marginBottom: Spacing.four, gap: 2 },
  greeting: { fontFamily: Fonts.regular, fontSize: 14 },
  title:    { fontFamily: Fonts.bold,    fontSize: 30, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.medium,  fontSize: 13, marginTop: 2 },

  inputRow:      { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, marginBottom: Spacing.two, gap: Spacing.two },
  input:         { fontFamily: Fonts.regular, flex: 1, fontSize: 15, lineHeight: 22, paddingVertical: Spacing.one },
  addBtn:        { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled:{ opacity: 0.35 },
  addBtnText:    { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 22 },

  filterRow:     { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  filterTab:     { flex: 1, paddingVertical: Spacing.two, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center' },
  filterTabText: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 18 },

  list:     { paddingBottom: Spacing.six },
  todoRow:  { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, gap: Spacing.two },
  checkbox: { width: 24, height: 24, borderRadius: Radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark:{ fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 13, lineHeight: 14 },
  todoText: { fontFamily: Fonts.regular, flex: 1, fontSize: 15, lineHeight: 22 },
  deleteBtn:{ padding: Spacing.one },
  deleteIcon:{ fontFamily: Fonts.regular, fontSize: 13 },

  empty:    { paddingTop: Spacing.six, alignItems: 'center' },
  emptyText:{ fontFamily: Fonts.regular, fontSize: 14 },
});
