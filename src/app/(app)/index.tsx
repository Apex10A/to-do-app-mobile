import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Filter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
}

const INITIAL_TODOS: Todo[] = [
  { id: '1', text: 'Buy groceries', completed: false },
  { id: '2', text: 'Walk the dog', completed: true },
  { id: '3', text: 'Read 20 pages', completed: false },
];

function TodoItem({ todo, onToggle, onDelete }: { todo: Todo; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.todoRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Pressable
        onPress={() => onToggle(todo.id)}
        style={[styles.checkbox, { borderColor: theme.accent }, todo.completed && { backgroundColor: theme.accent, borderColor: theme.accent }]}
        accessibilityRole="checkbox" accessibilityState={{ checked: todo.completed }}
        accessibilityLabel={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}>
        {todo.completed && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>

      <Text style={[styles.todoText, { color: theme.text }, todo.completed && { textDecorationLine: 'line-through', color: theme.textSecondary }]}>
        {todo.text}
      </Text>

      <Pressable onPress={() => onDelete(todo.id)} style={styles.deleteBtn}
        accessibilityRole="button" accessibilityLabel={`Delete "${todo.text}"`}>
        <Text style={[styles.deleteIcon, { color: theme.textSecondary }]}>✕</Text>
      </Pressable>
    </View>
  );
}

function FilterTab({ label, value, active, onPress }: { label: string; value: Filter; active: boolean; onPress: (v: Filter) => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[styles.filterTab, { borderColor: theme.border }, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}
      accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.filterTabText, { color: active ? theme.accentText : theme.textSecondary }, active && { fontFamily: Fonts.semibold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function TodoScreen() {
  const theme = useTheme();
  const [todos, setTodos]   = useState<Todo[]>(INITIAL_TODOS);
  const [input, setInput]   = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  function handleAdd() {
    const text = input.trim();
    if (!text) return;
    // TODO: await supabase.from('todos').insert({ text, completed: false, user_id })
    setTodos(prev => [{ id: Date.now().toString(), text, completed: false, createdAt: new Date().toISOString() }, ...prev]);
    setInput('');
  }

  function handleToggle(id: string) {
    // TODO: await supabase.from('todos').update({ completed }).eq('id', id)
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function handleDelete(id: string) {
    // TODO: await supabase.from('todos').delete().eq('id', id)
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  const filtered  = todos.filter(t => filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true);
  const remaining = todos.filter(t => !t.completed).length;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>My Todos</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {remaining} task{remaining !== 1 ? 's' : ''} remaining
          </Text>
        </View>

        <View style={[styles.inputRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Add a new task…" placeholderTextColor={theme.textSecondary}
            value={input} onChangeText={setInput} onSubmitEditing={handleAdd}
            returnKeyType="done" accessibilityLabel="New task input"
          />
          <Pressable onPress={handleAdd} style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
            disabled={!input.trim()} accessibilityRole="button" accessibilityLabel="Add task">
            <Text style={[styles.addBtnText, { color: Brand.championBlue }]}>＋</Text>
          </Pressable>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'active', 'completed'] as Filter[]).map(f => (
            <FilterTab key={f} value={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={filter === f} onPress={setFilter} />
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          renderItem={({ item }) => <TodoItem todo={item} onToggle={handleToggle} onDelete={handleDelete} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {filter === 'completed' ? 'Nothing completed yet.' : filter === 'active' ? 'All done! 🎉' : 'No tasks yet. Add one above.'}
              </Text>
            </View>
          }
        />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.four },

  header: { marginBottom: Spacing.three, gap: Spacing.half },
  title: { fontFamily: Fonts.bold, fontSize: 34, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.medium, fontSize: 13 },

  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, marginBottom: Spacing.two, gap: Spacing.two },
  input: { fontFamily: Fonts.regular, flex: 1, fontSize: 15, lineHeight: 22, paddingVertical: Spacing.one },
  addBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 22 },

  filterRow: { flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three },
  filterTab: { flex: 1, paddingVertical: Spacing.two, borderRadius: Radius.sm, borderWidth: 1, alignItems: 'center' },
  filterTabText: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },

  list: { paddingBottom: Spacing.six },
  todoRow: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, gap: Spacing.two },
  checkbox: { width: 24, height: 24, borderRadius: Radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 13, lineHeight: 14 },
  todoText: { fontFamily: Fonts.regular, flex: 1, fontSize: 15, lineHeight: 22 },
  deleteBtn: { padding: Spacing.one },
  deleteIcon: { fontFamily: Fonts.regular, fontSize: 13 },

  empty: { paddingTop: Spacing.six, alignItems: 'center' },
  emptyText: { fontFamily: Fonts.regular, fontSize: 14 },
});
