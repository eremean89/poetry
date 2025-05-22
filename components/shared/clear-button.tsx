import { X } from 'lucide-react';
import React from 'react';

interface Props {
  onClick?: VoidFunction;
}

export const ClearButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-transparent border-none cursor-pointer bg-transparent text-red-400 hover:text-red-600">
      <X className="h-5 w-5" />
    </button>
  );
};
