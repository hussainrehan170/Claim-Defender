import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ShieldCheck, FileSearch, ListChecks, Hospital, Bike, HeartHandshake, Wheat, FileQuestion,
  ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Download, Share2, Copy, Mail,
  Upload, Phone, Lock, Info, Building2, CalendarClock, MessageSquareText, FileText, Image as ImageIcon,
  ArrowRight, Scale, Landmark, Loader2, Check, Globe,
} from 'lucide-react'
import {
  LangCtx, useLang, inr, Logo, useSpeaker, Header, BottomNav, Button, Card, tone, StatusChip,
  MicButton, DocThumb, CameraOverlay, CameraBtn, Tick, Toast, Sheet,
} from './ui.jsx'

/* =====================================================================
   DEMO DATA (mock only)
   ===================================================================== */
const CLAIM_TOTAL = 52000
const RISK = { pharmacy: 6800, room: 5600 }
const FINAL_EXPECTED = 51000
const INSURER = {
  name: { en: 'Suraksha Health Insurance (demo)', hi: 'सुरक्षा हेल्थ इंश्योरेंस (डेमो)' },
  email: 'claims@suraksha-health.example',
  address: { en: 'Claims Dept, Plot 21, Sector 44, Gurugram, Haryana 122003', hi: 'क्लेम विभाग, प्लॉट 21, सेक्टर 44, गुरुग्राम, हरियाणा 122003' },
}

const POLICIES = [
  { id: 'health', Icon: Hospital, en: 'Health', hi: 'स्वास्थ्य', sub: { en: 'Hospital bills', hi: 'अस्पताल के बिल' } },
  { id: 'pmsby', Icon: Bike, en: 'Accident – PMSBY', hi: 'दुर्घटना – PMSBY', sub: { en: '₹2 lakh cover', hi: '₹2 लाख कवर' } },
  { id: 'pmjjby', Icon: HeartHandshake, en: 'Life – PMJJBY', hi: 'जीवन – PMJJBY', sub: { en: '₹2 lakh cover', hi: '₹2 लाख कवर' } },
  { id: 'pmfby', Icon: Wheat, en: 'Crop – PMFBY', hi: 'फ़सल – PMFBY', sub: { en: 'Crop loss', hi: 'फ़सल का नुक़सान' } },
  { id: 'other', Icon: FileQuestion, en: 'Other', hi: 'अन्य', sub: { en: 'Any other plan', hi: 'कोई और बीमा' } },
]

