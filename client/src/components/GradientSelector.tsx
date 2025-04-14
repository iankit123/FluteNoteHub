import React from 'react';
import { X } from 'lucide-react';

interface GradientSelectorProps {
  onSelect: (gradientClass: string) => void;
  currentGradient: string;
}

const GradientSelector: React.FC<GradientSelectorProps> = ({ onSelect, currentGradient }) => {
  const gradientOptions = [
    { 
      id: 'nav-gradient-option1', 
      name: 'Royal Shine', 
      description: 'Royal purple with golden accents'
    },
    { 
      id: 'nav-gradient-option2', 
      name: 'Purple Dusk', 
      description: 'Deep purple to midnight blue transition'
    },
    { 
      id: 'nav-gradient-option3', 
      name: 'Golden Melody', 
      description: 'Turmeric yellow to warm amber'
    },
    { 
      id: 'nav-gradient-option4', 
      name: 'Violet Harmony', 
      description: 'Soft violet to purple blend'
    },
    { 
      id: 'nav-gradient-option5', 
      name: 'Royal Elegance', 
      description: 'Royal purple to deep indigo'
    }
  ];

  const closeSelector = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'gradient-selector-container') {
      const container = document.getElementById('gradient-selector-container');
      if (container) {
        container.classList.add('fade-out');
        setTimeout(() => {
          // The parent component will handle this by checking the showGradientSelector state
        }, 300);
      }
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative z-[101] animate-in fade-in zoom-in duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Choose Navigation Style</h3>
        <button 
          onClick={() => onSelect(currentGradient)} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-gray-600 mb-6">
        Select a color scheme for the navigation bar that matches your preference.
      </p>
      
      <div className="grid grid-cols-1 gap-4">
        {gradientOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              flex flex-col h-16 rounded-md transition-all duration-300
              ${option.id} text-white p-4 relative
              ${currentGradient === option.id ? 'ring-2 ring-offset-2 ring-royal-purple scale-[1.02]' : 'hover:scale-[1.01]'}
            `}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{option.name}</span>
              {currentGradient === option.id && (
                <span className="bg-white text-royal-purple text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <span className="text-xs opacity-90 mt-1">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GradientSelector;