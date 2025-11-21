import React from 'react';
import { JVMComponentData } from '../types';

interface MemoryBlockProps {
  data: JVMComponentData;
  isActive: boolean;
  isFlashing: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  heightClass?: string;
  widthClass?: string;
}

export const MemoryBlock: React.FC<MemoryBlockProps> = ({ 
  data, 
  isActive, 
  isFlashing, 
  onClick, 
  children, 
  heightClass = 'h-32',
  widthClass = 'w-full'
}) => {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`
        ${widthClass} ${heightClass}
        relative border-2 rounded-lg p-2 cursor-pointer transition-all duration-300
        flex flex-col
        ${isActive ? 'ring-4 ring-white shadow-2xl scale-[1.02]' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'}
        ${isFlashing ? 'animate-pulse bg-yellow-500 border-yellow-300 text-black' : `${data.color} text-white`}
      `}
    >
      <div className="font-bold text-sm md:text-base border-b border-white/20 pb-1 mb-2 flex justify-between items-center">
        <span>{data.name}</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
         {children}
      </div>
    </div>
  );
};