// Health checklist (hero flow)
const HEALTH_DOCS = [
  { id: 'policy', kind: 'policy', en: 'Policy card', hi: 'पॉलिसी कार्ड', found: { en: 'Policy card – Family Health Plan – ₹2,00,000 cover', hi: 'पॉलिसी कार्ड – फ़ैमिली हेल्थ प्लान – ₹2,00,000 कवर' } },
  { id: 'bill', kind: 'bill', en: 'Final hospital bill', hi: 'अस्पताल का फ़ाइनल बिल', found: { en: 'Hospital bill – ₹52,000 – City Care Hospital, Karnal', hi: 'अस्पताल बिल – ₹52,000 – सिटी केयर हॉस्पिटल, करनाल' } },
  { id: 'discharge', kind: 'discharge', en: 'Discharge summary', hi: 'डिस्चार्ज समरी (छुट्टी का पर्चा)', found: { en: 'Discharge summary – Ramesh Kumar – 4 days', hi: 'डिस्चार्ज समरी – रमेश कुमार – 4 दिन' } },
  { id: 'pharmacy', kind: 'pharmacy', en: 'Pharmacy bills', hi: 'दवाई के बिल', found: { en: 'Pharmacy bills – ₹6,800 – 9 receipts', hi: 'दवाई के बिल – ₹6,800 – 9 रसीदें' } },
  { id: 'lab', kind: 'lab', en: 'Lab reports', hi: 'जाँच की रिपोर्ट', optional: true, found: { en: 'Lab reports – 3 reports', hi: 'जाँच रिपोर्ट – 3 रिपोर्ट' } },
  { id: 'id', kind: 'id', en: 'ID proof', hi: 'पहचान पत्र', found: { en: 'ID proof – Aadhaar – Sunita Devi', hi: 'पहचान पत्र – आधार – सुनीता देवी' } },
  { id: 'bank', kind: 'bank', en: 'Bank passbook', hi: 'बैंक पासबुक', found: { en: 'Bank passbook – account ending 4417', hi: 'बैंक पासबुक – खाता नंबर के आख़िरी अंक 4417' } },
]
const SIMPLE_DOCS = {
  pmsby: [['Claim form', 'क्लेम फ़ॉर्म', 'form'], ['FIR or police report', 'FIR या पुलिस रिपोर्ट', 'letter'], ['Hospital / doctor certificate', 'अस्पताल / डॉक्टर का प्रमाण-पत्र', 'discharge'], ['ID proof', 'पहचान पत्र', 'id'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
  pmjjby: [['Claim form', 'क्लेम फ़ॉर्म', 'form'], ['Death certificate', 'मृत्यु प्रमाण-पत्र', 'discharge'], ['Nominee ID proof', 'नॉमिनी का पहचान पत्र', 'id'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
  pmfby: [['Crop loss report (within 72 hours)', 'फ़सल नुक़सान की सूचना (72 घंटे में)', 'form'], ['Land record (khasra / khatauni)', 'ज़मीन का रिकॉर्ड (खसरा / खतौनी)', 'policy'], ['Sowing certificate', 'बुआई प्रमाण-पत्र', 'discharge'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
  other: [['Policy paper', 'पॉलिसी का काग़ज़', 'policy'], ['Bills or receipts', 'बिल या रसीदें', 'bill'], ['ID proof', 'पहचान पत्र', 'id'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
}

/* =====================================================================
   APP
   ===================================================================== */
export default function App() {
  const [lang, setLang] = useState('hi')
  const t = (en, hi) => (lang === 'hi' ? hi : en)
  const L = (o) => (o ? o[lang] : '')

  const [stack, setStack] = useState(['welcome'])
  const [dir, setDir] = useState('fwd')
  const screen = stack[stack.length - 1]
  const go = (s) => { setDir('fwd'); setStack((st) => [...st, s]) }
  const back = () => { setDir('back'); setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)) }
  const tab = (s) => { setDir('fwd'); setStack(s === 'home' ? ['home'] : ['home', s]) }

  const [policy, setPolicy] = useState('health')
  const [docs, setDocs] = useState({ policy: true, id: true, bank: true })
  const [simpleDocs, setSimpleDocs] = useState({})
  const [fixes, setFixes] = useState({ pharmacy: false, room: false })
  const [checked, setChecked] = useState(false)
  const [healthStatus, setHealthStatus] = useState(null) // null | checking | ready | submitted
  const [appealSent, setAppealSent] = useState(false)
  const [letterAdded, setLetterAdded] = useState(false)
  const [story, setStory] = useState('')
  const [toast, setToast] = useState('')
  const toastTimer = useRef()
  const showToast = (m) => { clearTimeout(toastTimer.current); setToast(m); toastTimer.current = setTimeout(() => setToast(''), 2800) }

  const speaker = useSpeaker()
  const mainRef = useRef(null)
  useEffect(() => { speaker.stop(); if (mainRef.current) mainRef.current.scrollTop = 0 }, [screen])
  useEffect(() => { document.documentElement.lang = lang === 'hi' ? 'hi' : 'en' }, [lang])

  const pharmacyOk = docs.pharmacy || fixes.pharmacy
  const atRisk = (pharmacyOk ? 0 : RISK.pharmacy) + (fixes.room ? 0 : RISK.room)
  const ready = atRisk === 0
  const expected = ready ? FINAL_EXPECTED : CLAIM_TOTAL - atRisk
  useEffect(() => { if (ready && healthStatus === 'checking') setHealthStatus('ready') }, [ready, healthStatus])

  const restart = () => {
    setDocs({ policy: true, id: true, bank: true }); setSimpleDocs({}); setFixes({ pharmacy: false, room: false })
    setChecked(false); setHealthStatus(null); setAppealSent(false); setLetterAdded(false); setStory(''); setPolicy('health')
    setDir('back'); setStack(['welcome'])
  }
  const ctx = { lang, t, L }
  const tabActive = screen === 'claims' ? 'claims' : screen === 'help' ? 'help' : 'home'
  const P = { t, L, lang, go, back, tab, showToast }

  let body
  switch (screen) {
    case 'welcome': body = <Welcome {...P} setLang={setLang} />; break
    case 'home': body = <HomeScreen {...P} story={story} setStory={setStory} />; break
    case 'choose': body = <Choose {...P} policy={policy} setPolicy={setPolicy} />; break
    case 'docs': body = policy === 'health'
      ? <DocsHealth {...P} docs={docs} setDocs={setDocs} />
      : <DocsSimple {...P} policy={policy} simpleDocs={simpleDocs} setSimpleDocs={setSimpleDocs} setPolicy={setPolicy} />; break
    case 'reading': body = <Reading {...P} onDone={() => { setChecked(true); setHealthStatus(ready ? 'ready' : 'checking'); setDir('fwd'); setStack((st) => [...st.slice(0, -1), 'result']) }} />; break
    case 'result': body = <Result {...P} docs={docs} pharmacyOk={pharmacyOk} fixes={fixes} atRisk={atRisk} expected={expected} ready={ready} />; break
    case 'fix': body = <Fix {...P} pharmacyOk={pharmacyOk} fixes={fixes} setFixes={setFixes} atRisk={atRisk} expected={expected} ready={ready} />; break
    case 'package': body = <Package {...P} docs={docs} fixes={fixes} status={healthStatus} onSubmitted={() => { setHealthStatus('submitted'); tab('claims'); showToast(t('Marked as submitted. We will remind you to check for a reply.', 'जमा हुआ मान लिया। जवाब देखने के लिए हम आपको याद दिलाएँगे।')) }} />; break
    case 'decoder': body = <Decoder {...P} letterAdded={letterAdded} setLetterAdded={setLetterAdded} />; break
    case 'appeal': body = <Appeal {...P} appealSent={appealSent} onSent={() => { setAppealSent(true); tab('claims'); showToast(t('Appeal marked as sent. Next step on 8 Dec 2026 if there is no reply.', 'अपील भेजी गई मान ली। जवाब न आए तो अगला क़दम 8 दिसंबर 2026 को।')) }} />; break
    case 'claims': body = <Claims {...P} healthStatus={healthStatus} appealSent={appealSent} checked={checked} ready={ready} />; break
    case 'help': body = <Help {...P} restart={restart} />; break
    default: body = null
  }

  return (
    <LangCtx.Provider value={ctx}>
      <div className="min-h-[100dvh] flex justify-center">
        <div className="relative w-full max-w-[420px] h-[100dvh] bg-bg flex flex-col overflow-hidden sm:shadow-[0_0_0_1px_#DDD9D0,0_12px_40px_rgba(17,24,39,.12)]">
          <Header onBack={stack.length > 1 && screen !== 'home' ? back : null} lang={lang} setLang={setLang} speaker={speaker} readTarget={mainRef} onToast={showToast} />
          <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar">
            <div key={screen + lang} className={`px-4 pt-5 pb-8 ${dir === 'back' ? 'screen-back' : 'screen-in'}`}>{body}</div>
          </main>
          {screen !== 'welcome' && <BottomNav active={tabActive} go={tab} />}
          <Toast msg={toast} />
        </div>
      </div>
    </LangCtx.Provider>
  )
}

/* =====================================================================
   SCREENS
   ===================================================================== */
function H1({ children, sub }) {
  return (
    <div className="mb-5">
      <h1 className="text-[26px] leading-[1.25] font-bold text-ink">{children}</h1>
      {sub && <p className="mt-1.5 text-ink2 text-[18px]">{sub}</p>}
    </div>
  )
}

/* ---------- 1. Welcome ---------- */
function Welcome({ t, go, setLang }) {
  const pick = (l) => { setLang(l); go('home') }
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <div className="h-28 w-28 rounded-[32px] bg-white shadow-card grid place-items-center breathe"><Logo size={72} /></div>
      <div className="mt-5 text-[30px] font-bold text-ink">Claim Defender</div>
      <p className="mt-2 text-[22px] leading-snug font-semibold text-trust max-w-[300px]">{t("Get the insurance money you're owed", 'आपके बीमे का पूरा पैसा, आपके हाथ में')}</p>
      <p className="mt-3 text-ink2 text-[17px] max-w-[300px]">{t('We check your papers before you send them, and help if a claim is rejected.', 'भेजने से पहले हम आपके काग़ज़ जाँचते हैं, और क्लेम रुकने पर मदद करते हैं।')}</p>

      <div className="w-full mt-8 text-left">
        <div className="text-ink2 text-[17px] font-semibold mb-3 text-center">{t('Choose your language', 'अपनी भाषा चुनें')} · Choose your language</div>
        <div className="flex flex-col gap-3">
          <button onClick={() => pick('hi')} className="min-h-[64px] rounded-2xl bg-trust text-white text-[24px] font-bold shadow-card flex items-center justify-center gap-3 active:scale-[.98] transition-transform">हिंदी</button>
          <button onClick={() => pick('en')} className="min-h-[64px] rounded-2xl bg-white text-trust border-2 border-trust text-[22px] font-bold flex items-center justify-center gap-3 active:scale-[.98] transition-transform">English</button>
          <button disabled className="min-h-[64px] rounded-2xl bg-[#EFEDE8] text-ink2 text-[19px] font-semibold flex flex-col items-center justify-center">
            <span className="flex items-center gap-2"><Globe size={20} />{t('More languages', 'और भाषाएँ')}</span>
            <span className="text-[14px] font-medium">{t('Coming soon · Punjabi, Marathi, Bengali', 'जल्द आ रही हैं · पंजाबी, मराठी, बांग्ला')}</span>
          </button>
        </div>
      </div>
      <p className="mt-6 text-[14px] text-ink2 flex items-center gap-1.5"><Lock size={15} />{t('Your papers stay private. Free for families.', 'आपके काग़ज़ सुरक्षित रहते हैं। परिवारों के लिए मुफ़्त।')}</p>
    </div>
  )
}

/* ---------- 2. Home ---------- */
function HomeScreen({ t, go, story, setStory }) {
  const actions = [
    { id: 'choose', Icon: ShieldCheck, en: 'Check my claim before sending', hi: 'भेजने से पहले क्लेम जाँचें', sub: { en: 'Find problems early. Get paid in full.', hi: 'ग़लतियाँ पहले पकड़ें, पूरा पैसा पाएँ।' }, primary: true },
    { id: 'decoder', Icon: FileSearch, en: 'My claim was rejected or cut', hi: 'मेरा क्लेम रुका या कम मिला', sub: { en: 'Understand the letter. Appeal for free.', hi: 'चिट्ठी समझें, मुफ़्त में अपील करें।' } },
    { id: 'claims', Icon: ListChecks, en: 'My claims', hi: 'मेरे क्लेम', sub: { en: 'See status and next steps', hi: 'स्थिति और अगला क़दम देखें' } },
  ]
  return (
    <>
      <div className="mb-5">
        <div className="text-[28px] font-bold text-ink leading-tight">{t('Namaste, Sunita ji', 'नमस्ते, सुनीता जी')}</div>
        <p className="text-ink2 text-[18px] mt-1">{t('What do you need help with today?', 'आज किस काम में मदद चाहिए?')}</p>
      </div>
      <div className="flex flex-col gap-3">
        {actions.map((a) => (
          <button key={a.id} onClick={() => go(a.id)}
            className={`text-left rounded-card p-4 flex items-center gap-4 min-h-[96px] active:scale-[.98] transition-transform shadow-card ${a.primary ? 'bg-trust text-white' : 'bg-white text-ink'}`}>
            <span className={`h-14 w-14 shrink-0 rounded-2xl grid place-items-center ${a.primary ? 'bg-white/15' : 'bg-trust-soft text-trust'}`}><a.Icon size={30} /></span>
            <span className="flex-1">
              <span className="block text-[19px] font-bold leading-snug">{t(a.en, a.hi)}</span>
              <span className={`block text-[16px] mt-0.5 ${a.primary ? 'text-white/85' : 'text-ink2'}`}>{t(a.sub.en, a.sub.hi)}</span>
            </span>
            <ChevronRight size={24} className={a.primary ? 'text-white' : 'text-ink2'} />
          </button>
        ))}
      </div>

      <Card className="mt-6 p-5 flex flex-col items-center gap-4">
        <MicButton label={t('Tell us what happened', 'बताइए क्या हुआ')}
          sample={t('My husband was in City Care Hospital for 4 days. The bill is ₹52,000. I want to claim it from our health insurance.', 'मेरे पति 4 दिन सिटी केयर हॉस्पिटल में भर्ती थे। बिल ₹52,000 का है। मुझे हेल्थ बीमा से क्लेम करना है।')}
          onResult={setStory} />
        <p className="text-ink2 text-[15px] -mt-2">Bolkar bataiye / Speak</p>
        {story && (
          <div className="w-full fade">
            <div className="bg-bg rounded-2xl p-4 text-[17px] text-ink flex gap-3">
              <MessageSquareText size={22} className="text-trust shrink-0 mt-0.5" />
              <span>“{story}”</span>
            </div>
            <Button className="mt-3" icon={ShieldCheck} onClick={() => go('choose')}>{t('Check this claim', 'यह क्लेम जाँचें')}</Button>
          </div>
        )}
      </Card>
    </>
  )
}

/* ---------- 3. Choose insurance ---------- */
function Choose({ t, go, policy, setPolicy }) {
  return (
    <>
      <H1 sub={t('Tap the insurance you are claiming from.', 'जिस बीमे से क्लेम करना है, उस पर दबाएँ।')}>{t('Choose your insurance', 'अपना बीमा चुनें')}</H1>
      <div className="grid grid-cols-2 gap-3">
        {POLICIES.map((p, i) => (
          <button key={p.id} onClick={() => { setPolicy(p.id); go('docs') }}
            className={`bg-white rounded-card shadow-card p-4 min-h-[148px] flex flex-col items-start justify-between text-left active:scale-[.97] transition-transform border-2 ${policy === p.id ? 'border-trust' : 'border-transparent'} ${i === 4 ? 'col-span-2 min-h-[96px] flex-row items-center gap-4 justify-start' : ''}`}>
            <span className="h-14 w-14 rounded-2xl bg-trust-soft text-trust grid place-items-center"><p.Icon size={30} /></span>
            <span>
              <span className="block text-[19px] font-bold text-ink leading-snug">{t(p.en, p.hi)}</span>
              <span className="block text-[15px] text-ink2">{t(p.sub.en, p.sub.hi)}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="mt-5 text-ink2 text-[16px] flex gap-2"><Info size={20} className="shrink-0 mt-0.5" />{t('Not sure? Look at the top of your policy card, or ask us in Help.', 'पता नहीं? अपने पॉलिसी कार्ड के ऊपर देखें, या मदद में पूछें।')}</p>
    </>
  )
}

/* ---------- 4a. Add documents (Health) ---------- */
function DocsHealth({ t, L, go, docs, setDocs }) {
  const [cam, setCam] = useState(null)
  const count = HEALTH_DOCS.filter((d) => docs[d.id]).length
  const canCheck = docs.bill && docs.discharge && docs.policy
  return (
    <>
      <H1 sub={t('Take a photo of each paper. We read it for you.', 'हर काग़ज़ की फ़ोटो लें। हम उसे आपके लिए पढ़ेंगे।')}>{t('Add your documents', 'अपने काग़ज़ जोड़ें')}</H1>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between text-[18px] font-semibold">
          <span>{t(`${count} of 7 added`, `7 में से ${count} जुड़े`)}</span>
          <span className="text-ink2 text-[15px]">{t('Health claim', 'स्वास्थ्य क्लेम')}</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-[#ECEAE4] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={7} aria-valuenow={count}>
          <div className="h-full bg-trust rounded-full transition-all duration-300" style={{ width: `${(count / 7) * 100}%` }} />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {HEALTH_DOCS.map((d) => {
          const has = docs[d.id]
          return (
            <Card key={d.id} className={`p-3 flex items-center gap-3 border-2 transition-colors duration-300 ${has ? 'border-ok' : 'border-transparent'}`}>
              <DocThumb kind={d.kind} w={40} />
              <div className="flex-1 min-w-0">
                <div className="text-[18px] font-semibold text-ink leading-snug">{t(d.en, d.hi)}{d.optional && <span className="text-ink2 font-normal text-[15px]"> · {t('if you have', 'अगर हो तो')}</span>}</div>
                {has
                  ? <div className="text-[15px] text-ok font-medium leading-snug flex gap-1"><Check size={17} className="shrink-0 mt-0.5" strokeWidth={3} />{L(d.found)}</div>
                  : <div className="text-[15px] text-ink2">{t('Not added yet', 'अभी नहीं जुड़ा')}</div>}
              </div>
              {has ? <Tick /> : <CameraBtn onClick={() => setCam(d)} label={t(`Take photo of ${d.en}`, `${d.hi} की फ़ोटो लें`)} />}
            </Card>
          )
        })}
      </div>

      <div className="mt-6">
        <Button icon={ShieldCheck} disabled={!canCheck} onClick={() => go('reading')}>{t('Check my documents', 'मेरे काग़ज़ जाँचें')}</Button>
        {!canCheck && <p className="text-center text-ink2 text-[15px] mt-2">{t('Add the hospital bill and discharge summary to start.', 'शुरू करने के लिए अस्पताल का बिल और डिस्चार्ज समरी जोड़ें।')}</p>}
      </div>
      {cam && <CameraOverlay kind={cam.kind} title={t(cam.en, cam.hi)} onDone={() => { setDocs((s) => ({ ...s, [cam.id]: true })); setCam(null) }} />}
    </>
  )
}

/* ---------- 4b. Add documents (other covers) ---------- */
function DocsSimple({ t, L, policy, simpleDocs, setSimpleDocs, setPolicy, showToast, go }) {
  const [cam, setCam] = useState(null)
  const list = SIMPLE_DOCS[policy]
  const p = POLICIES.find((x) => x.id === policy)
  const have = simpleDocs[policy] || {}
  const count = list.filter((_, i) => have[i]).length
  return (
    <>
      <H1 sub={t(p.en, p.hi)}>{t('Add your documents', 'अपने काग़ज़ जोड़ें')}</H1>
      <Card className="p-4 mb-4">
        <div className="text-[18px] font-semibold">{t(`${count} of ${list.length} added`, `${list.length} में से ${count} जुड़े`)}</div>
        <div className="mt-2 h-3 rounded-full bg-[#ECEAE4] overflow-hidden"><div className="h-full bg-trust rounded-full transition-all duration-300" style={{ width: `${(count / list.length) * 100}%` }} /></div>
      </Card>
      <div className="flex flex-col gap-3">
        {list.map(([en, hi, kind], i) => (
          <Card key={en} className={`p-3 flex items-center gap-3 border-2 ${have[i] ? 'border-ok' : 'border-transparent'}`}>
            <DocThumb kind={kind} w={40} />
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-semibold leading-snug">{t(en, hi)}</div>
              <div className={`text-[15px] ${have[i] ? 'text-ok font-medium' : 'text-ink2'}`}>{have[i] ? t('Added and readable', 'जुड़ गया, साफ़ पढ़ा जा रहा है') : t('Not added yet', 'अभी नहीं जुड़ा')}</div>
            </div>
            {have[i] ? <Tick /> : <CameraBtn onClick={() => setCam({ i, kind, title: t(en, hi) })} label={t(en, hi)} />}
          </Card>
        ))}
      </div>
      <Card className="mt-5 p-4 flex gap-3 bg-trust-soft shadow-none">
        <Info size={22} className="text-trust shrink-0 mt-0.5" />
        <p className="text-[16px] text-ink">{t('The full check for this cover is coming soon. Your list of papers is saved, so you can collect them now.', 'इस बीमे की पूरी जाँच जल्द आ रही है। आपकी काग़ज़ों की सूची सेव है, आप अभी से इन्हें इकट्ठा कर सकते हैं।')}</p>
      </Card>
      <div className="mt-5 flex flex-col gap-2">
        <Button icon={Check} onClick={() => showToast(t('List saved. We will remind you.', 'सूची सेव हो गई। हम याद दिलाएँगे।'))}>{t('Save my list', 'मेरी सूची सेव करें')}</Button>
        <Button variant="ghost" onClick={() => { setPolicy('health'); go('docs') }}>{t('Try the Health check instead', 'इसकी जगह स्वास्थ्य जाँच देखें')}</Button>
      </div>
      {cam && <CameraOverlay kind={cam.kind} title={cam.title} onDone={() => { setSimpleDocs((s) => ({ ...s, [policy]: { ...(s[policy] || {}), [cam.i]: true } })); setCam(null) }} />}
    </>
  )
}

/* ---------- 5. Reading ---------- */
function Reading({ t, onDone }) {
  const steps = [
    t('Reading the hospital bill', 'अस्पताल का बिल पढ़ रहे हैं'),
    t('Reading your policy', 'आपकी पॉलिसी पढ़ रहे हैं'),
    t('Matching bill items to policy rules', 'बिल को पॉलिसी के नियमों से मिला रहे हैं'),
    t('Checking missing papers', 'छूटे हुए काग़ज़ देख रहे हैं'),
  ]
  const [n, setN] = useState(0)
  useEffect(() => {
    const ids = steps.map((_, i) => setTimeout(() => setN(i + 1), 950 * (i + 1)))
    const end = setTimeout(onDone, 950 * steps.length + 500)
    return () => { ids.forEach(clearTimeout); clearTimeout(end) }
  }, [])
  return (
    <div className="pt-6">
      <div className="flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-trust-soft grid place-items-center breathe"><Logo size={56} /></div>
        <h1 className="mt-5 text-[26px] font-bold">{t('Reading your documents', 'आपके काग़ज़ पढ़ रहे हैं')}</h1>
        <p className="text-ink2 text-[18px] mt-1">{t('This takes a few seconds. Please wait.', 'इसमें कुछ सेकंड लगेंगे। कृपया रुकिए।')}</p>
      </div>
      <Card className="mt-7 p-2">
        {steps.map((s, i) => {
          const done = n > i, active = n === i
          return (
            <div key={i} className="flex items-center gap-4 px-3 py-3.5">
              <span className={`h-10 w-10 shrink-0 rounded-full grid place-items-center transition-colors duration-300 ${done ? 'bg-ok text-white' : active ? 'bg-trust-soft text-trust' : 'bg-[#EFEDE8] text-ink2'}`}>
                {done ? <Check size={22} strokeWidth={3} className="pop" /> : active ? <Loader2 size={22} className="spin" /> : <span className="text-[16px] font-semibold">{i + 1}</span>}
              </span>
              <span className={`text-[18px] ${done ? 'text-ink font-semibold' : active ? 'text-ink' : 'text-ink2'}`}>{s}</span>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

/* ---------- shared: summary card ---------- */
function SummaryCard({ t, atRisk, expected, ready, problems }) {
  const c = ready ? tone.ok : tone.warn
  return (
    <div className={`rounded-card p-5 border-2 transition-colors duration-500 ${c.bg} ${c.border}`} aria-live="polite">
      <div className={`flex items-center gap-2 font-bold text-[16px] ${c.text}`}>
        <c.Icon size={22} strokeWidth={2.4} />
        {ready ? t('All fixed', 'सब ठीक') : t('Needs attention', 'ध्यान दें')}
      </div>
      {ready ? (
        <div key="ok" className="fade">
          <div className="mt-2 text-[26px] leading-tight font-bold text-ink">{t('Ready to submit', 'जमा करने के लिए तैयार')}</div>
          <div className="mt-1 text-[20px] font-semibold text-ok">{t(`Expected ${inr(expected)}`, `उम्मीद: ${inr(expected)}`)}</div>
        </div>
      ) : (
        <div key="risk" className="fade">
          <div className="mt-2 text-[26px] leading-tight font-bold text-ink">
            {t(<><span className="text-warn">{inr(atRisk)}</span> of your {inr(CLAIM_TOTAL)} claim is at risk</>, <>आपके {inr(CLAIM_TOTAL)} के क्लेम में से <span className="text-warn">{inr(atRisk)}</span> ख़तरे में हैं</>)}
          </div>
          <div className="mt-1.5 text-[18px] text-ink">
            {problems === 2 ? t('2 problems found, both can be fixed', '2 दिक़्क़तें मिलीं, दोनों ठीक हो सकती हैं') : t('1 problem left, it can be fixed', '1 दिक़्क़त बची है, ठीक हो सकती है')}
          </div>
        </div>
      )}
    </div>
  )
}

function PayoutBar({ t, expected, ready }) {
  const pct = (expected / CLAIM_TOTAL) * 100
  const fixPct = (FINAL_EXPECTED / CLAIM_TOTAL) * 100
  return (
    <Card className="p-4">
      <div className="text-[16px] font-semibold text-ink2">{t('Expected payout', 'कितना पैसा मिलने की उम्मीद')}</div>
      <div className="mt-3 relative h-5 rounded-full bg-[#ECEAE4] overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-ok/25 rounded-full" style={{ width: `${fixPct}%` }} />
        <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${ready ? 'bg-ok' : 'bg-trust'}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[17px]">
        <span className="flex items-center gap-2"><span className={`h-3.5 w-3.5 rounded-full ${ready ? 'bg-ok' : 'bg-trust'}`} />{t('Expected now', 'अभी')}: <b>{inr(expected)}</b></span>
        {!ready && <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-ok/40" />{t('After fixing', 'ठीक करने के बाद')}: <b>{t('about', 'लगभग')} {inr(FINAL_EXPECTED)}</b></span>}
      </div>
      <p className="mt-2 text-[14px] text-ink2">{t('Small items like gloves and registration (about ₹1,000) are usually never paid.', 'दस्ताने, रजिस्ट्रेशन जैसी छोटी चीज़ें (लगभग ₹1,000) आमतौर पर नहीं मिलतीं।')}</p>
    </Card>
  )
}

/* ---------- 6. Result ---------- */
function ProblemCard({ kind, title, line, clause, onFix, t }) {
  const [open, setOpen] = useState(false)
  const c = tone[kind]
  const label = { bad: t('Problem', 'दिक़्क़त'), warn: t('Warning', 'चेतावनी') }[kind]
  return (
    <Card className={`p-4 border-l-[6px] ${c.border}`}>
      <div className={`flex items-center gap-2 text-[15px] font-bold ${c.text}`}><c.Icon size={20} strokeWidth={2.4} />{label}</div>
      <div className="mt-1 text-[20px] font-bold leading-snug text-ink">{title}</div>
      <p className="mt-1 text-[17px] text-ink">{line}</p>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="mt-2 min-h-[48px] flex items-center gap-1.5 text-trust font-semibold text-[17px]">
        {t('Why?', 'क्यों?')} <ChevronDown size={20} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="fade bg-bg rounded-xl p-3.5 mb-3 text-[16px] text-ink">
          <div className="flex items-center gap-1.5 text-ink2 text-[14px] font-semibold mb-1"><FileText size={16} />{t('From your policy', 'आपकी पॉलिसी से')}</div>
          {clause}
        </div>
      )}
      <Button onClick={onFix} icon={ArrowRight} className="mt-1">{t('Fix this', 'इसे ठीक करें')}</Button>
    </Card>
  )
}

function OkRow({ children }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 min-h-[56px] shadow-card">
      <CheckCircle2 size={24} className="text-ok shrink-0" strokeWidth={2.4} />
      <span className="text-[17px] text-ink"><b className="text-ok">{'OK'}</b> · {children}</span>
    </div>
  )
}

function Result({ t, go, docs, pharmacyOk, fixes, atRisk, expected, ready }) {
  const problems = (pharmacyOk ? 0 : 1) + (fixes.room ? 0 : 1)
  return (
    <>
      <H1>{t('Your claim check', 'आपके क्लेम की जाँच')}</H1>
      <div className="flex flex-col gap-3">
        <SummaryCard t={t} atRisk={atRisk} expected={expected} ready={ready} problems={problems} />
        <PayoutBar t={t} expected={expected} ready={ready} />

        {!pharmacyOk && (
          <ProblemCard kind="bad" t={t} onFix={() => go('fix')}
            title={t('Pharmacy bill missing', 'दवाई का बिल नहीं है')}
            line={t('Without it, ₹6,800 of medicines will not be paid.', 'इसके बिना ₹6,800 की दवाइयों का पैसा नहीं मिलेगा।')}
            clause={<>{t('“Clause 6.1: Medicines are paid only against original pharmacy bills with the doctor’s prescription.”', '“धारा 6.1: दवाइयों का पैसा सिर्फ़ डॉक्टर के पर्चे के साथ दवाई के असली बिल पर मिलेगा।”')}<br /><span className="text-ink2">{t('Your hospital bill lists medicines worth ₹6,800, but no pharmacy bill was added.', 'आपके अस्पताल बिल में ₹6,800 की दवाइयाँ हैं, पर दवाई का बिल नहीं जुड़ा।')}</span></>} />
        )}
        {!fixes.room && (
          <ProblemCard kind="warn" t={t} onFix={() => go('fix')}
            title={t('Room rent is above your policy limit', 'कमरे का किराया पॉलिसी की सीमा से ज़्यादा है')}
            line={t('The insurer may cut other charges too. Ask the hospital for a corrected bill showing the general ward rate.', 'बीमा कंपनी बाक़ी ख़र्चे भी काट सकती है। अस्पताल से जनरल वार्ड के रेट वाला सही बिल माँगें।')}
            clause={<>{t('“Clause 4.2: Room rent is covered up to 1% of the sum insured per day.”', '“धारा 4.2: कमरे का किराया बीमा राशि के 1% प्रतिदिन तक ही मिलेगा।”')}<br />
              <span className="text-ink2">{t('Your limit is ₹2,000 a day. The room cost ₹3,500 a day for 4 days. Under Clause 4.3, doctor and nursing charges can be cut in the same proportion: about ₹5,600.', 'आपकी सीमा ₹2,000 प्रतिदिन है। कमरा 4 दिन ₹3,500 प्रतिदिन का था। धारा 4.3 के तहत डॉक्टर और नर्सिंग के ख़र्चे भी उसी हिसाब से कट सकते हैं: लगभग ₹5,600।')}</span></>} />
        )}

        <div className="mt-2 text-[16px] font-semibold text-ink2">{t('These are fine', 'ये ठीक हैं')}</div>
        <OkRow>{t('Discharge summary', 'डिस्चार्ज समरी')}</OkRow>
        <OkRow>{t('Policy active on admission date (20 Nov 2026)', 'भर्ती की तारीख़ (20 नवंबर 2026) पर पॉलिसी चालू थी')}</OkRow>
        <OkRow>{t('Hospital bill is clear and complete', 'अस्पताल का बिल साफ़ और पूरा है')}</OkRow>
        {pharmacyOk && <OkRow>{t('Pharmacy bills match the medicines', 'दवाई के बिल दवाइयों से मेल खाते हैं')}</OkRow>}
        {fixes.room && <OkRow>{t('Hospital letter on room rent', 'कमरे के किराए पर अस्पताल की चिट्ठी')}</OkRow>}

        {ready && <Button className="mt-3" variant="success" icon={ArrowRight} onClick={() => go('package')}>{t('See my claim package', 'मेरा क्लेम पैकेट देखें')}</Button>}
        <p className="text-[14px] text-ink2 mt-2 flex gap-1.5"><Info size={16} className="shrink-0 mt-0.5" />{t('This is a check, not a final decision. The insurer decides. You can always ask us why.', 'यह एक जाँच है, अंतिम फ़ैसला नहीं। फ़ैसला बीमा कंपनी करती है।')}</p>
      </div>
    </>
  )
}

/* ---------- 7. Fix it ---------- */
function Fix({ t, go, showToast, pharmacyOk, fixes, setFixes, atRisk, expected, ready }) {
  const [cam, setCam] = useState(null)
  const problems = (pharmacyOk ? 0 : 1) + (fixes.room ? 0 : 1)
  const msg = t('Namaste. Please give a letter that no general-ward bed was free when Ramesh Kumar was admitted on 20 Nov 2026, or a bill at the general-ward rate (₹2,000 a day). It is needed for the insurance claim. – Sunita Devi', 'नमस्ते। कृपया लिखकर दें कि 20 नवंबर 2026 को रमेश कुमार की भर्ती के समय जनरल वार्ड में बेड ख़ाली नहीं था, या जनरल वार्ड रेट (₹2,000 प्रतिदिन) वाला बिल दें। यह बीमा क्लेम के लिए ज़रूरी है। – सुनीता देवी')
  const copy = async () => {
    try { await navigator.clipboard.writeText(msg); showToast(t('Message copied. Show it at the billing desk.', 'संदेश कॉपी हो गया। बिलिंग काउंटर पर दिखाएँ।')) }
    catch (e) { showToast(t('Could not copy. You can read the message out from the screen.', 'कॉपी नहीं हुआ। स्क्रीन से संदेश पढ़कर दिखा दें।')) }
  }
  const rows = [
    { id: 'pharmacy', done: pharmacyOk, kind: 'pharmacy', kindTone: 'bad', title: t('Add the pharmacy bills', 'दवाई के बिल जोड़ें'), sub: t('Ask the hospital chemist for all receipts', 'अस्पताल के केमिस्ट से सभी रसीदें माँगें'), doneText: t('Pharmacy bills – ₹6,800 – 9 receipts', 'दवाई के बिल – ₹6,800 – 9 रसीदें') },
    { id: 'room', done: fixes.room, kind: 'corrected', kindTone: 'warn', title: t('Add the hospital’s letter or corrected bill', 'अस्पताल की चिट्ठी या सही बिल जोड़ें'), sub: t('If no general-ward bed was free, the hospital can say so in writing', 'अगर जनरल वार्ड में बेड नहीं था, तो अस्पताल लिखकर दे सकता है'), doneText: t('Hospital letter – general ward full on 20 Nov', 'अस्पताल की चिट्ठी – 20 नवंबर को जनरल वार्ड भरा था') },
  ]
  return (
    <>
      <H1 sub={t('Two small steps. Your payout goes up with each one.', 'दो छोटे क़दम। हर क़दम से आपका पैसा बढ़ेगा।')}>{t('Fix it', 'ठीक करें')}</H1>
      <SummaryCard t={t} atRisk={atRisk} expected={expected} ready={ready} problems={problems} />
      <div className="flex flex-col gap-3 mt-4">
        {rows.map((r, i) => {
          const c = tone[r.done ? 'ok' : r.kindTone]
          return (
            <Card key={r.id} className={`p-4 border-2 transition-colors duration-300 ${r.done ? 'border-ok' : 'border-transparent'}`}>
              <div className="flex items-center gap-3">
                <DocThumb kind={r.kind} w={40} />
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-1.5 text-[14px] font-bold ${c.text}`}><c.Icon size={17} strokeWidth={2.4} />{r.done ? t('Done', 'हो गया') : t(`Step ${i + 1}`, `क़दम ${i + 1}`)}</div>
                  <div className="text-[18px] font-semibold leading-snug">{r.title}</div>
                  <div className={`text-[15px] ${r.done ? 'text-ok font-medium' : 'text-ink2'}`}>{r.done ? r.doneText : r.sub}</div>
                </div>
                {r.done ? <Tick /> : <CameraBtn onClick={() => setCam(r)} label={r.title} />}
              </div>
              {r.id === 'room' && !r.done && (
                <button onClick={copy} className="mt-3 w-full min-h-[48px] rounded-xl bg-bg text-trust font-semibold text-[16px] flex items-center justify-center gap-2"><Copy size={18} />{t('Copy message for the hospital', 'अस्पताल के लिए संदेश कॉपी करें')}</button>
              )}
            </Card>
          )
        })}
      </div>
      <div className="mt-6">
        {ready
          ? <Button variant="success" icon={ArrowRight} onClick={() => go('package')}>{t('See my claim package', 'मेरा क्लेम पैकेट देखें')}</Button>
          : <p className="text-center text-ink2 text-[16px]">{t('Tap the camera button to add each paper.', 'हर काग़ज़ जोड़ने के लिए कैमरा बटन दबाएँ।')}</p>}
      </div>
      {cam && <CameraOverlay kind={cam.kind} title={cam.title} onDone={() => { setFixes((f) => ({ ...f, [cam.id]: true })); setCam(null) }} />}
    </>
  )
}

/* ---------- 8. Claim package ---------- */
function Package({ t, L, showToast, docs, status, onSubmitted }) {
  const order = [
    t('Claim form (filled for you)', 'क्लेम फ़ॉर्म (आपके लिए भरा हुआ)'),
    t('Policy card', 'पॉलिसी कार्ड'),
    t('Final hospital bill – ₹52,000', 'अस्पताल का फ़ाइनल बिल – ₹52,000'),
    t('Hospital letter on room rent', 'कमरे के किराए पर अस्पताल की चिट्ठी'),
    t('Discharge summary', 'डिस्चार्ज समरी'),
    t('Pharmacy bills – ₹6,800', 'दवाई के बिल – ₹6,800'),
    ...(docs.lab ? [t('Lab reports', 'जाँच रिपोर्ट')] : []),
    t('ID proof – Aadhaar', 'पहचान पत्र – आधार'),
    t('Bank passbook', 'बैंक पासबुक'),
  ]
  const waText = encodeURIComponent(t('Claim Defender: Health claim for Ramesh Kumar is ready. ₹52,000 claimed, about ₹51,000 expected. Submit by 24 Dec 2026.', 'Claim Defender: रमेश कुमार का हेल्थ क्लेम तैयार है। ₹52,000 का क्लेम, लगभग ₹51,000 मिलने की उम्मीद। 24 दिसंबर 2026 तक जमा करें।'))
  return (
    <>
      <H1 sub={t('Everything is checked and in the right order.', 'सब कुछ जाँचा गया है और सही क्रम में है।')}>{t('Your claim package', 'आपका क्लेम पैकेट')}</H1>

      <div className="rounded-card p-4 border-2 border-ok bg-ok-soft flex items-center gap-3">
        <CheckCircle2 size={28} className="text-ok shrink-0" />
        <div><div className="text-[19px] font-bold">{t('Ready to submit', 'जमा करने के लिए तैयार')}</div><div className="text-[17px] text-ok font-semibold">{t('Expected ₹51,000', 'उम्मीद: ₹51,000')}</div></div>
      </div>

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-12 rounded-lg bg-bad-soft text-bad grid place-items-center font-bold text-[13px] border border-bad/30">PDF</div>
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-semibold truncate">Claim-Ramesh-Kumar.pdf</div>
            <div className="text-[15px] text-ink2">{t(`${order.length} papers · 14 pages · 2.1 MB`, `${order.length} काग़ज़ · 14 पेज · 2.1 MB`)}</div>
          </div>
        </div>
        <ol className="mt-3 border-t border-line pt-2">
          {order.map((d, i) => (
            <li key={i} className="flex items-center gap-3 py-2 text-[17px]">
              <span className="h-8 w-8 rounded-full bg-trust-soft text-trust grid place-items-center text-[15px] font-bold shrink-0">{i + 1}</span>
              <span className="flex-1">{d}</span>
              <Check size={20} className="text-ok" strokeWidth={3} aria-label="added" />
            </li>
          ))}
        </ol>
      </Card>

      <Card className="mt-4 p-4">
        <div className="text-[19px] font-bold mb-2">{t('Where and how to submit', 'कहाँ और कैसे जमा करें')}</div>
        <div className="flex flex-col gap-3 text-[17px]">
          <div className="flex gap-3"><Building2 size={22} className="text-trust shrink-0 mt-0.5" /><div><div className="text-ink2 text-[15px]">{t('Insurer', 'बीमा कंपनी')}</div>{L(INSURER.name)}</div></div>
          <div className="flex gap-3"><Mail size={22} className="text-trust shrink-0 mt-0.5" /><div className="min-w-0"><div className="text-ink2 text-[15px]">{t('Email the PDF to', 'PDF ईमेल करें')}</div><span className="break-all">{INSURER.email}</span></div></div>
          <div className="flex gap-3"><Landmark size={22} className="text-trust shrink-0 mt-0.5" /><div><div className="text-ink2 text-[15px]">{t('Or post / hand it to', 'या डाक से / हाथ से दें')}</div>{L(INSURER.address)}</div></div>
          <div className="flex gap-3 bg-warn-soft rounded-xl p-3"><CalendarClock size={22} className="text-warn shrink-0 mt-0.5" /><div><div className="font-bold text-warn text-[15px]">{t('Deadline', 'आख़िरी तारीख़')}</div>{t('Submit within 30 days of discharge, by 24 Dec 2026', 'छुट्टी के 30 दिन के अंदर, 24 दिसंबर 2026 तक जमा करें')}</div></div>
        </div>
      </Card>

      <div className="mt-5 flex flex-col gap-3">
        <Button as="a" href={`https://wa.me/?text=${waText}`} icon={Share2}>{t('Share on WhatsApp', 'WhatsApp पर भेजें')}</Button>
        <Button variant="secondary" icon={Download} onClick={() => showToast(t('Demo: in the app, the PDF saves to your phone’s Downloads.', 'डेमो: ऐप में PDF आपके फ़ोन के Downloads में सेव होगी।'))}>{t('Download PDF', 'PDF डाउनलोड करें')}</Button>
        {status !== 'submitted' && <Button variant="ghost" onClick={onSubmitted}>{t('I have submitted it', 'मैंने जमा कर दिया')}</Button>}
      </div>
    </>
  )
}

/* ---------- 9. Rejection decoder ---------- */
function Decoder({ t, go, letterAdded, setLetterAdded }) {
  const [cam, setCam] = useState(false)
  const fileRef = useRef()
  if (!letterAdded) {
    return (
      <>
        <H1 sub={t('Add the letter the insurer sent you. We explain it in simple words.', 'बीमा कंपनी की भेजी चिट्ठी जोड़ें। हम उसे आसान शब्दों में समझाएँगे।')}>{t('Understand your rejection letter', 'नामंज़ूरी की चिट्ठी समझें')}</H1>
        <Card className="p-6 flex flex-col items-center text-center gap-4">
          <DocThumb kind="letter" w={84} />
          <button onClick={() => setCam(true)} className="w-full min-h-[64px] rounded-2xl bg-trust text-white text-[19px] font-bold flex items-center justify-center gap-3 shadow-card active:scale-[.98] transition-transform">
            <CameraIconBig />{t('Photograph the letter', 'चिट्ठी की फ़ोटो लें')}
          </button>
          <button onClick={() => fileRef.current?.click()} className="w-full min-h-[56px] rounded-2xl border-2 border-trust text-trust text-[18px] font-semibold flex items-center justify-center gap-2">
            <Upload size={22} />{t('Choose from phone', 'फ़ोन से चुनें')}
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.length) setLetterAdded(true) }} />
          <p className="text-ink2 text-[15px]">{t('A photo, a PDF, or a screenshot of the SMS or email all work.', 'फ़ोटो, PDF, या SMS/ईमेल का स्क्रीनशॉट — सब चलेगा।')}</p>
        </Card>
        {cam && <CameraOverlay kind="letter" title={t('Rejection letter', 'नामंज़ूरी की चिट्ठी')} onDone={() => { setCam(false); setLetterAdded(true) }} />}
      </>
    )
  }
  return (
    <>
      <H1>{t('What your letter means', 'आपकी चिट्ठी का मतलब')}</H1>
      <Card className="p-3 flex items-center gap-3 mb-4">
        <DocThumb kind="letter" w={40} />
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-semibold">{t('PMSBY accident claim – ₹2,00,000', 'PMSBY दुर्घटना क्लेम – ₹2,00,000')}</div>
          <div className="text-[15px] text-ink2">{t('Letter dated 10 Nov 2026 · Claim no. PMSBY/KNL/2026/0418', 'चिट्ठी 10 नवंबर 2026 · क्लेम नं. PMSBY/KNL/2026/0418')}</div>
        </div>
        <span className="inline-flex items-center gap-1 text-bad font-semibold text-[14px]"><XCircle size={17} />{t('Rejected', 'नामंज़ूर')}</span>
      </Card>

      <div className="flex flex-col gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[16px] font-bold text-ink2"><MessageSquareText size={20} />{t('What the letter says', 'चिट्ठी में क्या लिखा है')}</div>
          <p className="mt-2 text-[18px] text-ink">{t('Your accident claim of ₹2,00,000 under PMSBY has been rejected. The insurer says your papers were incomplete: the FIR copy and the hospital certificate were not received.', 'PMSBY के तहत आपका ₹2,00,000 का दुर्घटना क्लेम नामंज़ूर किया गया है। बीमा कंपनी कहती है कि आपके काग़ज़ अधूरे थे: FIR की कॉपी और अस्पताल का प्रमाण-पत्र नहीं मिला।')}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[16px] font-bold text-ink2"><FileText size={20} />{t('The rule they quoted', 'जिस नियम का हवाला दिया')}</div>
          <p className="mt-2 text-[17px] text-ink bg-bg rounded-xl p-3">{t('“Claim procedure, para 3: The claim form must be sent with the FIR copy and the medical certificate from the hospital.”', '“क्लेम प्रक्रिया, पैरा 3: क्लेम फ़ॉर्म के साथ FIR की कॉपी और अस्पताल का मेडिकल प्रमाण-पत्र भेजना ज़रूरी है।”')}</p>
          <p className="mt-2 text-[16px] text-ink2">{t('In simple words: they need proof of the accident and proof of treatment.', 'आसान शब्दों में: उन्हें दुर्घटना और इलाज का सबूत चाहिए।')}</p>
        </Card>
        <div className="rounded-card p-4 border-2 border-warn bg-warn-soft">
          <div className="flex items-center gap-2 text-[16px] font-bold text-warn"><AlertTriangle size={20} strokeWidth={2.4} />{t('Our check', 'हमारी जाँच')}</div>
          <div className="mt-1 text-[20px] font-bold leading-snug text-ink">{t('This rejection does not seem to match your papers', 'यह नामंज़ूरी आपके काग़ज़ों से मेल नहीं खाती')}</div>
          <p className="mt-1.5 text-[17px] text-ink">{t('Your claim file shows you gave the FIR copy and the hospital certificate to the bank on 2 Nov 2026 (receipt no. 4471). The bank may not have sent them on. This is worth appealing.', 'आपकी फ़ाइल के अनुसार आपने 2 नवंबर 2026 को FIR की कॉपी और अस्पताल का प्रमाण-पत्र बैंक में जमा किया था (रसीद नं. 4471)। हो सकता है बैंक ने आगे नहीं भेजा। इस पर अपील करनी चाहिए।')}</p>
          <p className="mt-2 text-[15px] font-semibold text-warn flex items-center gap-1.5"><CalendarClock size={17} />{t('Appeal by 10 Dec 2026', '10 दिसंबर 2026 तक अपील करें')}</p>
        </div>
        <Button className="mt-2" icon={Scale} onClick={() => go('appeal')}>{t('Help me appeal', 'अपील में मदद करें')}</Button>
      </div>
    </>
  )
}
function CameraIconBig() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg> }

/* ---------- 10. Appeal builder ---------- */
function appealLetter(lang) {
  if (lang === 'hi') return `सेवा में,
शिकायत अधिकारी (Grievance Officer),
भारत सुरक्षा जनरल इंश्योरेंस (डेमो)
(मेरी बैंक शाखा, सेक्टर 12, करनाल के माध्यम से)

विषय: PMSBY क्लेम नं. PMSBY/KNL/2026/0418 की दोबारा जाँच का अनुरोध

महोदय/महोदया,
मैं सुनीता देवी, करनाल, हरियाणा से हूँ। मेरे पति रमेश कुमार का PMSBY दुर्घटना क्लेम ₹2,00,000 का था, जिसे 10 नवंबर 2026 को "काग़ज़ अधूरे" बताकर नामंज़ूर कर दिया गया।

मैंने FIR की कॉपी और अस्पताल का प्रमाण-पत्र 2 नवंबर 2026 को बैंक में जमा कर दिया था (रसीद नं. 4471)। इनकी कॉपी इस पत्र के साथ फिर से लगा रही हूँ।

कृपया मेरे क्लेम की दोबारा जाँच करें और भुगतान करें। कृपया 14 दिन के अंदर जवाब दें।

संलग्न:
1. नामंज़ूरी की चिट्ठी
2. FIR की कॉपी
3. अस्पताल का प्रमाण-पत्र
4. बैंक रसीद नं. 4471
5. आधार कार्ड की कॉपी
6. बैंक पासबुक की कॉपी

धन्यवाद,
सुनीता देवी
करनाल, हरियाणा
मोबाइल: 98XXX XXX21
तारीख़: 24 नवंबर 2026`
  return `To,
The Grievance Officer,
Bharat Suraksha General Insurance (demo)
(through my bank branch, Sector 12, Karnal)

Subject: Request to review rejected PMSBY claim no. PMSBY/KNL/2026/0418

Sir/Madam,
I am Sunita Devi of Karnal, Haryana. The PMSBY accident claim of ₹2,00,000 for my husband Ramesh Kumar was rejected on 10 Nov 2026 with the reason "documents incomplete".

I gave the FIR copy and the hospital certificate to the bank on 2 Nov 2026 (receipt no. 4471). Copies are attached again with this letter.

Please review my claim and pay it. Kindly reply within 14 days.

Attached:
1. Rejection letter
2. FIR copy
3. Hospital certificate
4. Bank receipt no. 4471
5. Aadhaar card copy
6. Bank passbook copy

Thank you,
Sunita Devi
Karnal, Haryana
Mobile: 98XXX XXX21
Date: 24 Nov 2026`
}

function Appeal({ t, lang, showToast, appealSent, onSent }) {
  const [text, setText] = useState(() => appealLetter(lang))
  const [sheet, setSheet] = useState(false)
  const speaker = useSpeaker()
  const steps = [
    { Icon: Mail, title: t('Grievance to the insurer', 'बीमा कंपनी को शिकायत'), when: t('Now · by 10 Dec 2026', 'अभी · 10 दिसंबर 2026 तक'), sub: t('We wrote this letter for you, below.', 'यह चिट्ठी हमने नीचे आपके लिए लिख दी है।'), now: true },
    { Icon: Landmark, title: t('Complaint on Bima Bharosa', 'बीमा भरोसा पर शिकायत'), when: t('If no reply in 14 days', 'अगर 14 दिन में जवाब न आए'), sub: t('IRDAI’s official grievance portal. We fill it in with you.', 'IRDAI (बीमा नियामक) का सरकारी शिकायत पोर्टल। हम साथ में भरेंगे।') },
    { Icon: Scale, title: t('Insurance Ombudsman', 'बीमा लोकपाल'), when: t('Free · if still unresolved', 'मुफ़्त · अगर तब भी हल न हो'), sub: t('An independent officer who settles disputes. No lawyer needed.', 'एक स्वतंत्र अधिकारी जो विवाद सुलझाते हैं। वकील की ज़रूरत नहीं।') },
  ]
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); showToast(t('Letter copied.', 'चिट्ठी कॉपी हो गई।')) }
    catch (e) { showToast(t('Could not copy on this phone.', 'इस फ़ोन पर कॉपी नहीं हुआ।')) }
  }
  return (
    <>
      <H1 sub={t('Three steps. Most claims are settled at step 1 or 2.', 'तीन क़दम। ज़्यादातर क्लेम पहले या दूसरे क़दम पर सुलझ जाते हैं।')}>{t('Your appeal plan', 'आपकी अपील की योजना')}</H1>

      <Card className="p-4">
        <ol>
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`h-12 w-12 rounded-full grid place-items-center shrink-0 ${s.now ? 'bg-trust text-white' : 'bg-trust-soft text-trust'}`}><s.Icon size={22} /></span>
                {i < steps.length - 1 && <span className="w-[3px] flex-1 bg-line my-1 rounded" />}
              </div>
              <div className={`pb-5 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                <div className={`text-[14px] font-bold ${s.now ? 'text-trust' : 'text-ink2'}`}>{t(`Step ${i + 1}`, `क़दम ${i + 1}`)} · {s.when}</div>
                <div className="text-[19px] font-bold leading-snug">{s.title}</div>
                <div className="text-[16px] text-ink2">{s.sub}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-5 flex items-end justify-between gap-2">
        <div>
          <div className="text-[20px] font-bold">{t('Your appeal letter', 'आपकी अपील की चिट्ठी')}</div>
          <div className="text-[15px] text-ink2">{t('Your details are filled in. You can change any word.', 'आपकी जानकारी भरी हुई है। कोई भी शब्द बदल सकते हैं।')}</div>
        </div>
      </div>
      <Card className="mt-3 p-1">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} aria-label={t('Appeal letter', 'अपील की चिट्ठी')}
          className="w-full rounded-xl p-3.5 text-[16px] leading-relaxed text-ink bg-white resize-y focus:outline-none" />
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => speaker.speaking ? speaker.stop() : speaker.speak(text, lang)} className="min-h-[52px] rounded-2xl bg-white shadow-card text-trust font-semibold text-[17px] flex items-center justify-center gap-2">
          {speaker.speaking ? <Loader2 size={20} className="spin" /> : <VolumeIcon />}{speaker.speaking ? t('Stop', 'रोकें') : t('Listen', 'सुनें')}
        </button>
        <button onClick={copy} className="min-h-[52px] rounded-2xl bg-white shadow-card text-trust font-semibold text-[17px] flex items-center justify-center gap-2"><Copy size={20} />{t('Copy', 'कॉपी')}</button>
        <button onClick={() => showToast(t('Demo: in the app, the letter saves as a PDF.', 'डेमो: ऐप में चिट्ठी PDF में सेव होगी।'))} className="col-span-2 min-h-[52px] rounded-2xl bg-white shadow-card text-trust font-semibold text-[17px] flex items-center justify-center gap-2"><Download size={20} />{t('Download PDF', 'PDF डाउनलोड करें')}</button>
      </div>

      <Card className="mt-4 p-4 flex flex-col items-center gap-2">
        <div className="text-[16px] text-ink2 text-center">{t('Want to add something in your own words?', 'अपने शब्दों में कुछ जोड़ना है?')}</div>
        <MicButton size="sm" sample={t('We need this money for his treatment and our children’s school fees.', 'हमें इलाज और बच्चों की स्कूल फ़ीस के लिए इस पैसे की ज़रूरत है।')}
          onResult={(s) => { setText((x) => x.replace(/(Kindly reply within 14 days\.|कृपया 14 दिन के अंदर जवाब दें।)/, `$1\n${s}`)); showToast(t('Added to your letter.', 'आपकी चिट्ठी में जोड़ दिया।')) }} />
      </Card>

      <div className="mt-5">
        {appealSent
          ? <div className="rounded-card p-4 border-2 border-ok bg-ok-soft flex items-center gap-3 text-[18px] font-semibold"><CheckCircle2 className="text-ok" />{t('Appeal sent on 24 Nov 2026', 'अपील 24 नवंबर 2026 को भेजी')}</div>
          : <Button icon={Mail} onClick={() => setSheet(true)}>{t('Send by email', 'ईमेल से भेजें')}</Button>}
      </div>

      {sheet && (
        <Sheet onClose={() => setSheet(false)} title={t('Send by email', 'ईमेल से भेजें')}>
          <div className="text-[22px] font-bold">{t('Send your appeal', 'अपनी अपील भेजें')}</div>
          <div className="mt-3 flex flex-col gap-3 text-[17px]">
            <div className="bg-bg rounded-xl p-3"><div className="text-[15px] text-ink2">{t('To', 'किसे')}</div><span className="break-all">grievance@bharat-suraksha.example</span></div>
            <div className="bg-bg rounded-xl p-3"><div className="text-[15px] text-ink2">{t('Attached', 'साथ में')}</div>{t('Appeal letter + 6 papers from your claim file', 'अपील की चिट्ठी + आपकी फ़ाइल के 6 काग़ज़')}</div>
            <p className="text-[15px] text-ink2 flex gap-1.5"><Info size={17} className="shrink-0 mt-0.5" />{t('Keep the reply email. We will remind you on 8 Dec 2026 if there is no answer.', 'जवाब का ईमेल सँभाल कर रखें। जवाब न आया तो 8 दिसंबर 2026 को हम याद दिलाएँगे।')}</p>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button icon={Mail} onClick={() => { setSheet(false); onSent() }}>{t('Send now', 'अभी भेजें')}</Button>
            <Button variant="ghost" onClick={() => setSheet(false)}>{t('Not now', 'अभी नहीं')}</Button>
          </div>
        </Sheet>
      )}
    </>
  )
}
function VolumeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></svg> }

/* ---------- 11. My claims ---------- */
function Claims({ t, go, showToast, healthStatus, appealSent, checked, ready }) {
  const hs = healthStatus || 'checking'
  const healthNext = {
    checking: checked ? t('Fix 2 problems · by 24 Dec 2026', '2 दिक़्क़तें ठीक करें · 24 दिसंबर 2026 तक') : t('Add papers and check · by 24 Dec 2026', 'काग़ज़ जोड़ें और जाँचें · 24 दिसंबर 2026 तक'),
    ready: t('Submit to insurer · by 24 Dec 2026', 'बीमा कंपनी को जमा करें · 24 दिसंबर 2026 तक'),
    submitted: t('Wait for reply · check on 24 Dec 2026', 'जवाब का इंतज़ार · 24 दिसंबर 2026 को देखें'),
  }[hs]
  const claims = [
    { id: 'h', Icon: Hospital, title: t('Health – Ramesh Kumar', 'स्वास्थ्य – रमेश कुमार'), sub: t('City Care Hospital, Karnal', 'सिटी केयर हॉस्पिटल, करनाल'), amount: 52000, status: hs, next: healthNext, onTap: () => go(hs === 'checking' ? (checked ? 'result' : 'choose') : 'package') },
    { id: 'p', Icon: Bike, title: t('Accident – PMSBY', 'दुर्घटना – PMSBY'), sub: appealSent ? t('Reason given: “documents incomplete”', 'कारण: “काग़ज़ अधूरे”') : t('Rejected – “documents incomplete”', 'नामंज़ूर – “काग़ज़ अधूरे”'), amount: 200000, status: appealSent ? 'appeal' : 'rejected', next: appealSent ? t('Wait for reply · next step on 8 Dec 2026', 'जवाब का इंतज़ार · अगला क़दम 8 दिसंबर 2026') : t('Appeal by 10 Dec 2026', '10 दिसंबर 2026 तक अपील करें'), urgent: !appealSent, onTap: () => go(appealSent ? 'appeal' : 'decoder') },
    { id: 'c', Icon: Wheat, title: t('Crop – PMFBY, Kharif 2025', 'फ़सल – PMFBY, ख़रीफ़ 2025'), sub: t('Hail damage, 1.5 acres', 'ओलावृष्टि, 1.5 एकड़'), amount: 18500, status: 'paid', next: t('Paid to bank on 12 Mar 2026', '12 मार्च 2026 को बैंक में आया'), onTap: () => showToast(t('This claim is closed. ₹18,500 was paid in full.', 'यह क्लेम पूरा हुआ। ₹18,500 पूरा मिला।')) },
  ]
  return (
    <>
      <H1 sub={t('Tap a claim to see what to do next.', 'आगे क्या करना है, देखने के लिए क्लेम पर दबाएँ।')}>{t('My claims', 'मेरे क्लेम')}</H1>
      <div className="flex flex-col gap-3">
        {claims.map((c) => (
          <button key={c.id} onClick={c.onTap} className="text-left bg-white rounded-card shadow-card p-4 active:scale-[.98] transition-transform">
            <div className="flex items-start gap-3">
              <span className="h-12 w-12 rounded-2xl bg-trust-soft text-trust grid place-items-center shrink-0"><c.Icon size={26} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[19px] font-bold leading-snug">{c.title}</div>
                <div className="text-[15px] text-ink2">{c.sub}</div>
              </div>
              <div className="text-[19px] font-bold whitespace-nowrap">{inr(c.amount)}</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <StatusChip status={c.status} />
            </div>
            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 min-h-[48px] text-[16px] font-semibold ${c.urgent ? 'bg-bad-soft text-bad' : 'bg-bg text-ink'}`}>
              <CalendarClock size={19} className="shrink-0" />
              <span className="flex-1">{c.next}</span>
              <ChevronRight size={20} className="shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------- 12. Help ---------- */
function Help({ t, showToast, restart }) {
  const how = [
    [CameraIconSmall, t('Take photos of your papers', 'अपने काग़ज़ों की फ़ोटो लें')],
    [ShieldCheck, t('We check them against your policy', 'हम उन्हें आपकी पॉलिसी से मिलाते हैं')],
    [CheckCircle2, t('Fix problems before you send', 'भेजने से पहले ग़लतियाँ ठीक करें')],
    [Scale, t('If rejected, we write your appeal', 'नामंज़ूर हो तो हम अपील लिखते हैं')],
  ]
  return (
    <>
      <H1 sub={t('We are here for you. No question is too small.', 'हम आपके साथ हैं। कोई भी सवाल छोटा नहीं।')}>{t('Help', 'मदद')}</H1>
      <Card className="p-4">
        <div className="text-[19px] font-bold mb-3">{t('Talk to a person', 'किसी से बात करें')}</div>
        <Button icon={Phone} onClick={() => showToast(t('Demo: this would call 1800-000-0000 (free).', 'डेमो: यह 1800-000-0000 (मुफ़्त) पर कॉल करेगा।'))}>{t('Call helpline (free)', 'हेल्पलाइन पर कॉल करें (मुफ़्त)')}</Button>
        <p className="text-center text-ink2 text-[15px] mt-2">1800-000-0000 · {t('9 am – 7 pm, Mon–Sat', 'सुबह 9 – शाम 7, सोम–शनि')}</p>
      </Card>
      <Card className="mt-4 p-4">
        <div className="text-[19px] font-bold mb-2">{t('How Claim Defender works', 'Claim Defender कैसे काम करता है')}</div>
        {how.map(([Icon, s], i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 text-[17px]">
            <span className="h-10 w-10 rounded-full bg-trust-soft text-trust grid place-items-center shrink-0"><Icon size={20} /></span>{s}
          </div>
        ))}
      </Card>
      <Card className="mt-4 p-4">
        <div className="text-[19px] font-bold mb-2">{t('Words you may see', 'शब्द जो आप देख सकते हैं')}</div>
        {[
          [t('Sum insured', 'बीमा राशि (Sum insured)'), t('The most your policy will pay in a year.', 'एक साल में पॉलिसी से मिलने वाली सबसे ज़्यादा रक़म।')],
          [t('Proportionate deduction', 'आनुपातिक कटौती'), t('If your room costs more than allowed, other charges are cut by the same share.', 'कमरा तय सीमा से महँगा हो, तो बाक़ी ख़र्चे भी उसी हिस्से में कटते हैं।')],
          [t('Bima Bharosa', 'बीमा भरोसा'), t('The insurance regulator’s free complaint portal.', 'बीमा नियामक (IRDAI) का मुफ़्त शिकायत पोर्टल।')],
          [t('Ombudsman', 'लोकपाल'), t('A free, independent officer who settles insurance disputes.', 'बीमा विवाद सुलझाने वाले मुफ़्त, स्वतंत्र अधिकारी।')],
        ].map(([w, d]) => (
          <div key={w} className="py-2 border-b border-line last:border-0"><div className="text-[17px] font-semibold">{w}</div><div className="text-[16px] text-ink2">{d}</div></div>
        ))}
      </Card>
      <Card className="mt-4 p-4 flex gap-3">
        <Lock size={22} className="text-trust shrink-0 mt-0.5" />
        <p className="text-[16px]">{t('Your papers are read to check your claim, then deleted. We never sell your data.', 'आपके काग़ज़ सिर्फ़ क्लेम जाँचने के लिए पढ़े जाते हैं, फिर मिटा दिए जाते हैं। हम आपका डेटा कभी नहीं बेचते।')}</p>
      </Card>
      <p className="mt-4 text-[14px] text-ink2">{t('Claim Defender is a claim checker and appeal drafter, not legal advice. The insurer makes the final decision. Prototype with sample data.', 'Claim Defender क्लेम जाँचने और अपील लिखने का साधन है, क़ानूनी सलाह नहीं। अंतिम फ़ैसला बीमा कंपनी का होता है। यह नमूना डेटा वाला प्रोटोटाइप है।')}</p>
      <Button variant="ghost" className="mt-1" onClick={restart}>{t('Restart demo', 'डेमो फिर से शुरू करें')}</Button>
    </>
  )
}
function CameraIconSmall(p) { return <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg> }
