import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
  hideClose?: boolean;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Accessible dialog: Esc closes, Tab stays inside, focus returns to the trigger. */
export function Modal({ title, onClose, children, footer, size = 'md', hideClose }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node?.querySelector<HTMLElement>('[data-autofocus]')?.focus() ?? node?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); previous?.focus?.(); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
        className={`relative w-full ${size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-xl'} max-h-[92vh] overflow-y-auto scroll-thin
                    rounded-t-[28px] sm:rounded-[28px] bg-cream-paper border border-blush-200 shadow-paper p-6 sm:p-8 animate-rise`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl leading-tight text-ink">{title}</h2>
          {!hideClose && (
            <button className="icon-btn -mr-2 -mt-1" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
          )}
        </div>
        <div className="mt-4">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmProps {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  /** optional third action, e.g. "Discard changes" */
  extra?: { label: string; onClick: () => void };
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Cancel', tone = 'primary', onConfirm, onCancel, extra }: ConfirmProps) {
  return (
    <Modal
      title={title} onClose={onCancel} size="sm"
      footer={
        <>
          <button className="btn-soft" onClick={onCancel} data-autofocus>{cancelLabel}</button>
          {extra && <button className="btn-soft" onClick={extra.onClick}>{extra.label}</button>}
          <button className={tone === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <div className="text-[15px] leading-relaxed text-ink-soft">{message}</div>
    </Modal>
  );
}
