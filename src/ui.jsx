import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  Home, ShieldCheck, Scale, ListChecks, HelpCircle, Volume2, Square, ArrowLeft, Upload, Camera, Loader2,
} from 'lucide-react'

/* ---------- language ---------- */
export const LangCtx = createContext({ lang: 'en', t: (en) => en })
export const useLang = () => useContext(LangCtx)
export const inr = (n) => '₹' + Math.round(Number(n)).toLocaleString('en-IN')

/* ---------- logo ---------- */
export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0F766E" />
      <path d="M20 8.5 L29.5 12 V19.5 C29.5 25.6 25.5 30 20 32 C14.5 30 10.5 25.6 10.5 19.5 V12 Z" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M15.8 20.2 L18.8 23.2 L24.4 17.4" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
export function Wordmark() {
  return <span className="font-serif text-[24px] leading-none tracking-[-0.01em] text-ink">Claim Defender</span>
}

/* ---------- speech ---------- */
function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices?.() || []
  const want = lang === 'hi' ? 'hi' : 'en'
  return voices.find((v) => (v.lang || '').toLowerCase().replace('_', '-') === `${want}-in`) || voices.find((v) => (v.lang || '').toLowerCase().startsWith(want)) || null
}
export function useSpeaker() {
  const [speaking, setSpeaking] = useState(false)
  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch (e) {} }, [])
  const speak = (text, lang) => {
    const synth = window.speechSynthesis
    if (!synth) return false
    try {
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
      const v = pickVoice(lang); if (v) u.voice = v
      u.rate = 0.95
      u.onend = u.onerror = () => setSpeaking(false)
      setSpeaking(true); synth.speak(u); return true
    } catch (e) { setSpeaking(false); return false }
  }
  const stop = () => { try { window.speechSynthesis?.cancel() } catch (e) {} setSpeaking(false) }
  return { speaking, speak, stop }
}

export function ListenButton({ getText, lang, onFail, className = '' }) {
  const { t } = useLang()
  const sp = useSpeaker()
  const click = () => {
    if (sp.speaking) return sp.stop()
    if (!sp.speak(getText(), lang)) onFail?.(t('Reading aloud is not available in this browser.', 'इस ब्राउज़र में पढ़कर सुनाना उपलब्ध नहीं है।'))
  }
  return (
    <button onClick={click} aria-label={sp.speaking ? t('Stop reading', 'पढ़ना रोकें') : t('Listen to this page', 'यह पेज सुनें')}
      className={`h-11 px-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface text-[15px] font-medium text-ink hover:border-[#D9D3C8] transition-colors shrink-0 ${className}`}>
      {sp.speaking ? <Square size={15} fill="currentColor" /> : <Volume2 size={18} />}
      {sp.speaking ? t('Stop', 'रोकें') : t('Listen', 'सुनें')}
    </button>
  )
}

/* ---------- motion helpers ---------- */
export function useCountUp(value, { dur = 800, fromZero = true } = {}) {
  const [v, setV] = useState(fromZero ? 0 : value)
  const from = useRef(fromZero ? 0 : value)
  useEffect(() => {
    const start = performance.now(), a = from.current
    let raf
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3)
      const cur = a + (value - a) * e
      setV(cur); from.current = cur
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return Math.round(v)
}

export function ProgressRing({ value, max = 100, size = 88, stroke = 8, color = '#0F766E', track = '#ECE8E1', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => setP(Math.min(1, value / max))); return () => cancelAnimationFrame(id) }, [value, max])
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: 'stroke-dashoffset 600ms ease, stroke 300ms ease' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

