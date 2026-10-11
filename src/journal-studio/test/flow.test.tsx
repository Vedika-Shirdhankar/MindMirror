import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const KEY = 'mindmirror-journal-studio:v1:entries';
const stored = () => JSON.parse(localStorage.getItem(KEY) ?? '[]');

const PAGE = { left: 0, top: 0, width: 1000, height: 1300, right: 1000, bottom: 1300, x: 0, y: 0, toJSON() {} };
const ZERO = { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {} };

const getEditor = () => (document.querySelector('.ProseMirror') as unknown as { editor: any }).editor;
const stickerEls = () => Array.from(document.querySelectorAll<HTMLElement>('[data-sticker]'));

function pointer(el: Element, type: 'pointerDown' | 'pointerMove' | 'pointerUp', x: number, y: number) {
  fireEvent[type](el, { clientX: x, clientY: y, pointerId: 1, button: 0 });
}

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn() as never;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return (this.hasAttribute('data-page') ? PAGE : ZERO) as DOMRect;
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('MindMirror Journal Studio: complete flow', () => {
  it('create → decorate → save → refresh → reopen → edit → search → favorite → delete', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1-2. Launch, home screen content, demo content is labelled and removable
    expect(await screen.findByRole('heading', { name: 'Your little corner of the world.' })).toBeInTheDocument();
    expect(screen.getByText(/everything you're feeling, thinking, and becoming/)).toBeInTheDocument();
    expect(await screen.findByTestId('demo-banner')).toBeInTheDocument();
    expect(screen.getByTestId('entry-count')).toHaveTextContent('4 entries');
    expect(screen.getAllByText('Demo').length).toBeGreaterThanOrEqual(4);
    await user.click(screen.getByRole('button', { name: 'Remove demo entries' }));
    await waitFor(() => expect(screen.getByTestId('entry-count')).toHaveTextContent('0 entries'));
    expect(screen.getByText('A blank page, ready when you are.')).toBeInTheDocument();

    // 3. Create New Entry → Write Freely
    await user.click(screen.getByRole('button', { name: /Create New Entry/ }));
    await user.click(within(await screen.findByRole('dialog', { name: 'How do you want to begin?' })).getByRole('button', { name: /Write Freely/ }));
    const title = await screen.findByLabelText('Entry title');
    expect(document.querySelector('.ProseMirror p[data-placeholder]')).toHaveAttribute('data-placeholder', "Dear me, what's on your mind today?");

    // 4. Title + formatted text
    await user.type(title, 'A good day');
    act(() => { getEditor().chain().focus().insertContent('<p>Today was <strong>really</strong> lovely.</p>').run(); });
    await waitFor(() => expect(screen.getByTestId('word-count')).toHaveTextContent('4 words'));

    // 5. Mood (optional, then chosen)
    await user.click(screen.getByRole('tab', { name: /Mood/ }));
    await user.click(screen.getByRole('radio', { name: /Peaceful/ }));
    expect(screen.getByRole('button', { name: /Mood: Peaceful/ })).toBeInTheDocument();

    // 6. Three different stickers really appear on the canvas
    await user.click(screen.getByRole('tab', { name: /Stickers/ }));
    expect(stickerEls()).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Add Daisy sticker' }));
    await user.click(screen.getByRole('tab', { name: /Books/ }));
    await user.click(screen.getByRole('button', { name: 'Add Coffee sticker' }));
    await user.click(screen.getByRole('tab', { name: /Washi/ }));
    await user.click(screen.getByRole('button', { name: 'Add Blush stripes sticker' }));
    expect(stickerEls()).toHaveLength(3);
    expect(new Set(stickerEls().map((e) => e.dataset.sticker)).size).toBe(3);

    // 7. Move, resize, rotate (pointer events)
    const first = stickerEls()[0];
    await user.click(first);
    expect(first).toHaveClass('sticker-selected');
    const startLeft = parseFloat(first.style.left);
    pointer(first, 'pointerDown', 100, 100);
    pointer(first, 'pointerMove', 300, 250);
    pointer(first, 'pointerUp', 300, 250);
    expect(parseFloat(first.style.left)).toBeGreaterThan(startLeft + 15); // +200px of a 1000px page = +20%

    const cq = (v: string) => parseFloat(v.match(/calc\(([\d.]+)cqw/)?.[1] ?? 'NaN') / 100;
    const centre = () => ({
      x: parseFloat(first.style.left) / 100 + parseFloat(first.style.width) / 200,
      y: cq(first.style.top) + cq(first.style.height) / 2,
    });
    const widthBefore = parseFloat(first.style.width);
    const c0 = centre();
    const resize = within(first).getByRole('slider', { name: 'Resize sticker' });
    pointer(resize, 'pointerDown', (c0.x + 0.1) * 1000, c0.y * 1000);
    pointer(resize, 'pointerMove', (c0.x + 0.15) * 1000, c0.y * 1000);
    pointer(resize, 'pointerUp', (c0.x + 0.15) * 1000, c0.y * 1000);
    expect(parseFloat(first.style.width)).toBeCloseTo(widthBefore * 1.5, 0); // 0.1 -> 0.15 from centre = x1.5

    const c1 = centre();
    const rotate = within(first).getByRole('slider', { name: 'Rotate sticker' });
    pointer(rotate, 'pointerDown', c1.x * 1000, (c1.y - 0.2) * 1000);          // handle straight above
    pointer(rotate, 'pointerMove', (c1.x + 0.2) * 1000, c1.y * 1000);          // swing to the right
    pointer(rotate, 'pointerUp', (c1.x + 0.2) * 1000, c1.y * 1000);
    expect(first.style.transform).toBe('rotate(90deg)');

    // sticker toolbar acts on selection; undo/redo for stickers; delete works
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(stickerEls()).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Delete sticker' }));
    expect(stickerEls()).toHaveLength(3);
    // deleting clears the selection, yet undo must stay reachable
    await user.click(screen.getByRole('button', { name: 'Undo sticker change' }));
    expect(stickerEls()).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Undo sticker change' }));
    expect(stickerEls()).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Redo sticker change' }));
    expect(stickerEls()).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Undo sticker change' }));
    expect(stickerEls()).toHaveLength(3);
    if (screen.queryByRole('button', { name: 'Done' })) await user.click(screen.getByRole('button', { name: 'Done' }));

    // autosave status moves to a draft (not yet in the journal)
    await waitFor(() => expect(screen.getByTestId('save-status')).toHaveTextContent(/Draft autosaved/), { timeout: 3000 });
    expect(stored()).toHaveLength(0);

    // Preview keeps everything, then back to editing
    await user.click(screen.getByRole('button', { name: /Preview/ }));
    expect(await screen.findByText(/This is how your page will look/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A good day' })).toBeInTheDocument();
    expect(document.querySelectorAll('.sticker')).toHaveLength(3);
    expect(screen.getByTestId('preview-page').querySelector('strong')).toHaveTextContent('really');
    await user.click(screen.getByRole('button', { name: /Back to editing/ }));

    // 8. Save with a visible confirmation
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    expect(await screen.findByText('Entry saved to your journal')).toBeInTheDocument();
    const saved = stored();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ title: 'A good day', mood: 'peaceful', theme: 'cream', favorite: false, prompt: null });
    expect(saved[0].content).toContain('<strong>really</strong>');
    expect(saved[0].stickers).toHaveLength(3);
    expect(saved[0].stickers.map((s: any) => s.type).sort()).toEqual(['coffee', 'daisy', 'washi-blush']);
    const savedDaisy = saved[0].stickers.find((s: any) => s.type === 'daisy');
    expect(savedDaisy.x).toBeGreaterThan(0.3);
    expect(savedDaisy.rotation).not.toBe(0);

    // 9-10. Back home; entry is listed
    await user.click(screen.getByRole('button', { name: 'Back to journal' }));
    expect(await screen.findByRole('heading', { name: /Open A good day|A good day/ })).toBeInTheDocument();
    expect(screen.getByTestId('entry-count')).toHaveTextContent('1 entry');
    expect(screen.queryByText('Demo')).not.toBeInTheDocument();

    // 11-13. "Refresh": throw the whole React tree away and mount fresh from storage
    cleanup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Open A good day' }));
    expect(await screen.findByRole('heading', { name: 'A good day', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Peaceful')).toBeInTheDocument();
    expect(screen.getByTestId('preview-page').querySelector('strong')).toHaveTextContent('really');
    const restored = Array.from(document.querySelectorAll<HTMLElement>('.sticker'));
    expect(restored).toHaveLength(3);
    const restoredLefts = restored.map((s) => parseFloat(s.style.left) / 100).sort();
    expect(restoredLefts).toEqual(saved[0].stickers.map((s: any) => s.x).sort());

    // 14. Edit and save again
    await user.click(screen.getByRole('button', { name: /Edit/ }));
    const title2 = await screen.findByLabelText('Entry title');
    expect(title2).toHaveValue('A good day');
    expect(getEditor().getHTML()).toContain('<strong>really</strong>');
    expect(stickerEls()).toHaveLength(3);
    expect(screen.getByTestId('save-status')).toHaveTextContent('All changes saved');
    await user.clear(title2);
    await user.type(title2, 'A very good day');
    expect(screen.getByTestId('save-status')).toHaveTextContent(/Unsaved|Draft/);
    // leaving with unsaved changes asks first
    await user.click(screen.getByRole('button', { name: 'Back to journal' }));
    expect(await screen.findByRole('dialog', { name: 'Save before leaving?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep writing' }));
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(stored()[0].title).toBe('A very good day'));
    expect(stored()[0].stickers).toHaveLength(3);
    expect(stored()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Back to journal' }));

    // 15. Search + mood filter
    await user.type(await screen.findByLabelText('Search entries'), 'very good');
    expect(await screen.findByRole('button', { name: 'Open A very good day' })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Search entries'));
    await user.type(screen.getByLabelText('Search entries'), 'zzzz');
    expect(await screen.findByText(/Nothing matches that yet/)).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Search entries'));
    await user.click(screen.getByRole('button', { name: /Anxious/ }));
    expect(await screen.findByText(/Nothing matches that yet/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Peaceful/ }));
    expect(await screen.findByRole('button', { name: 'Open A very good day' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Clear filters/ }));

    // 16. Favorite / unfavorite
    await user.click(await screen.findByRole('button', { name: 'Add A very good day to favorites' }));
    await waitFor(() => expect(stored()[0].favorite).toBe(true));
    expect(screen.getByRole('heading', { name: /Favorites/ })).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Remove A very good day from favorites' })[0]);
    await waitFor(() => expect(stored()[0].favorite).toBe(false));

    // 17. Delete only after confirmation
    await user.click(screen.getByRole('button', { name: 'Delete A very good day' }));
    expect(stored()).toHaveLength(1);
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(stored()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Delete A very good day' }));
    await user.click(await screen.findByRole('button', { name: 'Delete entry' }));
    await waitFor(() => expect(stored()).toHaveLength(0));
    expect(screen.getByTestId('entry-count')).toHaveTextContent('0 entries');
  }, 40000);

  it('prompt mode: pick, shuffle, remove; Surprise Me works; no API involved', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Start With a Prompt/ }));
    expect(await screen.findByRole('heading', { name: 'Choose a place to begin.' })).toBeInTheDocument();
    for (const c of ['Emotions', 'Self-discovery', 'Gratitude', 'Memories', 'Future self', 'Late-night thoughts']) {
      expect(screen.getByRole('button', { name: new RegExp(c) })).toBeInTheDocument();
    }
    await user.click(screen.getByRole('button', { name: /Gratitude/ }));
    await user.click(screen.getByRole('button', { name: /What made me smile today\?/ }));
    expect(await screen.findByTestId('prompt-text')).toHaveTextContent('What made me smile today?');

    await user.click(screen.getByRole('button', { name: 'Try a different prompt' }));
    expect(screen.getByTestId('prompt-text')).not.toHaveTextContent('What made me smile today?');
    await user.click(screen.getByRole('button', { name: /Remove prompt and write freely/ }));
    expect(screen.queryByTestId('prompt-text')).not.toBeInTheDocument();
    // can still write with no prompt
    act(() => { getEditor().chain().focus().insertContent('just writing').run(); });
    await user.click(screen.getByRole('button', { name: /^Save$/ }));
    await waitFor(() => expect(stored().filter((e: any) => !e.isDemo)[0]?.prompt).toBeNull());
    expect(stored().filter((e: any) => !e.isDemo)).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Back to journal' }));
    await user.click(await screen.findByRole('button', { name: /Start With a Prompt/ }));
    await user.click(await screen.findByRole('button', { name: /Surprise me/ }));
    expect((await screen.findByTestId('prompt-text')).textContent).toMatch(/\?$/);
    expect(fetchSpy).not.toHaveBeenCalled();
  }, 20000);

  it('refuses to save a completely blank page and explains why', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: /Write Freely/ }));
    await user.click(await screen.findByRole('button', { name: /^Save$/ }));
    expect(await screen.findByText(/Add a title, a few words, or a sticker/)).toBeInTheDocument();
    expect(stored().filter((e: any) => !e.isDemo)).toHaveLength(0);
  });
});
