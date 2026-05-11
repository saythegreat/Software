import { useStore } from '../../store/useStore';
import { Button } from '../ui/Button';
import { LogOut, Bell, User, Settings } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useStore();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#1e1e1c]/80 backdrop-blur-md border-bottom border-gray-100 dark:border-white/5 py-4 px-6">
      <div className="container mx-auto flex items-center justify-between max-w-5xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-green to-brand-green-dark bg-clip-text text-transparent">
            FreshTrack
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1e1e1c]"></span>
          </Button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-white/5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-9 h-9 bg-brand-bg-green text-brand-text-green rounded-full flex items-center justify-center font-bold border border-brand-green/20">
              {user?.email?.[0].toUpperCase()}
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} title="Logout">
              <LogOut className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
