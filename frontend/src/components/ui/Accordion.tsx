// frontend/src/components/ui/Accordion.tsx

// Custom akordeono komponentas su sklandžiomis animacijomis
// Leidžia vartotojams išskleisti/suskleisti skirtingas sekcijas
// CHANGE: Sukurtas custom akordeono komponentas vietoj trečiųjų šalių bibliotekų
// CHANGE: Optimizuotas didesniam turiniui - padidintas max-height ir pridėtas geresnis overflow handling

import React, { createContext, useContext, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

// Akordeono kontekstas
interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

// Akordeono pagrindinis komponentas
interface AccordionProps {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: string[]; // Pagal nutylėjimą išskleistos sekcijos
}

export const Accordion: React.FC<AccordionProps> = ({ 
  children, 
  className,
  defaultOpen = []
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={clsx('space-y-2', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

// Akordeono elemento komponentas
interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  largeContent?: boolean; // CHANGE: Pridėtas prop didesniam turiniui tvarkyti
  titleClassName?: string; // CHANGE: Pridėtas prop custom title stiliui
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  title,
  children,
  icon,
  defaultOpen = false,
  className,
  largeContent = false,
  titleClassName
}) => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('AccordionItem must be used within Accordion');
  }

  const { openItems, toggleItem } = context;
  const isOpen = openItems.has(id);

  // Jei defaultOpen = true, automatiškai pridėti į atidarytus
  React.useEffect(() => {
    if (defaultOpen && !openItems.has(id)) {
      context.toggleItem(id);
    }
  }, [defaultOpen, id, context, openItems]);

  // CHANGE: Dinamiškai nustatomas max-height pagal turinio dydį
  const maxHeight = largeContent ? 'max-h-[2000px]' : 'max-h-96';

  return (
    <div className={clsx('border border-gray-200 rounded-lg bg-white', className)}>
      <button
        onClick={() => toggleItem(id)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-2">
          {icon && <span className="text-gray-600">{icon}</span>}
          <span className={clsx('font-medium text-gray-900', titleClassName)}>
            {title}
          </span>
        </div>
        <span className="text-gray-500 transition-transform duration-200">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      <div
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? `${maxHeight} opacity-100` : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Eksportuojame pagrindinius komponentus
export default Accordion;
