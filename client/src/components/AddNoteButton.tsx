import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AddNoteButton: React.FC = () => {
  return (
    <div className="fixed bottom-24 right-6 z-20 md:bottom-8">
      <Link href="/tutorials/new">
        <Button 
          className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center pulse-animation p-0"
          aria-label="Add new tutorial or note"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
};

export default AddNoteButton;
