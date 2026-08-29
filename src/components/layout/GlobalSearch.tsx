import React, { useState, useEffect } from 'react';
import { Search, Command, X, ArrowRight, User, FileText, Utensils, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MASTER_NAVIGATION } from '../../config/navigation';

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut listener Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = query.trim() === ''
    ? []
    : MASTER_NAVIGATION.flatMap((mod) => {
        const matchesMod = mod.name.toLowerCase().includes(query.toLowerCase()) || mod.description.toLowerCase().includes(query.toLowerCase());
        const subMatches = (mod.submodules || []).filter(
          (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase())
        );

        const results = [];
        if (matchesMod) {
          results.push({
            title: mod.name,
            subtitle: mod.description,
            path: mod.path,
            module: mod.name,
          });
        }
        subMatches.forEach((s) => {
          results.push({
            title: `${mod.name} › ${s.name}`,
            subtitle: s.description,
            path: `${mod.path}?sub=${s.subParam}`,
            module: mod.name,
          });
        });
        return results;
      });

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl bg-[#1E2438] hover:bg-[#283049] text-gray-400 hover:text-gray-200 border border-[#2D374E] text-xs transition-all w-36 sm:w-56 md:w-64 cursor-pointer"
        title="Cari modul, SOP, karyawan, atau reservasi (Ctrl+K)"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate">Pencarian cepat...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#111827] text-[10px] text-gray-400 border border-[#2D374E]">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-[#1E2438] border border-[#2D374E] p-4 shadow-2xl space-y-4 animate-fade-in">
            {/* Input Bar */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#111827] border border-[#2D374E]">
              <Search className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari fitur, menu, karyawan, SOP, atau reservasi..."
                className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results or Suggestions */}
            <div className="max-h-80 overflow-y-auto space-y-1.5 custom-scrollbar">
              {query.trim() === '' ? (
                <div className="p-4 text-center space-y-2">
                  <span className="text-xs text-gray-400 block">Saran Pencarian Cepat:</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['Presensi', 'Checklist Kitchen', 'Kalkulator HPP', 'WhatsApp Chat', 'SOP Pelayanan'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-2.5 py-1 rounded-lg text-xs bg-[#111827] text-purple-300 border border-[#2D374E] hover:border-purple-500/40 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  Tidak ditemukan hasil untuk "{query}".
                </div>
              ) : (
                searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      navigate(res.path);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#111827]/60 hover:bg-[#111827] border border-[#2D374E] hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-gray-100 group-hover:text-purple-300 transition-colors">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-gray-400 line-clamp-1">{res.subtitle}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
