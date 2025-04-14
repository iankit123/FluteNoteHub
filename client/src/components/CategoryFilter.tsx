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
              ? 'bg-blue-500 text-white flex-shrink-0 shadow-sm border border-blue-100' 
              : 'bg-white hover:bg-blue-100 text-blue-600 border border-blue-100 flex-shrink-0'
          }
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
