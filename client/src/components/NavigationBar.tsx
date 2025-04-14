import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useUser } from '@/context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  BookOpen, 
  Compass, 
  MessageSquare, 
  User, 
  LogOut, 
  Menu, 
  Search,
  Settings,
  Clock,
  Palette
} from 'lucide-react';
import GradientSelector from './GradientSelector';

const NavigationBar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [currentGradient, setCurrentGradient] = useState('nav-gradient-option1');
  const [showGradientSelector, setShowGradientSelector] = useState(false);

  // Load the saved gradient preference or use the default
  useEffect(() => {
    const savedGradient = localStorage.getItem('navGradientPreference');
    if (savedGradient) {
      setCurrentGradient(savedGradient);
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleGradientChange = (gradientClass: string) => {
    setCurrentGradient(gradientClass);
    localStorage.setItem('navGradientPreference', gradientClass);
  };

  const navItems = [
    { name: 'Home', icon: <Home className="h-4 w-4 mr-1" />, href: '/' },
    { name: 'Explore', icon: <Compass className="h-4 w-4 mr-1" />, href: '/explore' },
    { name: 'Discussions', icon: <MessageSquare className="h-4 w-4 mr-1" />, href: '/community' },
    { name: 'Metronome', icon: <Clock className="h-4 w-4 mr-1" />, href: '/metronome' },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Gradient Selector UI */}
      {showGradientSelector && (
        <div id="gradient-selector-container" className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <GradientSelector 
            onSelect={handleGradientChange}
            currentGradient={currentGradient}
          />
        </div>
      )}
      
      <nav className={`${currentGradient} sticky top-0 z-50 text-ivory-white shadow-md`}>
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 mr-6">
            <Link href="/" className="flex items-center">
              <div className="relative flex items-center justify-center bg-white rounded-full h-9 w-9 mr-2 shadow-md">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M4 2L19 17M4 2L4 20M4 20L6 20M7.5 4.5L7.5 17.5M11 7L11 14M14.5 9.5L14.5 12.5M18 12L18 13" 
                    stroke="url(#gradient)" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M19 17L21 19.5C21 19.5 20 22 18 21C16 20 19 17 19 17Z" 
                    stroke="url(#gradient)" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M19 17L17 19.5C17 19.5 18 22 20 21C22 20 19 17 19 17Z" 
                    stroke="url(#gradient)" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00D2FF" />
                      <stop offset="0.5" stopColor="#7366FF" />
                      <stop offset="1" stopColor="#9C3FED" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-poppins font-bold text-xl tracking-tight">FluteNotes</span>
            </Link>
          </div>
          
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block mx-4 flex-grow max-w-md">
            <div className="relative glassmorphism rounded-full overflow-hidden focus-within:shadow-glow transition-shadow duration-300">
              <input 
                type="text" 
                placeholder="Search for tutorials, notes, or tags..." 
                className="w-full py-2 pl-4 pr-10 text-dark-slate bg-transparent outline-none" 
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-deep-teal">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Main Navigation */}
          <div className="flex items-center">
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`font-medium hover:text-turmeric-yellow transition-colors flex items-center ${isActive(item.href) ? 'text-turmeric-yellow' : ''}`}
                >
                  {item.icon} {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowGradientSelector(!showGradientSelector)}
                    className="mr-4 p-2 hover:text-turmeric-yellow transition-colors rounded-full bg-royal-purple/30"
                    title="Change navigation colors"
                  >
                    <Palette className="h-5 w-5" />
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="font-medium hover:text-turmeric-yellow transition-colors p-1 rounded-full bg-royal-purple/30">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar || ""} alt={user?.displayName} />
                          <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center p-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user?.avatar || ""} alt={user?.displayName} />
                          <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{user?.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{user?.username}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/login" className="font-medium">
                  <Button variant="ghost" size="sm" className="text-ivory-white hover:bg-white/20">
                    Log in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

      </nav>
      
      {/* Mobile Navigation Footer */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-100">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center p-2 ${isActive(item.href) ? 'text-royal-purple' : 'text-dark-slate/60 hover:text-royal-purple'} transition-colors`}
            >
              {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5" })}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          
          <Link 
            href="/profile"
            className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-royal-purple' : 'text-dark-slate/60 hover:text-royal-purple'} transition-colors`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </footer>
    </>
  );
};

export default NavigationBar;