import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import type { PageThemeId, PlacedSticker } from '../types/journal';

interface Props {
  theme: PageThemeId;
  stickers: PlacedSticker[];
  /** sticker layer element(s); positioned absolutely over the page */
  layer: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  contentClassName?: string;
  hideHoles?: boolean;
}

/** z-index scheme: back stickers < text (1000) < front stickers < selected sticker. */
export const TEXT_Z = 1000;
export const stickerZ = (s: PlacedSticker, selected = false) =>
  selected ? 5000 : s.layer === 'back' ? Math.min(Math.max(s.z, 1), 900) : 2000 + Math.min(s.z, 900);

/**
 * The shared journal page: paper texture, theme, binder holes and the stacking
 * context that lets stickers sit behind OR in front of the text.
 * Used by the editor, the preview and the home-screen collage.
 */
export const PaperPage = forwardRef<HTMLDivElement, Props>(function PaperPage(
  { theme, stickers, layer, children, className = '', style, contentClassName = '', hideHoles },
  ref,
) {
  // Keep the page at least tall enough to contain every sticker.
  const bottom = stickers.reduce((m, s) => Math.max(m, s.y + s.height + 0.04), 0);
  return (
    <div
      ref={ref}
      data-page
      data-theme={theme}
      className={`paper page-wrap theme-${theme} grid isolate ${className}`}
      style={style}
    >
      <div className="paper-bg" aria-hidden />
      {!hideHoles && <div className="holes" aria-hidden><i /><i /><i /></div>}
      <div aria-hidden style={{ gridArea: '1 / 1', height: `calc(${bottom} * 100cqw)`, pointerEvents: 'none' }} />
      <div
        className={`relative pointer-events-none flex min-w-0 flex-col ${contentClassName}`}
        style={{ gridArea: '1 / 1', zIndex: TEXT_Z }}
      >
        {children}
      </div>
      {layer}
    </div>
  );
});
