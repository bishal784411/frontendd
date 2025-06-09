'use client';

import { useAuth } from "@/lib/auth-context";
import { useNotificationStore } from '@/lib/notification-store';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Clock,
  FileText,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Building2,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  Calendar,
  Bell,
  KeyRound,
  Shield,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import PasswordChange from '@/components/auth/password-change';




interface NavigationProps {
  children: React.ReactNode;
}



export default function Navigation({ children }: NavigationProps) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (pathname === '/') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const roleName = user?.role?.name?.toLowerCase() || "";


  const adminLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/employees',
      label: 'Employees',
      icon: Users,
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: FolderKanban,
    },
    {
      href: '/admin/timesheets',
      label: 'Timesheets',
      icon: Clock,
    },
    {
      href: '/admin/leave',
      label: 'Leave Management',
      icon: Calendar,
    },
    // {
    //   href: '/calendar',
    //   label: 'Calendar',
    //   icon: CalendarDays,
    // },
    {
      href: '/reports',
      label: 'Reports',
      icon: FileText,
    },
    // {
    //   href: '/tickets',
    //   label: 'Tickets',
    //   icon: Ticket,
    // },
    {
      href: '/rbac',
      label: 'RBAC',
      icon: Shield,
    },
  ];

  const employeeLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/timesheet',
      label: 'My Timesheet',
      icon: Clock,
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: FolderKanban,
    },
    {
      href: '/leave',
      label: 'Leave',
      icon: Calendar,
    },
    // {
    //   href: '/calendar',
    //   label: 'Calendar',
    //   icon: CalendarDays,
    // },
    {
      href: '/reports',
      label: 'Weekly Reports',
      icon: FileText,
    },
    // {
    //   href: '/tickets',
    //   label: 'Support',
    //   icon: Ticket,
    // },
  ];

  const links = roleName === "admin" ? adminLinks : employeeLinks;

  const NavLinks = () => (
    <>
      <div className={cn(
        "flex flex-col items-center justify-center p-6 border-b border-gray-800 transition-all duration-500",
        isCollapsed ? "space-y-2" : "space-y-4"
      )}>
        <Avatar className={cn(
          "transition-all duration-500",
          isCollapsed ? "h-12 w-12" : "h-20 w-20"
        )}>
          {/* <AvatarImage src={user?.avatar} alt={user?.name} /> */}
          <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? undefined} />

          <AvatarFallback className={cn(
            "transition-all duration-500",
            isCollapsed ? "text-base" : "text-2xl"
          )}>
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "text-center transition-all duration-300 delay-200",
          isCollapsed ? "opacity-0 invisible absolute" : "opacity-100 visible relative"
        )}>
          <h3 className="font-medium text-lg text-white">{user?.name}</h3>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <div className="mt-2 text-sm text-gray-500">
            <p>{user?.position}</p>
            <p>{user?.department}</p>
          </div>
        </div>
      </div>
      <ul className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap overflow-hidden',
                  pathname === link.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "transition-opacity duration-300 delay-200",
                  isCollapsed ? "opacity-0 invisible absolute" : "opacity-100 visible relative"
                )}>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );

  const NotificationBell = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="space-y-4 max-h-[300px] overflow-auto">
          {notifications
            .filter(n => !n.targetUserId || n.targetUserId === user?.id)
            .slice(0, 5)
            .map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-3 rounded-lg cursor-pointer',
                  notification.read ? 'bg-muted/50' : 'bg-muted'
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <p className="font-medium">
                  {notification.message || (
                    `${notification.employeeName} submitted a ${notification.type === 'leave_request'
                      ? 'leave request'
                      : notification.type === 'ticket'
                        ? 'support ticket'
                        : 'weekly report'
                    }`
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(notification.timestamp), 'PPp')}
                </p>
              </div>
            ))}
          {notifications.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No notifications
            </p>
          )}
          {notifications.length > 5 && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/notifications')}
            >
              View All
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 px-4">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-gray-900">
                  <div className="flex flex-col h-full">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
            <h1 className="text-xl font-bold">HRMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* <AvatarImage src={user?.avatar} alt={user?.name} /> */}
                    <AvatarImage src={user?.avatar ?? undefined} alt={user?.name ?? undefined} />

                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPasswordChange(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {!isMobile && (
        <nav
          className={cn(
            "fixed top-16 left-0 bottom-0 bg-gray-900 text-white transition-all duration-500",
            isCollapsed ? "w-24" : "w-80"
          )}
        >
          <div className="flex flex-col h-full">
            <NavLinks />
          </div>
        </nav>
      )}

      <main
        className={cn(
          "flex-1 pt-16 transition-all duration-500",
          !isMobile && (isCollapsed ? "ml-24" : "ml-80")
        )}
      >
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      <PasswordChange
        isOpen={showPasswordChange}
        onClose={() => setShowPasswordChange(false)}
        email={user?.email || ''}
      />
    </div>
  );
}


