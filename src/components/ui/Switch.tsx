import React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  onChange,
  disabled = false,
  className = '',
  id,
}) => {
  const handleClick = () => {
    const nextState = !checked;
    if (onCheckedChange) onCheckedChange(nextState);
    if (onChange) onChange(nextState);
  };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB] ${
        checked ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-[#334155]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};
