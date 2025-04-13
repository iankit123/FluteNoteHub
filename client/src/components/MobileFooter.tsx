import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, BookOpen, Compass, MessageSquare, User } from 'lucide-react';

const MobileFooter: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    { name: 'Home', icon: <Home className="h-5 w-5" />, href: '/' },
    { name: 'Library', icon: <BookOpen className="h-5 w-5" />, href: '/library' },
    { name: 'Explore', icon: <Compass className="h-5 w-5" />, href: '/explore' },
    { name: 'Discuss', icon: <MessageSquare className="h-5 w-5" />, href: '/community' },
    { name: 'Profile', icon: <User className="h-5 w-5" />, href: '/profile' },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-100">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <a className={`flex flex-col items-center p-2 ${isActive(item.href) ? 'text-royal-purple' : 'text-dark-slate/60 hover:text-royal-purple'} transition-colors`}>
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </footer>
  );
};

export default MobileFooter;
