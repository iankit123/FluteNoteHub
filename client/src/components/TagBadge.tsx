import React from 'react';
import { cn } from '@/lib/utils';
import { TagBadgeProps } from '@/types';

const getCategoryStyle = (category: string) => {
  switch (category.toLowerCase()) {
    case 'level':
      return {
        bg: 'bg-[#F9A825]/10 hover:bg-[#F9A825]/20',
        text: 'text-dark-slate',
        activeBg: 'bg-[#F9A825]',
        activeText: 'text-dark-slate',
      };
    case 'technique':
      return {
        bg: 'bg-[#005F73]/10 hover:bg-[#005F73]/20',
        text: 'text-[#005F73]',
        activeBg: 'bg-[#005F73]',
        activeText: 'text-white',
      };
    case 'genre':
      return {
        bg: 'bg-[#F76C6C]/10 hover:bg-[#F76C6C]/20',
        text: 'text-[#F76C6C]',
        activeBg: 'bg-[#F76C6C]',
        activeText: 'text-white',
      };
    default:
      return {
        bg: 'bg-[#6C3FC9]/10 hover:bg-[#6C3FC9]/20',
        text: 'text-[#6C3FC9]',
        activeBg: 'bg-[#6C3FC9]',
        activeText: 'text-white',
      };
  }
};

const TagBadge: React.FC<TagBadgeProps> = ({ tag, size = 'md', onClick }) => {
  const style = getCategoryStyle(tag.category);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1',
  };
  
  const isClickable = !!onClick;
  
  return (
    <span 
      className={cn(
        'inline-block rounded-full font-medium transition-colors',
        style.bg,
        style.text,
        sizeClasses[size],
        isClickable && 'cursor-pointer hover:shadow-sm'
      )}
      onClick={onClick}
    >
      {tag.name}
    </span>
  );
};

export default TagBadge;
