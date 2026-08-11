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
  minHeight = 'min-h-[150px]',
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

  // Update editor innerHTML when `value` prop changes externally (e.g. Draft Resume)
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

      // Check existing link URL
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
        className={`border rounded-xl overflow-hidden bg-white shadow-2xs text-left relative focus-within:border-[#2563EB] transition-all ${
          error ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#E2E8F0]'
        }`}
      >
        {/* Editor Toolbar */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar text-[#64748B] select-none">
          {/* Headings */}
          <button
            type="button"
            onClick={() => handleFormatBlock('h1', activeState.h1)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
              activeState.h1
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleFormatBlock('h2', activeState.h2)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
              activeState.h2
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5 shrink-0" />

          {/* Basic formatting */}
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.bold
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.italic
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.underline
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5 shrink-0" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.bulletList
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.numberList
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5 shrink-0" />

          {/* Quote & Link */}
          <button
            type="button"
            onClick={() => handleFormatBlock('blockquote', activeState.quote)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.quote
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={openLinkPopover}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              activeState.link
                ? 'bg-blue-100 text-[#2563EB] border border-blue-200'
                : 'hover:bg-slate-200 hover:text-[#0F172A]'
            }`}
            title="Insert or Edit Link"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>

          <span className="h-4 w-[1px] bg-[#E2E8F0] mx-0.5 shrink-0" />

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-1.5 hover:bg-slate-200 hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-1.5 hover:bg-slate-200 hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
            title="Redo"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Link Input Popover */}
        {isLinkPopoverOpen && (
          <div className="absolute top-11 left-3 z-30 bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-3 space-y-2.5 w-72 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0F172A]">Insert Link</span>
              <button
                type="button"
                onClick={() => setIsLinkPopoverOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
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
                className="w-full h-8 px-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
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
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#64748B] hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-[11px] font-semibold bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] cursor-pointer flex items-center gap-1"
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
          className={`w-full p-3 sm:p-4 text-xs sm:text-sm text-[#0F172A] leading-relaxed focus:outline-none overflow-y-auto no-scrollbar ${minHeight} [&:empty]:before:content-[attr(placeholder)] [&:empty]:before:text-slate-400 [&:empty]:before:pointer-events-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-[#0F172A] [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-[#0F172A] [&_h2]:mt-2 [&_h2]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-[#2563EB] [&_blockquote]:pl-3 [&_blockquote]:py-1 [&_blockquote]:text-slate-600 [&_blockquote]:italic [&_blockquote]:bg-slate-50 [&_blockquote]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_ol]:my-1.5 [&_a]:text-[#2563EB] [&_a]:underline [&_a]:font-semibold`}
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