/* ---------- primitives ---------- */
export function Button({ children, onClick, variant = 'primary', icon: Icon, iconRight: IconR, disabled, className = '', as, href, size = 'md', ...rest }) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[.98] disabled:opacity-45 disabled:pointer-events-none ${size === 'lg' ? 'h-14 px-7 text-[17px]' : 'h-12 px-6 text-[16px]'}`
  const styles = {
    primary: 'bg-em text-white hover:bg-em-dark shadow-[0_1px_2px_rgba(15,118,110,.25),0_6px_16px_rgba(15,118,110,.18)]',
    secondary: 'bg-surface text-ink border border-line hover:border-[#D9D3C8] hover:bg-[#FDFCFA]',
    ghost: 'text-em hover:bg-em-tint h-11 px-4',
    success: 'bg-green text-white hover:bg-green-ink',
  }
  const cls = `${base} ${styles[variant]} ${className}`
  const inner = <>{Icon && <Icon size={19} />}{children}{IconR && <IconR size={19} />}</>
  if (as === 'a') return <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls} {...rest}>{inner}</a>
  return <button onClick={onClick} disabled={disabled} className={cls} {...rest}>{inner}</button>
}

export function Card({ children, className = '', pad = true, ...rest }) {
  return <div className={`bg-surface border border-line rounded-card shadow-card ${pad ? 'p-6' : ''} ${className}`} {...rest}>{children}</div>
}

export const TONES = {
  amber: { fg: 'text-amber-ink', solid: 'text-amber', bg: 'bg-amber-tint', dot: 'bg-amber', border: 'border-amber/40', hex: '#D97706' },
  red: { fg: 'text-red-ink', solid: 'text-red', bg: 'bg-red-tint', dot: 'bg-red', border: 'border-red/35', hex: '#DC2626' },
  green: { fg: 'text-green-ink', solid: 'text-green', bg: 'bg-green-tint', dot: 'bg-green', border: 'border-green/35', hex: '#16A34A' },
  em: { fg: 'text-em', solid: 'text-em', bg: 'bg-em-tint', dot: 'bg-em', border: 'border-em/35', hex: '#0F766E' },
  grey: { fg: 'text-ink2', solid: 'text-ink2', bg: 'bg-soft', dot: 'bg-ink2', border: 'border-line', hex: '#6B6F76' },
}
export function Chip({ tone = 'grey', children, className = '' }) {
  const c = TONES[tone]
  return (
    <span className={`inline-flex items-center gap-2 h-7 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap ${c.bg} ${c.fg} ${className}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />{children}
    </span>
  )
}

export function StatusChip({ status }) {
  const { t } = useLang()
  const map = {
    checking: ['em', t('Checking', 'जाँच जारी')],
    fix: ['amber', t('Needs fixing', 'सुधार बाक़ी')],
    ready: ['green', t('Ready', 'तैयार')],
    submitted: ['em', t('Submitted', 'जमा किया')],
    rejected: ['red', t('Rejected', 'नामंज़ूर')],
    appeal: ['amber', t('Appeal sent', 'अपील भेजी')],
    paid: ['green', t('Paid', 'भुगतान हुआ')],
  }
  const [tone, label] = map[status]
  return <Chip tone={tone}>{label}</Chip>
}

/* ---------- sample document thumbnails ---------- */
export function DocThumb({ kind = 'bill', w = 44 }) {
  const head = { bill: '#0F766E', policy: '#14161A', discharge: '#6B6F76', pharmacy: '#DC2626', lab: '#7C5CC4', id: '#D97706', bank: '#2F6FA8', letter: '#B11F1F', form: '#0F766E', corrected: '#16A34A' }[kind] || '#6B6F76'
  return (
    <svg width={w} height={Math.round(w * 1.3)} viewBox="0 0 60 78" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="58" height="76" rx="6" fill="#FFFFFF" stroke="#E2DDD4" strokeWidth="1.5" />
      <rect x="8" y="8" width="18" height="4" rx="2" fill={head} />
      <rect x="40" y="8" width="12" height="4" rx="2" fill="#E2DDD4" />
      {kind === 'id' ? (
        <>
          <rect x="8" y="20" width="16" height="20" rx="3" fill="#F1EEE8" /><circle cx="16" cy="27.5" r="4" fill="#D6D0C5" />
          {[21, 28, 35].map((y) => <rect key={y} x="28" y={y} width="24" height="3" rx="1.5" fill="#E2DDD4" />)}
          <rect x="8" y="48" width="44" height="5" rx="2.5" fill="#F1EEE8" />
        </>
      ) : (
        <>
          {[20, 27, 34, 41, 48].map((y, i) => (
            <g key={y}>
              <rect x="8" y={y} width={i % 2 ? 24 : 30} height="3" rx="1.5" fill="#E2DDD4" />
              {['bill', 'pharmacy', 'corrected'].includes(kind) && <rect x="42" y={y} width="10" height="3" rx="1.5" fill="#E2DDD4" />}
            </g>
          ))}
          <rect x="8" y="58" width="44" height="1.2" fill="#E2DDD4" />
          <rect x="34" y="63" width="18" height="5" rx="2.5" fill={head} opacity=".9" />
        </>
      )}
    </svg>
  )
}

