import React from 'react';

interface FieldHelperTextProps {
  children?: React.ReactNode;
  id?: string;
}

export const FieldHelperText: React.FC<FieldHelperTextProps> = ({ children, id }) => {
  if (!children) return null;

  return (
    <p id={id} className="text-[#64748B] dark:text-[#94A3B8] text-[12px] font-normal pt-1">
      {children}
    </p>
  );
};
