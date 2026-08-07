import { forwardRef } from 'react';
import { Globe, Video, ExternalLink, Code } from 'lucide-react';
import { TextInput } from './TextInput';
import type { TextInputProps } from './TextInput';

export const UrlInput = forwardRef<HTMLInputElement, TextInputProps>(({ value, ...props }, ref) => {
  const val = String(value || '');

  const getProviderBadge = (url: string) => {
    if (!url || !url.startsWith('http')) return null;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return { name: 'YouTube Video', icon: Video, color: 'text-red-600 bg-red-50' };
    }
    if (url.includes('vimeo.com')) {
      return { name: 'Vimeo Stream', icon: Video, color: 'text-sky-600 bg-sky-50' };
    }
    if (url.includes('github.com')) {
      return { name: 'GitHub Repo', icon: Code, color: 'text-slate-800 bg-slate-100' };
    }
    return { name: 'External Web URL', icon: ExternalLink, color: 'text-[#2563EB] bg-blue-50' };
  };

  const provider = getProviderBadge(val);

  return (
    <div className="space-y-1 w-full font-sans">
      <TextInput
        ref={ref}
        type="url"
        inputMode="url"
        value={value}
        placeholder="https://example.com/resource"
        leftIcon={<Globe className="w-4 h-4 text-[#64748B]" />}
        {...props}
      />
      {provider && (
        <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold">
          <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${provider.color}`}>
            <provider.icon className="w-3 h-3" />
            <span>{provider.name} Detected</span>
          </span>
        </div>
      )}
    </div>
  );
});

UrlInput.displayName = 'UrlInput';
