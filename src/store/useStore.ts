import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { InventoryItem, Category } from '../types';

interface AppState {
  user: any | null;
  items: InventoryItem[];
  categories: Category[];
  loading: boolean;
  sessionLoading: boolean;
  
  setUser: (user: any) => void;
  setSessionLoading: (v: boolean) => void;
  fetchItems: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addItem: (item: Partial<InventoryItem>) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  items: [],
  categories: [],
  loading: false,
  sessionLoading: true, // true until first getSession() resolves

  setUser: (user) => set({ user }),
  setSessionLoading: (v) => set({ sessionLoading: v }),

  fetchItems: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('expiry_date', { ascending: true });
    
    if (error) console.error('Error fetching items:', error);
    else set({ items: data || [] });
    set({ loading: false });
  },

  fetchCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_name');
    
    if (error) console.error('Error fetching categories:', error);
    else set({ categories: data || [] });
  },

  addItem: async (item) => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{ ...item, user_id: user.id }])
      .select();

    if (error) throw error;
    if (data) set({ items: [...get().items, data[0]].sort((a, b) => 
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    ) });
  },

  updateItem: async (id, updates) => {
    const { error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, ...updates } : i))
    });
  },

  deleteItem: async (id) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, items: [], categories: [] });
  }
}));
