export type Category = {
  id: string;
  user_id: string;
  category_name: string;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  quantity: string | null;
  expiry_date: string;
  fridge: boolean;
  consumed: boolean;
  wasted: boolean;
  notifications_enabled: boolean;
  created_at: string;
};

export type ExpiryStatus = 'fresh' | 'expiring' | 'expired';

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};
