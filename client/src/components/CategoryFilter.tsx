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
              ? 'bg-blue-600 text-white flex-shrink-0 shadow-sm' 
              : 'bg-white hover:bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0'
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
