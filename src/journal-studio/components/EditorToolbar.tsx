import { useState, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Eye, EyeOff, Heading2, Heart, Highlighter, Italic, List, ListOrdered,
  Loader2, Maximize2, Mic, MicOff, Palette, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2,
} from 'lucide-react';

const TEXT_COLORS = [
  { name: 'Ink', value: '' },
  { name: 'Rose', value: '#B94A6A' },
  { name: 'Plum', value: '#6B4E97' },
  { name: 'Moss', value: '#4A6B3E' },
  { name: 'Sky', value: '#43628A' },
];
const HIGHLIGHTS = [
  { name: 'None', value: '' },
  { name: 'Blush', value: '#FBD3D7' },
  { name: 'Lavender', value: '#E0D6F6' },
  { name: 'Sage', value: '#D6E5CB' },
  { name: 'Butter', value: '#FBEBB8' },
];

function TB({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button" className="icon-btn shrink-0" aria-label={label} title={label} aria-pressed={active ?? false} disabled={disabled}
      // keep the text selection while pressing toolbar buttons
      onMouseDown={(e) => e.preventDefault()} onClick={onClick}
    >{children}</button>
  );
}

const Divider = () => <span className="mx-1 h-6 w-px shrink-0 bg-blush-200" aria-hidden />;

interface Props {
  editor: Editor | null;
  favorite: boolean;
  onToggleFavorite: () => void;
  peek: boolean;
  onTogglePeek: () => void;
  onFocusMode: () => void;
  /** sticker undo/redo, shown only once there is something to undo or redo */
  stickerHistory: { canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void };
  isRecording?: boolean;
  isTranscribing?: boolean;
  onToggleVoice?: () => void;
}

