import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  ArrowLeft, Volume2, Square, Mic, Camera, Check, Home, ListChecks, HelpCircle,
  CheckCircle2, AlertTriangle, XCircle, Clock, Send, FileText, IndianRupee, Loader2,
} from 'lucide-react'

/* ---------- language ---------- */
export const LangCtx = createContext({ lang: 'en', t: (en) => en })
export const useLang = () => useContext(LangCtx)
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN')

/* ---------- logo ---------- */
export function Logo({ size = 40, light = false }) {
  const fill = light ? '#FFFFFF' : '#1E3A8A'
  const tick = light ? '#1E3A8A' : '#FFFFFF'
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 3 L41 9.5 V22.5 C41 33.5 33.7 41.6 24 45 C14.3 41.6 7 33.5 7 22.5 V9.5 Z" fill={fill} />
      <path d="M15.5 24.5 L21.5 30.5 L33 18.5" fill="none" stroke={tick} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- speech (Listen) ---------- */
function pickVoice(lang) {
  const synth = window.speechSynthesis
  if (!synth) return null
  const voices = synth.getVoices() || []
  const want = lang === 'hi' ? 'hi' : 'en'
  return (
    voices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-') === (want === 'hi' ? 'hi-in' : 'en-in')) ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(want)) ||
    null
  )
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
      const v = pickVoice(lang)
      if (v) u.voice = v
      u.rate = 0.92
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      setSpeaking(true)
      synth.speak(u)
      return true
    } catch (e) { setSpeaking(false); return false }
  }
  const stop = () => { try { window.speechSynthesis?.cancel() } catch (e) {} setSpeaking(false) }
  return { speaking, speak, stop }
}

/* ---------- header ---------- */
export function Header({ onBack, lang, setLang, speaker, readTarget, onToast }) {
  const { t } = useLang()
  const listen = () => {
    if (speaker.speaking) return speaker.stop()
    const el = readTarget.current
    const text = el ? el.innerText.replace(/\s+\n/g, '\n').replace(/[│·]/g, ', ') : ''
    const ok = speaker.speak(text, lang)
    if (!ok) onToast(t('Reading aloud is not available on this phone.', 'इस फ़ोन पर पढ़कर सुनाना उपलब्ध नहीं है।'))
  }
  return (
    <header className="sticky top-0 z-30 bg-trust text-white">
      <div className="flex items-center gap-2 px-3 h-16">
        {onBack ? (
          <button onClick={onBack} className="h-12 w-12 -ml-1 grid place-items-center rounded-full active:bg-white/15" aria-label={t('Go back', 'पीछे जाएँ')}>
            <ArrowLeft size={26} strokeWidth={2.4} />
          </button>
        ) : (
          <div className="h-12 w-10 grid place-items-center"><Logo size={32} light /></div>
        )}
        {onBack && <Logo size={28} light />}
        <div className="flex-1 min-w-0 font-semibold text-[17px] leading-tight truncate"><span className="hidden min-[400px]:inline">Claim Defender</span></div>
        <button
          onClick={listen}
          className="h-12 px-3 flex items-center gap-1.5 rounded-full border-2 border-white/40 active:bg-white/15 text-[15px] font-semibold"
          aria-label={speaker.speaking ? t('Stop reading', 'पढ़ना रोकें') : t('Listen to this screen', 'यह स्क्रीन सुनें')}
        >
          {speaker.speaking ? <Square size={18} fill="currentColor" /> : <Volume2 size={20} />}
          <span>{speaker.speaking ? t('Stop', 'रोकें') : t('Listen', 'सुनें')}</span>
        </button>
        <div className="flex h-12 rounded-full bg-trust-dark p-1" role="group" aria-label="Language">
          {[['hi', 'हिंदी'], ['en', 'Eng']].map(([k, label]) => (
            <button
              key={k}
              onClick={() => { speaker.stop(); setLang(k) }}
              aria-pressed={lang === k}
              className={`px-2.5 rounded-full text-[15px] font-semibold transition-colors duration-200 ${lang === k ? 'bg-white text-trust' : 'text-white/85'}`}
            >{label}</button>
          ))}
        </div>
      </div>
    </header>
  )
}

/* ---------- bottom nav ---------- */
export function BottomNav({ active, go }) {
  const { t } = useLang()
  const items = [
    ['home', Home, t('Home', 'होम')],
    ['claims', ListChecks, t('My claims', 'मेरे क्लेम')],
    ['help', HelpCircle, t('Help', 'मदद')],
  ]
  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-line grid grid-cols-3" aria-label="Main">
      {items.map(([k, Icon, label]) => {
        const on = active === k
        return (
          <button key={k} onClick={() => go(k)} aria-current={on ? 'page' : undefined}
            className={`h-[68px] flex flex-col items-center justify-center gap-0.5 text-[14px] font-semibold ${on ? 'text-trust' : 'text-ink2'}`}>
            <span className={`h-8 w-14 grid place-items-center rounded-full transition-colors duration-200 ${on ? 'bg-trust-soft' : ''}`}><Icon size={24} strokeWidth={on ? 2.5 : 2} /></span>
            {label}
          </button>
        )
      })}
    </nav>
  )
}

