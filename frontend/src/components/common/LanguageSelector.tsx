import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, Language, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'mobile' | 'footer' | 'pill';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className={`p-2 space-y-1.5 ${className}`}>
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          Language / भाषा / भाषा निवडा
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((opt) => (
            <button
              key={opt.code}
              onClick={() => handleSelect(opt.code)}
              className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                language === opt.code
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm shadow-emerald-700/20'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200/80 border border-gray-200/60 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        aria-expanded={isOpen}
        title="Select Language / भाषा चुनें"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-700" />
        <span className="hidden sm:inline">{currentOption.nativeName}</span>
        <span className="sm:hidden">{currentOption.flag}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((opt) => (
            <button
              key={opt.code}
              onClick={() => handleSelect(opt.code)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition hover:bg-emerald-50/70 ${
                language === opt.code ? 'text-emerald-800 font-bold bg-emerald-50/40' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{opt.flag}</span>
                <div>
                  <div className="text-xs">{opt.nativeName}</div>
                  <div className="text-[10px] text-gray-400 font-normal">{opt.name}</div>
                </div>
              </div>
              {language === opt.code && <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
