import React, { forwardRef, useState } from 'react';
import { AlertCircle, Phone } from 'lucide-react';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  error?: boolean;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
];

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, countryCode = '+91', onCountryCodeChange, error, className = '', disabled, ...props }, ref) => {
    const [selectedCode, setSelectedCode] = useState(countryCode);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // STRICT DIGIT SANITIZATION: Completely removes letters, symbols, spaces
      const sanitizedDigits = e.target.value.replace(/[^\d]/g, '');
      if (onChange) {
        onChange(sanitizedDigits);
      }
    };

    const handleCodeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCode = e.target.value;
      setSelectedCode(newCode);
      if (onCountryCodeChange) {
        onCountryCodeChange(newCode);
      }
    };

    return (
      <div className="flex items-center gap-2 w-full font-sans">
        {/* Country Code Selector */}
        <select
          value={selectedCode}
          onChange={handleCodeSelect}
          disabled={disabled}
          className="h-[46px] sm:h-[48px] px-2.5 bg-white border border-[#E2E8F0] rounded-[12px] text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 shrink-0 cursor-pointer disabled:bg-[#F8FAFC] disabled:cursor-not-allowed"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>

        {/* Local Number Field */}
        <div className="relative w-full">
          <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder="98765 43210"
            maxLength={15}
            aria-invalid={Boolean(error)}
            className={`w-full h-[46px] sm:h-[48px] pl-10 pr-10 bg-white border rounded-[12px] text-sm font-normal text-[#0F172A] transition-all duration-150 focus:outline-none ${
              error
                ? 'border-rose-500 bg-rose-50/20 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                : 'border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
            } ${disabled ? 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed' : ''} ${className}`}
            {...props}
          />
          {error && <AlertCircle className="w-4.5 h-4.5 text-rose-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />}
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