/* ---------- buttons ---------- */
export function Button({ children, onClick, variant = 'primary', icon: Icon, disabled, className = '', as, href, ...rest }) {
  const base = 'w-full min-h-[56px] px-5 rounded-2xl flex items-center justify-center gap-2.5 font-semibold text-[18px] transition-all duration-200 active:scale-[.98]'
  const styles = {
    primary: 'bg-trust text-white shadow-card disabled:bg-[#9AA6C4] disabled:shadow-none',
    secondary: 'bg-white text-trust border-2 border-trust',
    success: 'bg-ok text-white shadow-card',
    ghost: 'text-trust underline underline-offset-4 min-h-[48px]',
  }
  const cls = `${base} ${styles[variant]} ${className}`
  if (as === 'a') return <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls} {...rest}>{Icon && <Icon size={22} />}{children}</a>
  return <button onClick={onClick} disabled={disabled} className={cls} {...rest}>{Icon && <Icon size={22} />}{children}</button>
}

export function Card({ children, className = '', ...rest }) {
  return <div className={`bg-card rounded-card shadow-card ${className}`} {...rest}>{children}</div>
}

/* ---------- status ---------- */
export const tone = {
  ok: { text: 'text-ok', bg: 'bg-ok-soft', border: 'border-ok', Icon: CheckCircle2 },
  warn: { text: 'text-warn', bg: 'bg-warn-soft', border: 'border-warn', Icon: AlertTriangle },
  bad: { text: 'text-bad', bg: 'bg-bad-soft', border: 'border-bad', Icon: XCircle },
  info: { text: 'text-trust', bg: 'bg-trust-soft', border: 'border-trust', Icon: Clock },
}

