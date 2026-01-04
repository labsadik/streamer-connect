import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Compass, 
  Upload, 
  User, 
  BookMarked,
  Settings,
  Bell,
  Menu,
  Search,
  Moon,
  Sun,
  Video,
  Rss,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import MobileSearchModal from "./MobileSearchModal";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      // Set default to light mode (false) instead of system preference
      return savedMode ? savedMode === 'true' : false;
    }
    return false;
  });

  // Toggle dark mode without coming soon popup
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (location.pathname !== '/') {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      } else if (onSearch) {
        onSearch(searchQuery);
      }
    }
  }, [searchQuery, location.pathname, navigate, onSearch]);

  const handleMobileSearch = useCallback((query: string) => {
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else if (onSearch) {
      onSearch(query);
    }
  }, [location.pathname, navigate, onSearch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Optimized effect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Optimized effect for real-time search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch && location.pathname === '/') {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch, location.pathname]);

  // Optimized effect for notifications
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('public:subscriptions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'subscriptions',
        filter: `channel_id=eq.${user.id}`
      }, (payload) => {
        console.log('New subscriber!', payload);
        setNotificationCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Navigation items with updated Feed icon
  // Removed comingSoon flags since we're connecting to actual pages
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/shorts", icon: Compass, label: "Shorts" },
    { to: "/feed", icon: Rss, label: "Feed" },
  ];

  const userNavItems = user ? [
    { to: "/upload", icon: Upload, label: "Upload" },
    { to: "/saved-videos", icon: BookMarked, label: "Library" },
  ] : [];

  // Mobile view
  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 z-50 border-b">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl">NoorCast</span>
                      </Link>
                    </div>
                    
                    <div className="flex-1 py-4 overflow-y-auto">
                      <nav className="space-y-1 px-3">
                        {[...navItems, ...userNavItems].map((item) => (
                          <SheetClose asChild key={item.to}>
                            <Link
                              to={item.to}
                              className={cn(
                                "flex items-center gap-6 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                                location.pathname === item.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                              )}
                            >
                              <item.icon className="h-5 w-5 flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </SheetClose>
                        ))}
                        
                        <div className="border-t my-4" />
                        
                        <div className="px-3 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Dark Mode</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleDarkMode}
                              className="h-8 w-8"
                            >
                              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </nav>
                    </div>
                    
                    {user && (
                      <div className="border-t p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={user.user_metadata?.avatar} />
                            <AvatarFallback>
                              {user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.user_metadata?.name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <SheetClose asChild>
                            <Link
                              to={`/profile/${user.id}`}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent"
                            >
                              <User className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Your channel</span>
                            </Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Link
                              to="/profile/settings"
                              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent"
                            >
                              <Settings className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">Settings</span>
                            </Link>
                          </SheetClose>
                          <Button
                            variant="ghost"
                            onClick={signOut}
                            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sm"
                          >
                            Sign out
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">NoorCast</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileSearchOpen(true)}
                className="h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Your channel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {!user && (
                <Button asChild size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
        
        <MobileSearchModal 
          isOpen={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
          onSearch={handleMobileSearch}
        />
      </>
    );
  }

  // Desktop view
  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 z-50 border-b">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 max-w-screen-2xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-fit">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">NoorCast</span>
          </Link>
          
          {/* Search Bar - Enhanced for real-time search */}
          <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Search videos, channels, or topics..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                />
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="rounded-l-none border-l-0 px-6 h-10 hover:bg-accent"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-1 sm:gap-2">
            <TooltipProvider>
              {/* Navigation Icons */}
              {[...navItems, ...userNavItems].map((item) => (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10",
                        location.pathname === item.to && "bg-accent text-accent-foreground"
                      )}
                      asChild
                    >
                      <Link to={item.to}>
                        <item.icon className="h-5 w-5" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              
              {/* Dark Mode Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-10 w-10">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isDarkMode ? "Light mode" : "Dark mode"}</p>
                </TooltipContent>
              </Tooltip>
              
              {user && (
                <>
                  {/* Notifications */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 relative"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/notifications');
                        }}
                      >
                        <Bell className="h-5 w-5" />
                        {notificationCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {notificationCount > 9 ? "9+" : notificationCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.user_metadata?.avatar} />
                          <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <div className="flex items-center gap-3 p-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar} />
                          <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {user.user_metadata?.name || user.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Your channel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile/settings" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              
              {!user && (
                <Button asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </TooltipProvider>
          </div>
        </div>
      </header>
    </>
  );
}