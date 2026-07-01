import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  BUILT_IN_THEMES, FONT_FAMILIES, FONT_SIZES, BORDER_RADII, ACCENT_PRESETS
} from '../lib/themes';
import {
  Check, X, Sparkles, Type, Layout, Zap, Eye, ChevronRight,
  Sun, Moon, Monitor, Palette, Sliders
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Segmented pill control — no radio buttons */
function SegmentedControl({ options, value, onChange, className = '' }) {
  const idx = options.findIndex(o => (o.id || o) === value);
  return (
    <div
      className={`relative flex bg-black/20 border border-white/10 rounded-xl p-1 ${className}`}
      role="group"
    >
      {/* Sliding highlight */}
      {idx !== -1 && (
        <div
          className="absolute top-1 bottom-1 rounded-[0.6rem] bg-primary/30 border border-primary/50 transition-all duration-300"
          style={{
            left: `calc(${(idx / options.length) * 100}% + 4px)`,
            width: `calc(${100 / options.length}% - 8px)`,
          }}
        />
      )}
      {options.map(opt => {
        const id = opt.id || opt;
        const label = opt.label || opt;
        const Icon = opt.icon;
        const active = id === value;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative z-10 flex-1 py-2 px-3 rounded-[0.6rem] text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 ${active ? 'text-text' : 'text-text/40 hover:text-text/70'}`}
            aria-pressed={active}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Modern toggle switch */
function Toggle({ checked, onChange, label, description, id }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 cursor-pointer group py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        {description && <div className="text-xs text-text/50 mt-0.5">{description}</div>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${checked ? 'bg-primary' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </label>
  );
}

/** Section heading */
function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/15 border border-primary/20">
        <Icon size={17} className="text-primary" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
        {subtitle && <p className="text-xs text-text/50 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Premium glassmorphism section card */
function SectionCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-surface/60 backdrop-blur-sm shadow-xl shadow-black/10 p-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Theme Card ───────────────────────────────────────────────────────────────

function ThemeCard({ theme, isActive, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(theme.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative group text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 ${isActive ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]' : 'border-white/8 hover:border-white/25 hover:scale-[1.01]'}`}
      style={{ background: theme.background }}
      aria-label={`Select ${theme.name} theme`}
      aria-pressed={isActive}
    >
      {/* Mini UI Preview */}
      <div className="p-4 pb-0">
        {/* Fake nav bar */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.primary, opacity: 0.8 }} />
          <div className="w-10 h-1.5 rounded-full" style={{ background: theme.primary, opacity: 0.4 }} />
          <div className="flex-1" />
          <div className="w-4 h-4 rounded-md" style={{ background: theme.primary, opacity: 0.6 }} />
        </div>

        {/* Fake journal card */}
        <div
          className="rounded-xl p-3 mb-2 transition-transform duration-300"
          style={{
            background: theme.surfaceSolid,
            border: `1px solid ${theme.primary}25`,
            transform: hovered ? 'translateY(-2px)' : 'none',
          }}
        >
          <div className="w-16 h-1.5 rounded-full mb-2" style={{ background: theme.text, opacity: 0.5 }} />
          <div className="w-full h-1 rounded-full mb-1" style={{ background: theme.text, opacity: 0.2 }} />
          <div className="w-4/5 h-1 rounded-full mb-3" style={{ background: theme.text, opacity: 0.2 }} />
          <div className="flex gap-1.5 items-center">
            <div className="h-5 px-2 rounded-full flex items-center text-[8px] font-bold" style={{ background: `${theme.primary}30`, color: theme.primary }}>
              Mood
            </div>
            <div className="w-5 h-5 rounded-md ml-auto flex items-center justify-center" style={{ background: theme.primary }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: theme.background || '#fff', opacity: 0.9 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Meta */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{theme.icon}</span>
          <span className="text-sm font-semibold" style={{ color: theme.text }}>{theme.name}</span>
          {isActive && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${theme.primary}30`, color: theme.primary }}>
              <Check size={9} /> Applied
            </span>
          )}
        </div>
        <p className="text-[11px] mt-1 leading-relaxed opacity-60" style={{ color: theme.text }}>{theme.description}</p>
      </div>

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${theme.primary}15 0%, transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />
    </button>
  );
}

// ─── AI Recommendation Banner ─────────────────────────────────────────────────

function AIRecommendation({ recommendation, onApply, onDismiss }) {
  if (!recommendation) return null;
  const theme = BUILT_IN_THEMES[recommendation.themeId];
  if (!theme) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-primary/20 mb-8 fade-up" style={{ background: `linear-gradient(135deg, rgba(127,119,221,0.12) 0%, rgba(93,202,165,0.06) 100%)` }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Recommendation</span>
          </div>
          <h3 className="text-sm font-semibold text-text mb-1">
            {theme.icon} Try {theme.name} Theme
          </h3>
          <p className="text-xs text-text/60 leading-relaxed">{recommendation.reason}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onApply(recommendation.themeId)}
            className="text-xs px-4 py-2 rounded-xl font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
          <button
            onClick={onDismiss}
            className="text-xs px-4 py-2 rounded-xl font-medium text-text/50 hover:text-text/80 transition-colors border border-white/10"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Accent Color Picker ──────────────────────────────────────────────────────

function AccentColorPicker({ value, onChange }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {ACCENT_PRESETS.map(preset => (
        <button
          key={preset.id}
          onClick={() => onChange(preset.color)}
          title={preset.label}
          className="relative w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30"
          style={{
            background: preset.color,
            borderColor: value === preset.color ? 'white' : 'transparent',
            boxShadow: value === preset.color ? `0 0 0 4px ${preset.color}40` : 'none',
          }}
          aria-label={preset.label}
          aria-pressed={value === preset.color}
        >
          {value === preset.color && (
            <Check size={12} className="text-white absolute inset-0 m-auto" />
          )}
        </button>
      ))}

      {/* Custom color */}
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-8 h-8 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center hover:border-white/60 transition-colors"
        title="Custom color"
        aria-label="Custom color picker"
      >
        <Palette size={13} className="text-text/60" />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="Pick custom color"
        />
      </button>

      <div className="ml-2 flex items-center gap-2 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: value }} />
        <span className="text-xs font-mono text-text/70">{value}</span>
      </div>
    </div>
  );
}

// ─── Realistic Live Preview ───────────────────────────────────────────────────

function LivePreview({ preferences }) {
  const theme = BUILT_IN_THEMES[preferences.theme] || BUILT_IN_THEMES.midnight;
  const fontSize = preferences.typography?.fontSize || 'medium';
  const cardStyle = preferences.layout?.cardStyle || 'glass';
  const density = preferences.layout?.density || 'comfortable';

  const cardBg = cardStyle === 'flat' || cardStyle === 'minimal'
    ? `${theme.surfaceSolid}`
    : cardStyle === 'elevated'
    ? theme.surfaceSolid
    : theme.surface ? theme.surfaceSolid : theme.surfaceSolid;

  const cardBorder = cardStyle === 'flat' || cardStyle === 'minimal'
    ? `1px solid ${theme.primary}15`
    : `1px solid ${theme.primary}20`;

  const p = density === 'compact' ? '10px' : density === 'spacious' ? '18px' : '14px';
  const textSizeBase = fontSize === 'small' ? 11 : fontSize === 'large' ? 14 : 12;

  return (
    <div className="sticky top-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-semibold text-text/60 uppercase tracking-widest">Live Preview</span>
      </div>

      {/* App shell mock */}
      <div
        className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        style={{ background: theme.background, minHeight: 520 }}
      >
        {/* Fake sidebar */}
        <div className="flex h-full" style={{ minHeight: 520 }}>
          <div
            className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-4"
            style={{ background: theme.surfaceSolid, borderRight: `1px solid ${theme.primary}15` }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: theme.primary }}>
              <span style={{ fontSize: 10 }}>✦</span>
            </div>
            {['◉', '◈', '◎', '⊡'].map((ic, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  background: i === 0 ? `${theme.primary}25` : 'transparent',
                  color: i === 0 ? theme.primary : `${theme.text}50`,
                  fontSize: 13
                }}
              >
                {ic}
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden p-4 flex flex-col gap-3">

            {/* Page title */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold mb-0.5" style={{ fontSize: textSizeBase + 2, color: theme.text }}>Journal</div>
                <div style={{ fontSize: textSizeBase - 2, color: theme.textMuted }}>3 entries</div>
              </div>
              <div
                className="px-3 py-1.5 rounded-lg font-medium"
                style={{ background: theme.primary, color: '#fff', fontSize: textSizeBase - 1 }}
              >
                + New
              </div>
            </div>

            {/* Journal card */}
            <div
              className="rounded-xl flex-shrink-0"
              style={{ background: cardBg, border: cardBorder, padding: p }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div style={{ fontSize: textSizeBase - 1, color: theme.textMuted }}>Today</div>
                <div
                  className="px-2 py-0.5 rounded-full text-center"
                  style={{ background: `${theme.primary}25`, color: theme.primary, fontSize: textSizeBase - 2 }}
                >
                  7/10
                </div>
              </div>
              <div style={{ fontSize: textSizeBase, color: theme.text, lineHeight: 1.5 }}>
                I've been feeling more grounded lately. Taking small steps every day...
              </div>
              <div className="flex gap-1.5 mt-3">
                {['Growth', 'Calm'].map(tag => (
                  <div
                    key={tag}
                    style={{ background: `${theme.accent}20`, color: theme.accent, fontSize: textSizeBase - 2, borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Companion message */}
            <div
              className="rounded-xl flex-shrink-0"
              style={{ background: cardBg, border: cardBorder, padding: p }}
            >
              <div style={{ fontSize: textSizeBase - 1, color: theme.primary, fontWeight: 600, marginBottom: 6 }}>✦ Companion</div>
              <div
                className="inline-block rounded-xl px-3 py-2"
                style={{ background: `${theme.primary}20`, color: theme.text, fontSize: textSizeBase - 1, maxWidth: '85%', lineHeight: 1.5 }}
              >
                It sounds like you're making real progress. What small win are you most proud of this week?
              </div>
            </div>

            {/* Timeline mini */}
            <div
              className="rounded-xl flex-shrink-0"
              style={{ background: cardBg, border: cardBorder, padding: p }}
            >
              <div style={{ fontSize: textSizeBase - 1, color: theme.textMuted, fontWeight: 600, marginBottom: 8 }}>Mood Timeline</div>
              <div className="flex items-end gap-1" style={{ height: 36 }}>
                {[5, 7, 6, 8, 7, 9, 7].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${(v / 10) * 100}%`,
                      background: i === 6 ? theme.primary : `${theme.primary}45`,
                      borderRadius: 3
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-text/30 mt-3">Changes reflect instantly</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Appearance() {
  const { preferences, setPartialPreferences, updatePreferences } = useTheme();
  const [recommendation, setRecommendation] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('mm_rec_dismissed') === 'true');

  // Simulated AI recommendation based on time of day / basic heuristic
  useEffect(() => {
    if (dismissed) return;
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) {
      setRecommendation({
        themeId: 'midnight',
        reason: "You've been journaling late at night. The Midnight theme is easier on your eyes and great for reflective evening sessions.",
      });
    } else if (hour >= 6 && hour < 10) {
      setRecommendation({
        themeId: 'sunrise',
        reason: "Good morning! The Sunrise theme's warm golden tones are perfect for a fresh start to your day.",
      });
    }
  }, [dismissed]);

  const handleDismissRec = () => {
    setRecommendation(null);
    setDismissed(true);
    localStorage.setItem('mm_rec_dismissed', 'true');
  };

  const handleApplyRec = (themeId) => {
    setPartialPreferences('theme', null, themeId);
    setRecommendation(null);
  };

  const activeTheme = BUILT_IN_THEMES[preferences.theme] || BUILT_IN_THEMES.midnight;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--color-bg)' }}>
      {/* ─── Hero Header ──────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Animated gradient blob */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% -20%, ${activeTheme.primary}20 0%, transparent 70%)`,
            transition: 'background 0.6s ease',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl shadow-lg"
              style={{ background: `linear-gradient(135deg, ${activeTheme.primary}, ${activeTheme.accent})` }}
            >
              🎨
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">Personalize Your Space</h1>
              <p className="text-sm text-text/50 max-w-xl leading-relaxed">
                MindMirror should feel as unique as your journey. Customize the look, feel, and experience that's most comfortable for you.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${activeTheme.primary}30, transparent)` }} />
      </div>

      {/* ─── Main Layout ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* Settings Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* AI Recommendation */}
            {recommendation && (
              <AIRecommendation
                recommendation={recommendation}
                onApply={handleApplyRec}
                onDismiss={handleDismissRec}
              />
            )}

            {/* ── Themes ───────────────────────────────────── */}
            <SectionCard>
              <SectionTitle icon={Palette} title="Themes" subtitle="Choose a look that matches your mood" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.values(BUILT_IN_THEMES).map(theme => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={preferences.theme === theme.id}
                    onSelect={(id) => setPartialPreferences('theme', null, id)}
                  />
                ))}
              </div>
            </SectionCard>

            {/* ── Accent Color ─────────────────────────────── */}
            <SectionCard>
              <SectionTitle icon={Sliders} title="Accent Color" subtitle="Override the primary color across all themes" />
              <AccentColorPicker
                value={activeTheme.primary}
                onChange={(color) => {
                  updatePreferences({
                    ...preferences,
                    customTheme: { ...preferences.customTheme, primary: color },
                    theme: 'custom',
                  });
                }}
              />
              {preferences.theme === 'custom' && (
                <button
                  onClick={() => setPartialPreferences('theme', null, 'midnight')}
                  className="mt-4 text-xs text-text/50 hover:text-text/80 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Reset to theme default
                </button>
              )}
            </SectionCard>

            {/* ── Color Mode ───────────────────────────────── */}
            <SectionCard>
              <SectionTitle icon={Sun} title="Color Mode" subtitle="Control light, dark, or follow your system" />
              <SegmentedControl
                options={[
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ]}
                value={preferences.colorMode}
                onChange={v => setPartialPreferences('colorMode', null, v)}
              />
            </SectionCard>

            {/* ── Typography ───────────────────────────────── */}
            <SectionCard>
              <SectionTitle icon={Type} title="Typography" subtitle="Adjust readability to your preference" />

              <div className="mb-6">
                <div className="text-xs font-bold text-text/40 uppercase tracking-widest mb-3">Font Family</div>
                <div className="flex flex-wrap gap-2">
                  {FONT_FAMILIES.map(font => {
                    const active = preferences.typography?.fontFamily === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => setPartialPreferences('typography', 'fontFamily', font.id)}
                        className={`relative px-5 py-3 rounded-xl border transition-all duration-200 text-sm ${active ? 'border-primary bg-primary/15 text-text' : 'border-white/10 bg-black/20 text-text/60 hover:text-text hover:border-white/25'}`}
                        style={{ fontFamily: font.id }}
                      >
                        <div className="text-lg font-bold leading-none mb-0.5" style={{ fontFamily: font.id }}>{font.sample}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider">{font.name}</div>
                        {active && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-text/40 uppercase tracking-widest mb-3">Font Size</div>
                <SegmentedControl
                  options={['small', 'medium', 'large']}
                  value={preferences.typography?.fontSize || 'medium'}
                  onChange={v => setPartialPreferences('typography', 'fontSize', v)}
                />
              </div>
            </SectionCard>

            {/* ── Layout ───────────────────────────────────── */}
            <SectionCard>
              <SectionTitle icon={Layout} title="Layout & Style" subtitle="Tune spacing, card appearance, and shape" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs font-bold text-text/40 uppercase tracking-widest mb-3">Density</div>
                  <div className="flex flex-col gap-2">
                    {['compact', 'comfortable', 'spacious'].map(d => {
                      const active = (preferences.layout?.density || 'comfortable') === d;
                      return (
                        <button
                          key={d}
                          onClick={() => setPartialPreferences('layout', 'density', d)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-sm capitalize text-left ${active ? 'border-primary bg-primary/10 text-text' : 'border-white/8 bg-black/20 text-text/60 hover:border-white/20'}`}
                        >
                          <div className="flex flex-col gap-[3px] flex-shrink-0">
                            {Array.from({ length: d === 'compact' ? 3 : d === 'spacious' ? 2 : 3 }).map((_, i) => (
                              <div key={i} className="h-[3px] rounded-full bg-current opacity-60" style={{ width: d === 'compact' ? 14 : d === 'spacious' ? 18 : 14, marginBottom: d === 'spacious' ? 2 : 0 }} />
                            ))}
                          </div>
                          {d}
                          {active && <Check size={13} className="ml-auto text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text/40 uppercase tracking-widest mb-3">Card Style</div>
                  <div className="flex flex-col gap-2">
                    {['glass', 'elevated', 'flat', 'minimal'].map(s => {
                      const active = (preferences.layout?.cardStyle || 'glass') === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setPartialPreferences('layout', 'cardStyle', s)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-sm capitalize text-left ${active ? 'border-primary bg-primary/10 text-text' : 'border-white/8 bg-black/20 text-text/60 hover:border-white/20'}`}
                        >
                          <div className={`w-6 h-5 rounded-md flex-shrink-0 ${s === 'glass' ? 'bg-white/10 border border-white/20' : s === 'elevated' ? 'bg-white/15 shadow-sm' : s === 'flat' ? 'bg-white/8 border border-white/10' : 'bg-transparent border border-white/20'}`} />
                          {s}
                          {active && <Check size={13} className="ml-auto text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-text/40 uppercase tracking-widest mb-3">Border Radius</div>
                  <div className="flex flex-col gap-2">
                    {['small', 'medium', 'large'].map(r => {
                      const active = (preferences.layout?.borderRadius || 'medium') === r;
                      const radius = r === 'small' ? 4 : r === 'medium' ? 10 : 18;
                      return (
                        <button
                          key={r}
                          onClick={() => setPartialPreferences('layout', 'borderRadius', r)}
                          className={`flex items-center gap-3 p-3 border transition-all duration-200 text-sm capitalize text-left ${active ? 'border-primary bg-primary/10 text-text' : 'border-white/8 bg-black/20 text-text/60 hover:border-white/20'}`}
                          style={{ borderRadius: 12 }}
                        >
                          <div className="w-6 h-5 bg-current opacity-20 flex-shrink-0 border-2 border-current" style={{ borderRadius: radius }} />
                          {r}
                          {active && <Check size={13} className="ml-auto text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Motion & Accessibility ───────────────────── */}
            <SectionCard>
              <SectionTitle icon={Zap} title="Motion & Accessibility" subtitle="Optimize for comfort and readability" />

              <div className="mb-6">
                <div className="text-xs font-bold text-text/40 uppercase tracking-widest mb-3">Animations</div>
                <SegmentedControl
                  options={['full', 'reduced', 'disabled']}
                  value={preferences.animations || 'full'}
                  onChange={v => setPartialPreferences('animations', null, v)}
                />
              </div>

              <div className="flex flex-col divide-y divide-white/5">
                <Toggle
                  id="highContrast"
                  label="High Contrast Mode"
                  description="Increases contrast for better readability"
                  checked={preferences.accessibility?.highContrast || false}
                  onChange={v => setPartialPreferences('accessibility', 'highContrast', v)}
                />
                <Toggle
                  id="dyslexiaFont"
                  label="Dyslexia-Friendly Font"
                  description="Overrides typography with OpenDyslexic"
                  checked={preferences.accessibility?.dyslexiaFont || false}
                  onChange={v => setPartialPreferences('accessibility', 'dyslexiaFont', v)}
                />
              </div>
            </SectionCard>

          </div>

          {/* Live Preview Column */}
          <div className="xl:w-80 w-full flex-shrink-0">
            <LivePreview preferences={preferences} />
          </div>

        </div>
      </div>
    </div>
  );
}