export function StatusChip({ status }) {
  const { t } = useLang()
  const map = {
    checking: ['info', Clock, t('Checking', 'जाँच हो रही है')],
    ready: ['ok', CheckCircle2, t('Ready', 'तैयार')],
    submitted: ['info', Send, t('Submitted', 'जमा किया')],
    rejected: ['bad', XCircle, t('Rejected', 'नामंज़ूर')],
    appeal: ['warn', FileText, t('Appeal sent', 'अपील भेजी')],
    paid: ['ok', IndianRupee, t('Paid', 'भुगतान हुआ')],
  }
  const [k, Icon, label] = map[status]
  const c = tone[k]
  return (
    <span className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[15px] font-semibold ${c.bg} ${c.text}`}>
      <Icon size={17} strokeWidth={2.4} />{label}
    </span>
  )
}

/* ---------- mic (mock) ---------- */
export function MicButton({ onResult, sample, size = 'lg', label }) {
  const { t } = useLang()
  const [state, setState] = useState('idle')
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  const start = () => {
    if (state !== 'idle') return
    setState('listening')
    timer.current = setTimeout(() => { setState('idle'); onResult(sample) }, 1800)
  }
  const big = size === 'lg'
  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={start} aria-label={label || 'Bolkar bataiye / Speak'}
        className={`relative isolate rounded-full bg-trust text-white grid place-items-center shadow-card ${big ? 'h-24 w-24' : 'h-16 w-16'} ${state === 'listening' ? 'listening' : ''}`}>
        <Mic size={big ? 40 : 28} strokeWidth={2.2} />
      </button>
      <div className="text-center leading-snug">
        <div className="font-semibold text-ink text-[18px]">{state === 'listening' ? t('Listening…', 'सुन रहे हैं…') : (label || 'Bolkar bataiye / Speak')}</div>
        {state === 'listening' && <div className="text-ink2 text-[15px]">{t('Speak now', 'अब बोलिए')}</div>}
      </div>
    </div>
  )
}

/* ---------- sample document thumbnails ---------- */
export function DocThumb({ kind = 'bill', w = 52 }) {
  const h = Math.round(w * 1.3)
  const head = { bill: '#1E3A8A', policy: '#15803D', discharge: '#4B5563', pharmacy: '#B91C1C', lab: '#6B4FA0', id: '#B45309', bank: '#0F6E7A', letter: '#B91C1C', form: '#1E3A8A', corrected: '#15803D' }[kind] || '#4B5563'
  return (
    <svg width={w} height={h} viewBox="0 0 60 78" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="58" height="76" rx="5" fill="#FFFFFF" stroke="#D6D3CC" strokeWidth="1.5" />
      <rect x="1" y="1" width="58" height="14" rx="5" fill={head} />
      <rect x="1" y="9" width="58" height="6" fill={head} />
      <rect x="7" y="6" width="22" height="3.5" rx="1.5" fill="#FFFFFF" opacity=".9" />
      {kind === 'id' ? (
        <>
          <rect x="7" y="22" width="16" height="20" rx="2" fill="#E5E3DD" />
          <circle cx="15" cy="29" r="4" fill="#B8B4AA" />
          <rect x="27" y="23" width="25" height="3" rx="1.5" fill="#C9C6BE" />
          <rect x="27" y="30" width="20" height="3" rx="1.5" fill="#C9C6BE" />
          <rect x="27" y="37" width="23" height="3" rx="1.5" fill="#C9C6BE" />
          <rect x="7" y="50" width="45" height="5" rx="2" fill="#E5E3DD" />
        </>
      ) : (
        <>
          {[22, 29, 36, 43, 50].map((y, i) => (
            <g key={y}>
              <rect x="7" y={y} width={i % 2 ? 26 : 32} height="3" rx="1.5" fill="#C9C6BE" />
              {(kind === 'bill' || kind === 'pharmacy' || kind === 'corrected') && <rect x="42" y={y} width="11" height="3" rx="1.5" fill="#C9C6BE" />}
            </g>
          ))}
          <rect x="7" y="60" width="46" height="1.5" fill="#C9C6BE" />
          <rect x="32" y="65" width="21" height="5" rx="2" fill={head} opacity=".85" />
        </>
      )}
    </svg>
  )
}

/* ---------- camera overlay (mock capture) ---------- */
export function CameraOverlay({ kind, title, onDone }) {
  const { t } = useLang()
  const [phase, setPhase] = useState('aim')
  useEffect(() => {
    const a = setTimeout(() => setPhase('flash'), 1000)
    const b = setTimeout(() => setPhase('read'), 1350)
    const c = setTimeout(() => onDone(), 2100)
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c) }
  }, [])
  return (
    <div className="absolute inset-0 z-50 bg-[#0B0F19] text-white flex flex-col fade" role="dialog" aria-label={t('Camera', 'कैमरा')}>
      <div className="px-5 pt-6 text-center">
        <div className="text-[20px] font-semibold">{title}</div>
        <div className="text-white/75 text-[16px]">{t('Keep the paper flat and still', 'काग़ज़ को सीधा और स्थिर रखें')}</div>
      </div>
      <div className="flex-1 grid place-items-center relative">
        <div className="relative p-6">
          <div className="absolute inset-0 border-[3px] border-white/80 rounded-2xl" />
          <div className="absolute -inset-1 grid">
            {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((p) => (
              <span key={p} className={`absolute h-7 w-7 border-white rounded-sm ${p}`} />
            ))}
          </div>
          <div className="rotate-[-2deg]"><DocThumb kind={kind} w={150} /></div>
        </div>
        {phase === 'flash' && <div className="absolute inset-0 bg-white flash" />}
      </div>
      <div className="pb-10 flex flex-col items-center gap-3">
        {phase === 'read' ? (
          <div className="flex items-center gap-2 text-[18px] font-semibold"><Loader2 className="spin" size={22} />{t('Reading the paper…', 'काग़ज़ पढ़ रहे हैं…')}</div>
        ) : (
          <>
            <div className="h-20 w-20 rounded-full border-4 border-white grid place-items-center"><div className="h-14 w-14 rounded-full bg-white" /></div>
            <div className="text-white/80 text-[16px]">{t('Taking photo…', 'फ़ोटो ले रहे हैं…')}</div>
          </>
        )}
      </div>
    </div>
  )
}

/* ---------- small bits ---------- */
export function CameraBtn({ onClick, label }) {
  return (
    <button onClick={onClick} aria-label={label}
      className="h-14 w-14 shrink-0 rounded-2xl bg-trust text-white grid place-items-center active:scale-95 transition-transform shadow-card">
      <Camera size={26} />
    </button>
  )
}

export function Tick({ className = '' }) {
  return <span className={`h-14 w-14 shrink-0 rounded-2xl bg-ok-soft text-ok grid place-items-center pop ${className}`}><Check size={30} strokeWidth={3} /></span>
}

export function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="absolute left-1/2 bottom-[88px] z-50 w-[calc(100%-32px)] toast" role="status">
      <div className="bg-ink text-white rounded-2xl px-4 py-3 text-[16px] leading-snug shadow-card">{msg}</div>
    </div>
  )
}

export function Sheet({ onClose, children, title }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button className="absolute inset-0 bg-black/45 fade" onClick={onClose} aria-label="Close" />
      <div className="relative bg-white rounded-t-[24px] p-5 pb-7 sheet max-h-[85%] overflow-y-auto" role="dialog" aria-label={title}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}
