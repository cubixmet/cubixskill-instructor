import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link2,
  Heading1,
  Heading2,
  RotateCcw,
  RotateCw,
  X,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
  name?: string;
}

// Convert legacy markdown string to basic HTML if needed
const markdownToHtml = (text: string): string => {
  if (!text) return '';

  // If already HTML, return directly
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  let html = text;
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/<ins>(.*?)<\/ins>/g, '<u>$1</u>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Lists
  html = html.replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, ''); // merge adjacent

  html = html.replace(/^[0-9]+\. (.*$)/gim, '<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\s*<ol>/g, ''); // merge adjacent

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Line breaks to paragraphs
  const paragraphs = html.split('\n\n').map((p) => (p.trim() ? `<p>${p.trim()}</p>` : ''));
  return paragraphs.join('') || html;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write a detailed course description...',
  minHeight = 'min-h-[260px]',
  error,
  name,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // Formatting active states
  const [activeState, setActiveState] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    bulletList: false,
    numberList: false,
    quote: false,
    link: false,
  });

  // Link Popover state
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Update editor innerHTML when `value` prop changes externally
  useEffect(() => {
    if (editorRef.current) {
      const formattedHtml = markdownToHtml(value || '');
      if (editorRef.current.innerHTML !== formattedHtml) {
        editorRef.current.innerHTML = formattedHtml;
      }
    }
  }, [value]);

  // Check active formatting state based on current DOM selection
  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return;

    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isBulletList = document.queryCommandState('insertUnorderedList');
      const isNumberList = document.queryCommandState('insertOrderedList');

      const formatBlock = document.queryCommandValue('formatBlock').toLowerCase();
      const isH1 = formatBlock === 'h1';
      const isH2 = formatBlock === 'h2';
      const isQuote = formatBlock === 'blockquote';

      // Check if cursor is inside <a> element
      const selection = window.getSelection();
      let isLink = false;
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).startContainer;
        while (node && node !== editorRef.current) {
          if (node.nodeName === 'A') {
            isLink = true;
            break;
          }
          node = node.parentNode;
        }
      }

      setActiveState({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        h1: isH1,
        h2: isH2,
        bulletList: isBulletList,
        numberList: isNumberList,
        quote: isQuote,
        link: isLink,
      });
    } catch (_) {
      // Fallback
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      onChange(currentHtml);
      updateActiveStates();
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleFormatBlock = (tag: string, isActive: boolean) => {
    if (isActive) {
      executeCommand('formatBlock', '<p>');
    } else {
      executeCommand('formatBlock', `<${tag}>`);
    }
  };

  // Link Handling
  const openLinkPopover = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();

      let node: Node | null = selection.getRangeAt(0).startContainer;
      let existingHref = '';
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'A') {
          existingHref = (node as HTMLAnchorElement).href || '';
          break;
        }
        node = node.parentNode;
      }
      setLinkUrl(existingHref || '');
    }
    setIsLinkPopoverOpen(true);
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
  };

  const applyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();

    if (linkUrl.trim()) {
      let finalUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl) && !finalUrl.startsWith('/')) {
        finalUrl = `https://${finalUrl}`;
      }
      document.execCommand('createLink', false, finalUrl);
    } else {
      document.execCommand('unlink', false);
    }

    handleInput();
    setIsLinkPopoverOpen(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();
    document.execCommand('unlink', false);
    handleInput();
    setIsLinkPopoverOpen(false);
    setLinkUrl('');
  };

  return (
    <div className="space-y-1 font-sans text-left" data-field-name={name}>
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: error ? '#EF4444' : 'var(--border)',
        }}
        className="border rounded-xl overflow-hidden shadow-2xs text-left relative transition-all focus-within:border-[var(--brand-primary)]"
      >
        {/* Editor Toolbar */}
        <div
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="border-b p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar select-none"
        >
          {/* Headings */}
          <button
            type="button"
            onClick={() => handleFormatBlock('h1', activeState.h1)}
            style={{
              backgroundColor: activeState.h1 ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.h1 ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleFormatBlock('h2', activeState.h2)}
            style={{
              backgroundColor: activeState.h2 ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.h2 ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <span style={{ backgroundColor: 'var(--border)' }} className="h-4 w-[1px] mx-0.5 shrink-0" />

          {/* Basic formatting */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            style={{
              backgroundColor: activeState.bold ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.bold ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('italic')}
            style={{
              backgroundColor: activeState.italic ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.italic ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('underline')}
            style={{
              backgroundColor: activeState.underline ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.underline ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span style={{ backgroundColor: 'var(--border)' }} className="h-4 w-[1px] mx-0.5 shrink-0" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            style={{
              backgroundColor: activeState.bulletList ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.bulletList ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            style={{
              backgroundColor: activeState.numberList ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.numberList ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span style={{ backgroundColor: 'var(--border)' }} className="h-4 w-[1px] mx-0.5 shrink-0" />

          {/* Quote & Link */}
          <button
            type="button"
            onClick={() => handleFormatBlock('blockquote', activeState.quote)}
            style={{
              backgroundColor: activeState.quote ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.quote ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={openLinkPopover}
            style={{
              backgroundColor: activeState.link ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'transparent',
              color: activeState.link ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
            className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] shrink-0"
            title="Insert or Edit Link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>

          <span style={{ backgroundColor: 'var(--border)' }} className="h-4 w-[1px] mx-0.5 shrink-0" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            style={{ color: 'var(--text-secondary)' }}
            className="p-1.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('redo')}
            style={{ color: 'var(--text-secondary)' }}
            className="p-1.5 hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Link Input Popover */}
        {isLinkPopoverOpen && (
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            className="absolute top-11 left-3 z-30 border rounded-xl shadow-xl p-3 space-y-2.5 w-72 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-primary)' }} className="text-xs font-semibold">
                Insert Link
              </span>
              <button
                type="button"
                onClick={() => setIsLinkPopoverOpen(false)}
                style={{ color: 'var(--text-muted)' }}
                className="p-1 hover:text-[var(--text-primary)] rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={applyLink} className="space-y-2">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--text-primary)',
                }}
                className="w-full h-8 px-2.5 border rounded-lg text-xs font-medium focus:outline-none focus:border-[var(--brand-primary)]"
                autoFocus
              />

              <div className="flex items-center justify-between pt-1">
                {linkUrl && (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsLinkPopoverOpen(false)}
                    style={{ color: 'var(--text-muted)' }}
                    className="px-2.5 py-1 text-[11px] font-semibold hover:bg-[var(--surface-hover)] rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: 'var(--brand-primary)',
                      color: 'var(--brand-primary-foreground, #FFFFFF)',
                    }}
                    className="px-3 py-1 text-[11px] font-semibold rounded-lg hover:opacity-90 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Editable Content Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          onFocus={updateActiveStates}
          aria-invalid={Boolean(error)}
          aria-describedby={error && name ? `${name}-error` : undefined}
          placeholder={placeholder}
          style={{
            backgroundColor: 'var(--surface-secondary)',
            color: 'var(--text-primary)',
          }}
          className={`w-full p-3 sm:p-4 text-xs sm:text-sm leading-relaxed focus:outline-none overflow-y-auto no-scrollbar ${minHeight} [&:empty]:before:content-[attr(placeholder)] [&:empty]:before:text-[var(--text-muted)] [&:empty]:before:pointer-events-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-[var(--text-primary)] [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] [&_h2]:mt-2 [&_h2]:mb-1 [&_p]:text-[var(--text-secondary)] [&_li]:text-[var(--text-secondary)] [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--brand-primary)] [&_blockquote]:pl-3 [&_blockquote]:py-1 [&_blockquote]:text-[var(--text-secondary)] [&_blockquote]:italic [&_blockquote]:bg-[var(--surface)] [&_blockquote]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:my-1.5 [&_a]:text-[var(--brand-primary)] [&_a]:underline [&_a]:font-semibold`}
        />
      </div>

      {error && (
        <p id={name ? `${name}-error` : undefined} className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