export function EditorToolbar({ editor, favorite, onToggleFavorite, peek, onTogglePeek, onFocusMode, stickerHistory, isRecording, isTranscribing, onToggleVoice }: Props) {
  const [menu, setMenu] = useState<'color' | 'highlight' | null>(null);
  if (!editor) return null;
  const chain = () => editor.chain().focus();
  const activeColor = (editor.getAttributes('textStyle').color as string | undefined) ?? '';
  const activeHighlight = (editor.getAttributes('highlight').color as string | undefined) ?? '';

  return (
    <div>
      <div role="toolbar" aria-label="Text formatting" className="no-scrollbar flex items-center gap-0.5 overflow-x-auto px-2 py-1.5">
        <TB label="Undo text" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}><Undo2 size={19} /></TB>
        <TB label="Redo text" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}><Redo2 size={19} /></TB>
        {(stickerHistory.canUndo || stickerHistory.canRedo) && (
          <>
            <span className="mx-1 shrink-0 rounded-full bg-lav-100 px-2 py-1 text-[11px] font-semibold text-[#4d3d78]" aria-hidden>stickers</span>
            <TB label="Undo sticker change" disabled={!stickerHistory.canUndo} onClick={stickerHistory.onUndo}><Undo2 size={19} className="text-[#6B4E97]" /></TB>
            <TB label="Redo sticker change" disabled={!stickerHistory.canRedo} onClick={stickerHistory.onRedo}><Redo2 size={19} className="text-[#6B4E97]" /></TB>
          </>
        )}
        <Divider />
        <TB label="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}><Bold size={19} /></TB>
        <TB label="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}><Italic size={19} /></TB>
        <TB label="Underline" active={editor.isActive('underline')} onClick={() => chain().toggleUnderline().run()}><UnderlineIcon size={19} /></TB>
        <TB label="Strikethrough" active={editor.isActive('strike')} onClick={() => chain().toggleStrike().run()}><Strikethrough size={19} /></TB>
        <TB label="Text colour" active={menu === 'color'} onClick={() => setMenu(menu === 'color' ? null : 'color')}>
          <span className="relative"><Palette size={19} /><i className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full" style={{ background: activeColor || '#3A3040' }} /></span>
        </TB>
        <TB label="Highlight" active={menu === 'highlight'} onClick={() => setMenu(menu === 'highlight' ? null : 'highlight')}>
          <span className="relative"><Highlighter size={19} /><i className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full" style={{ background: activeHighlight || '#FBD3D7' }} /></span>
        </TB>
        <Divider />
        <TB label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 size={19} /></TB>
        <TB label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}><List size={19} /></TB>
        <TB label="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}><ListOrdered size={19} /></TB>
        <TB label="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}><Quote size={19} /></TB>
        <Divider />
        <TB label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => chain().setTextAlign('left').run()}><AlignLeft size={19} /></TB>
        <TB label="Align centre" active={editor.isActive({ textAlign: 'center' })} onClick={() => chain().setTextAlign('center').run()}><AlignCenter size={19} /></TB>
        <TB label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => chain().setTextAlign('right').run()}><AlignRight size={19} /></TB>
        <span className="flex-1" />
        {onToggleVoice && (
          <button
            type="button"
            className={`icon-btn shrink-0 transition-all ${
              isRecording
                ? '!bg-red-500/15 !text-red-500 ring-2 ring-red-400/40 shadow-sm animate-pulse'
                : isTranscribing
                ? '!bg-lav-100 !text-lav-500'
                : 'hover:!bg-blush-100 hover:!text-blush-500'
            }`}
            aria-label={isTranscribing ? 'Transcribing speech...' : isRecording ? 'Recording voice (click to finish)' : 'Voice dictation (click to speak)'}
            title={isTranscribing ? 'Transcribing speech...' : isRecording ? 'Recording voice (click to finish)' : 'Voice dictation (click to speak)'}
            aria-pressed={isRecording}
            disabled={isTranscribing}
            onClick={onToggleVoice}
          >
            {isTranscribing ? (
              <Loader2 size={19} className="animate-spin text-lav-500" />
            ) : isRecording ? (
              <span className="relative flex items-center justify-center">
                <Mic size={19} className="text-red-500" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </span>
            ) : (
              <Mic size={19} />
            )}
          </button>
        )}
        <Divider />
        <TB label={favorite ? 'Remove from favorites' : 'Add to favorites'} active={favorite} onClick={onToggleFavorite}>
          <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
        </TB>
        <TB label={peek ? 'Show stickers fully' : 'Fade stickers to read text'} active={peek} onClick={onTogglePeek}>{peek ? <EyeOff size={19} /> : <Eye size={19} />}</TB>
        <TB label="Distraction-free mode" onClick={onFocusMode}><Maximize2 size={19} /></TB>
      </div>

      {menu && (
        <div className="flex items-center gap-2 border-t border-blush-100 px-3 py-2" role="group" aria-label={menu === 'color' ? 'Text colours' : 'Highlight colours'}>
          <span className="mr-1 text-sm text-ink-mute">{menu === 'color' ? 'Text colour' : 'Highlight'}</span>
          {(menu === 'color' ? TEXT_COLORS : HIGHLIGHTS).map((c) => {
            const on = (menu === 'color' ? activeColor : activeHighlight) === c.value;
            return (
              <button
                key={c.name} type="button" title={c.name} aria-label={c.name} aria-pressed={on}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (menu === 'color') (c.value ? chain().setColor(c.value) : chain().unsetColor()).run();
                  else (c.value ? chain().setHighlight({ color: c.value }) : chain().unsetHighlight()).run();
                  setMenu(null);
                }}
                className={`grid h-9 w-9 place-items-center rounded-full border-2 transition ${on ? 'border-ink' : 'border-white'} shadow-soft`}
                style={{ background: c.value || (menu === 'color' ? '#3A3040' : '#fff') }}
              >
                {!c.value && menu === 'highlight' && <span className="h-0.5 w-5 -rotate-45 bg-ink-mute" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
