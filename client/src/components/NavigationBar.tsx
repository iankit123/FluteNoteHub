import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';

const NavigationBar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', icon: <Home className="h-4 w-4 mr-1" />, href: '/' },
    { name: 'My Library', icon: <BookOpen className="h-4 w-4 mr-1" />, href: '/library' },
    { name: 'Explore', icon: <Compass className="h-4 w-4 mr-1" />, href: '/explore' },
    { name: 'Discussions', icon: <MessageSquare className="h-4 w-4 mr-1" />, href: '/community' },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      <nav className="nav-gradient sticky top-0 z-50 text-ivory-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 mr-6">
            <Link href="/" className="flex items-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8H17C19 8 20 9 20 11V13C20 15 19 16 17 16H12V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8C12 5 11 4 8 4H7C4 4 3 5 3 8V16C3 19 4 20 7 20H8C11 20 12 19 12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
            <div className="block md:hidden mr-2">
              <button 
                onClick={toggleMobileMenu}
                className="flex items-center text-ivory-white hover:opacity-80"
              >
                <Menu className="h-6 w-6" />
              </button>
              <button 
                onClick={toggleMobileSearch}
                className="flex items-center text-ivory-white hover:opacity-80 ml-2"
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
            
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
        
        {/* Mobile Search (Slide Down) */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative rounded-full overflow-hidden bg-white/30 focus-within:shadow-glow transition-shadow duration-300">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full py-2 pl-4 pr-10 text-dark-slate bg-transparent outline-none" 
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-deep-teal">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Mobile Menu (Slide Down) */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-3 bg-royal-purple/90">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`font-medium py-2 hover:text-turmeric-yellow transition-colors flex items-center ${isActive(item.href) ? 'text-turmeric-yellow' : ''}`} 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 mr-2" })}
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/profile" 
                    className="font-medium py-2 hover:text-turmeric-yellow transition-colors flex items-center" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Profile
                  </Link>
                  <button 
                    className="font-medium py-2 hover:text-turmeric-yellow transition-colors flex items-center" 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Log out
                  </button>
                </>
              ) : (
                <Link 
                  href="/login"
                  className="font-medium py-2 hover:text-turmeric-yellow transition-colors flex items-center" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Log in
                </Link>
              )}
            </div>
          </div>
        )}
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