/* ---------- camera overlay (mock) ---------- */
export function CameraOverlay({ kind, title, onDone }) {
  const { t } = useLang()
  const [phase, setPhase] = useState('aim')
  useEffect(() => {
    const a = setTimeout(() => setPhase('flash'), 900), b = setTimeout(() => setPhase('read'), 1250), c = setTimeout(onDone, 1950)
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c) }
  }, [])
  return (
    <div className="fixed inset-0 z-[60] bg-[#0E1013]/95 text-white flex flex-col items-center justify-center fade" role="dialog" aria-label={t('Camera', 'कैमरा')}>
      <div className="text-center mb-8 px-6">
        <div className="text-[20px] font-semibold">{title}</div>
        <div className="text-white/65 text-[15px]">{t('Keep the paper flat and still', 'काग़ज़ को सीधा और स्थिर रखें')}</div>
      </div>
      <div className="relative p-7">
        {['top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl', 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl', 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl', 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl'].map((p) => <span key={p} className={`absolute h-8 w-8 border-white ${p}`} />)}
        <div className="rotate-[-2deg]"><DocThumb kind={kind} w={150} /></div>
      </div>
      <div className="mt-8 h-12 flex items-center gap-2 text-[16px] font-medium">
        {phase === 'read' ? <><Loader2 size={20} className="spin" />{t('Reading the paper…', 'काग़ज़ पढ़ रहे हैं…')}</> : <><Camera size={20} />{t('Taking photo…', 'फ़ोटो ले रहे हैं…')}</>}
      </div>
      {phase === 'flash' && <div className="fixed inset-0 bg-white flash pointer-events-none" />}
    </div>
  )
}

/* ---------- drop zone ---------- */
export function DropZone({ onFiles, onCamera, title, hint, compact = false, children }) {
  const { t } = useLang()
  const [over, setOver] = useState(false)
  const ref = useRef()
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files.length) }}
      className={`rounded-card border-2 border-dashed transition-colors duration-200 text-center ${compact ? 'p-5' : 'p-8 md:p-10'} ${over ? 'border-em bg-em-tint' : 'border-[#DCD6CC] bg-[#FDFCFA]'}`}>
      <div className={`mx-auto grid place-items-center rounded-2xl bg-em-tint text-em ${compact ? 'h-12 w-12' : 'h-16 w-16'}`}><Upload size={compact ? 22 : 28} /></div>
      <div className={`mt-4 font-semibold text-ink ${compact ? 'text-[16px]' : 'text-[18px]'}`}>{title}</div>
      {hint && <div className="mt-1 text-[14px] text-ink2">{hint}</div>}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" icon={Upload} onClick={() => ref.current?.click()}>{t('Choose files', 'फ़ाइलें चुनें')}</Button>
        <Button variant="secondary" icon={Camera} onClick={onCamera}>{t('Take a photo', 'फ़ोटो लें')}</Button>
      </div>
      <input ref={ref} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files.length); e.target.value = '' }} />
      {children}
    </div>
  )
}

/* ---------- navigation ---------- */
export function navItems(t) {
  return [
    ['home', Home, t('Home', 'होम'), t('Home', 'होम')],
    ['check', ShieldCheck, t('Check a claim', 'क्लेम जाँचें'), t('Check', 'जाँचें')],
    ['appeals', Scale, t('Appeals', 'अपील'), t('Appeals', 'अपील')],
    ['claims', ListChecks, t('My claims', 'मेरे क्लेम'), t('Claims', 'क्लेम')],
    ['help', HelpCircle, t('Help', 'मदद'), t('Help', 'मदद')],
  ]
}

function LangSwitch({ lang, setLang, compact }) {
  const opts = compact ? [['en', 'EN'], ['hi', 'हि']] : [['en', 'English'], ['hi', 'हिंदी']]
  return (
    <div className={`flex rounded-full bg-soft p-1 ${compact ? 'flex-col gap-1' : ''}`} role="group" aria-label="Language">
      {opts.map(([k, l]) => (
        <button key={k} onClick={() => setLang(k)} aria-pressed={lang === k}
          className={`h-9 rounded-full text-[14px] font-semibold transition-all duration-200 ${compact ? 'w-11' : 'flex-1 px-3'} ${lang === k ? 'bg-surface text-ink shadow-card' : 'text-ink2 hover:text-ink'}`}>{l}</button>
      ))}
    </div>
  )
}

