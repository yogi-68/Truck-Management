"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  BarChart3, 
  Settings,
  Users,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trips', href: '/trips', icon: Truck },
  { name: 'GC Notes', href: '/gc-notes', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Master Data', href: '/master', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', authUser.id)
          .single();

        if (userData) {
          setUser({
            name: userData.full_name || 'User',
            email: userData.email || authUser.email || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Truck className="h-8 w-8 mr-2" />
        <span className="text-xl font-bold">Truck Manager</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-800 p-4 space-y-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : (
              <>
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
              </>
            )}
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full justify-start text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
