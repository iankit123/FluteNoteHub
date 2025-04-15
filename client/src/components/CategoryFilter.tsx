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
              ? 'bg-royal-purple text-white flex-shrink-0 shadow-sm border border-royal-purple/20 font-medium' 
              : 'bg-white hover:bg-royal-purple/10 text-royal-purple border border-royal-purple/20 flex-shrink-0 font-medium'
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