export function Sidebar({ active, go, lang, setLang }) {
  const { t } = useLang()
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] flex-col border-r border-line bg-[#F6F3EE] px-5 py-6 z-30">
      <button onClick={() => go('home')} className="flex items-center gap-3 px-2 h-11"><Logo size={34} /><Wordmark /></button>
      <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
        {navItems(t).map(([k, Icon, label]) => {
          const on = active === k
          return (
            <button key={k} onClick={() => go(k)} aria-current={on ? 'page' : undefined}
              className={`h-11 px-3 rounded-xl flex items-center gap-3 text-[15px] font-medium transition-colors duration-200 ${on ? 'bg-surface text-ink shadow-card border border-line' : 'text-ink2 hover:text-ink hover:bg-surface/60 border border-transparent'}`}>
              <Icon size={19} className={on ? 'text-em' : ''} />{label}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <div className="text-[13px] text-ink2">{t('Free for families', 'परिवारों के लिए मुफ़्त')}</div>
          <div className="mt-1 text-[14px] text-ink leading-snug">{t('Your papers are read to check your claim, then deleted.', 'आपके काग़ज़ सिर्फ़ जाँच के लिए पढ़े जाते हैं, फिर मिटा दिए जाते हैं।')}</div>
        </div>
        <LangSwitch lang={lang} setLang={setLang} />
        <div className="flex items-center gap-3 px-1">
          <span className="h-10 w-10 rounded-full bg-em-tint text-em grid place-items-center text-[14px] font-semibold">SD</span>
          <div className="leading-tight"><div className="text-[15px] font-semibold">{t('Sunita Devi', 'सुनीता देवी')}</div><div className="text-[13px] text-ink2">{t('Karnal, Haryana', 'करनाल, हरियाणा')}</div></div>
        </div>
      </div>
    </aside>
  )
}

export function Rail({ active, go, lang, setLang }) {
  const { t } = useLang()
  return (
    <aside className="hidden md:flex lg:hidden fixed inset-y-0 left-0 w-[84px] flex-col items-center border-r border-line bg-[#F6F3EE] py-5 z-30">
      <button onClick={() => go('home')} aria-label="Claim Defender home"><Logo size={36} /></button>
      <nav className="mt-7 flex flex-col gap-2" aria-label="Main">
        {navItems(t).map(([k, Icon, label, short]) => {
          const on = active === k
          return (
            <button key={k} onClick={() => go(k)} aria-current={on ? 'page' : undefined} aria-label={label} title={label}
              className={`w-[68px] h-[60px] rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 ${on ? 'bg-surface text-ink shadow-card border border-line' : 'text-ink2 hover:text-ink border border-transparent'}`}>
              <Icon size={20} className={on ? 'text-em' : ''} />{short}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-4">
        <LangSwitch lang={lang} setLang={setLang} compact />
        <span className="h-10 w-10 rounded-full bg-em-tint text-em grid place-items-center text-[14px] font-semibold" title="Sunita Devi">SD</span>
      </div>
    </aside>
  )
}

export function TopBar({ lang, setLang, go }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-bg/95 backdrop-blur-0 border-b border-line">
      <div className="h-16 px-4 flex items-center justify-between gap-3">
        <button onClick={() => go('home')} className="flex items-center gap-2.5 h-11"><Logo size={30} /><Wordmark /></button>
        <div className="w-[150px]"><LangSwitch lang={lang} setLang={setLang} /></div>
      </div>
    </header>
  )
}

export function BottomNav({ active, go }) {
  const { t } = useLang()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line grid grid-cols-5 pb-[env(safe-area-inset-bottom)]" aria-label="Main">
      {navItems(t).map(([k, Icon, , short]) => {
        const on = active === k
        return (
          <button key={k} onClick={() => go(k)} aria-current={on ? 'page' : undefined}
            className={`h-16 flex flex-col items-center justify-center gap-1 text-[12px] font-medium ${on ? 'text-em' : 'text-ink2'}`}>
            <Icon size={22} />{short}
          </button>
        )
      })}
    </nav>
  )
}

export function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="fixed left-1/2 md:left-[calc(50%+42px)] lg:left-[calc(50%+130px)] bottom-24 md:bottom-8 z-[70] w-[min(440px,calc(100%-32px))] toast" role="status">
      <div className="bg-ink text-white rounded-2xl px-5 py-3.5 text-[15px] leading-snug shadow-lift">{msg}</div>
    </div>
  )
}

export function Sheet({ onClose, children, title }) {
  return (
    <div className="fixed inset-0 z-[55] flex items-end md:items-center justify-center p-0 md:p-6">
      <button className="absolute inset-0 bg-ink/40 fade" onClick={onClose} aria-label="Close" />
      <div className="relative w-full md:max-w-[480px] bg-surface rounded-t-[24px] md:rounded-card p-6 rise" role="dialog" aria-label={title}>{children}</div>
    </div>
  )
}

export function PageHead({ title, sub, onBack, listenText, lang, onToast, right }) {
  const { t } = useLang()
  return (
    <div className="mb-8">
      {onBack && (
        <button onClick={onBack} className="-ml-2 mb-3 h-11 px-2 inline-flex items-center gap-1.5 text-[15px] font-medium text-ink2 hover:text-ink rounded-full">
          <ArrowLeft size={18} />{t('Back', 'पीछे')}
        </button>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-[720px]">
          <h1 className={`text-ink ${lang === 'hi' ? 'font-sans font-semibold text-[30px] md:text-[36px] leading-[1.25] tracking-tight' : 'font-serif text-[38px] md:text-[46px] leading-[1.05] tracking-[-0.01em]'}`}>{title}</h1>
          {sub && <p className="mt-2 text-[17px] text-ink2">{sub}</p>}
        </div>
        <div className="flex items-center gap-2">{right}{listenText && <ListenButton getText={listenText} lang={lang} onFail={onToast} />}</div>
      </div>
    </div>
  )
}
