import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 no-scrollbar">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category)}
          className={
            activeCategory === category 
              ? 'bg-royal-purple text-ivory-white flex-shrink-0' 
              : 'bg-ivory-white hover:bg-royal-purple/10 text-dark-slate flex-shrink-0'
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
