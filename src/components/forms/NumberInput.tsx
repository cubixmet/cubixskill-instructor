import React, { forwardRef } from 'react';
import { TextInput } from './TextInput';
import type { TextInputProps } from './TextInput';

export interface NumberInputProps extends Omit<TextInputProps, 'onChange'> {
  value?: number | string;
  onChange?: (val: number | undefined) => void;
  min?: number;
  max?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value = '', onChange, min, max, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') {
        if (onChange) onChange(undefined);
        return;
      }
      const num = Number(raw);
      if (!isNaN(num)) {
        if (min !== undefined && num < min) return;
        if (max !== undefined && num > max) return;
        if (onChange) onChange(num);
      }
    };

    return (
      <TextInput
        ref={ref}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';
