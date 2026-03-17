"use client";

import { useRef, useState, useEffect } from "react";
import { Smile } from "lucide-react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface EmojiTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export default function EmojiTextarea({
  value,
  onChange,
  placeholder = "Write something...",
  rows = 4,
  required,
  className = "",
}: EmojiTextareaProps) {
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<number>(0);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    const pos = caretRef.current;
    const newValue = value.slice(0, pos) + emojiData.emoji + value.slice(pos);
    onChange(newValue);
    // Restore caret after emoji insertion
    const newPos = pos + emojiData.emoji.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
        caretRef.current = newPos;
      }
    }, 0);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={() => {
          caretRef.current = textareaRef.current?.selectionStart ?? value.length;
        }}
        onClick={() => {
          caretRef.current = textareaRef.current?.selectionStart ?? value.length;
        }}
        onKeyUp={() => {
          caretRef.current = textareaRef.current?.selectionStart ?? value.length;
        }}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full px-4 py-3 pr-11 rounded-xl border border-dark-700 bg-dark-950 text-dark-50 text-sm placeholder-dark-500 focus:outline-none focus:border-brand-400 resize-none ${className}`}
      />

      {/* Emoji button */}
      <button
        type="button"
        onClick={() => {
          caretRef.current = textareaRef.current?.selectionStart ?? value.length;
          setShowPicker((v) => !v);
        }}
        className="absolute bottom-3 right-3 text-dark-500 hover:text-brand-500 transition-colors"
        title="Add emoji"
      >
        <Smile size={18} />
      </button>

      {/* Picker popover */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            skinTonesDisabled
            searchDisabled={false}
            height={380}
            width={320}
          />
        </div>
      )}
    </div>
  );
}
