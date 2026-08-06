import React from 'react';

interface FieldHelperTextProps {
  children?: React.ReactNode;
  id?: string;
}

export const FieldHelperText: React.FC<FieldHelperTextProps> = ({ children, id }) => {
  if (!children) return null;

  return (
    <p id={id} className="text-[#64748B] text-[12px] font-normal pt-1">
      {children}
    </p>
  );
};
