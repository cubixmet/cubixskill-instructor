import { forwardRef } from 'react';
import { Mail } from 'lucide-react';
import { TextInput } from './TextInput';
import type { TextInputProps } from './TextInput';

export const EmailInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      type="email"
      inputMode="email"
      autoComplete="email"
      placeholder="e.g. alex.smith@example.com"
      leftIcon={<Mail className="w-4 h-4 text-[#64748B]" />}
      {...props}
    />
  );
});

EmailInput.displayName = 'EmailInput';
