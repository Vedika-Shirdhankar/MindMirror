import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Tone = 'success' | 'error';
interface ToastMsg { id: number; text: string; tone: Tone }
const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([]);
  const n = useRef(0);
  const show = useCallback((text: string, tone: Tone = 'success') => {
    const id = ++n.current;
    setItems((p) => [...p.slice(-2), { id, text, tone }]);
    window.setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), tone === 'error' ? 6000 : 3200);
  }, []);
  useEffect(() => () => { n.current = 0; }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[120] flex flex-col items-center gap-2 px-4 lg:bottom-8" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2.5 rounded-full px-5 py-3 text-[15px] font-semibold shadow-paper animate-pop
            ${t.tone === 'error' ? 'bg-[#FBE3E4] text-[#8d2f2f] border border-[#EBA9AE]' : 'bg-ink text-cream'}`}>
            {t.tone === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} className="text-sage-200" />}
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
