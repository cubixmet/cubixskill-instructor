import React, { useRef } from 'react';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  length = 6,
  error,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, '').split('').slice(0, length);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) {
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }
    const lastChar = val[val.length - 1];
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    onChange(newDigits.join(''));

    if (index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-[13px] sm:text-[14px] font-medium text-[#475569] dark:text-[#CBD5E1] text-left">
        Verification Code (OTP)
      </label>
      <div className="grid grid-cols-6 gap-2 w-full">
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[idx] || ''}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            className={`w-full min-w-0 h-12 text-center text-lg font-semibold rounded-[10px] bg-[#FFFFFF] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border transition-all duration-200 focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/10 ${
              error
                ? 'border-rose-500 dark:border-rose-500/80 bg-rose-50/20 dark:bg-rose-900/10'
                : 'border-[#CBD5E1] dark:border-[#334155]'
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="text-[12px] font-medium text-rose-600 dark:text-rose-400 text-left mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
