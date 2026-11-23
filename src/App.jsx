import React, { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck, FileSearch, ListChecks, Hospital, Bike, HeartHandshake, Wheat, FileQuestion, ChevronDown, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, Download, Share2, Copy, Mail, Building2, CalendarClock, FileText, ArrowRight,
  Scale, Landmark, Check, Lock, Phone, Info, Sparkles, Quote, Upload, Camera, Plus,
} from 'lucide-react'
import {
  LangCtx, inr, Logo, Button, Card, Chip, StatusChip, TONES, ProgressRing, useCountUp, DocThumb, CameraOverlay, DropZone,
  Sidebar, Rail, TopBar, BottomNav, Toast, Sheet, PageHead, ListenButton,
} from './ui.jsx'

/* =====================================================================
   DEMO DATA (mock only, used consistently)
   ===================================================================== */
const CLAIM_TOTAL = 52000
const RISK = { pharmacy: 6800, room: 5600 }
const FINAL_EXPECTED = 51000
const INSURERS = {
  health: { en: 'Suraksha Health Insurance (demo)', hi: 'सुरक्षा हेल्थ इंश्योरेंस (डेमो)' },
  pmsby: { en: 'Bharat Suraksha General (demo)', hi: 'भारत सुरक्षा जनरल (डेमो)' },
  pmfby: { en: 'Kisan Suraksha Agri (demo)', hi: 'किसान सुरक्षा एग्री (डेमो)' },
}
const HEALTH_EMAIL = 'claims@suraksha-health.example'

const POLICIES = [
  { id: 'health', Icon: Hospital, en: 'Health', hi: 'स्वास्थ्य', sub: { en: 'Hospital stays and bills', hi: 'अस्पताल में भर्ती और बिल' } },
  { id: 'pmsby', Icon: Bike, en: 'Accident (PMSBY)', hi: 'दुर्घटना (PMSBY)', sub: { en: '₹2 lakh accident cover', hi: '₹2 लाख दुर्घटना कवर' } },
  { id: 'pmjjby', Icon: HeartHandshake, en: 'Life (PMJJBY)', hi: 'जीवन (PMJJBY)', sub: { en: '₹2 lakh life cover', hi: '₹2 लाख जीवन कवर' } },
  { id: 'pmfby', Icon: Wheat, en: 'Crop (PMFBY)', hi: 'फ़सल (PMFBY)', sub: { en: 'Crop loss from weather', hi: 'मौसम से फ़सल का नुक़सान' } },
  { id: 'other', Icon: FileQuestion, en: 'Other', hi: 'अन्य', sub: { en: 'Any other insurance plan', hi: 'कोई और बीमा योजना' } },
]

const HEALTH_DOCS = [
  { id: 'policy', kind: 'policy', en: 'Policy card', hi: 'पॉलिसी कार्ड', found: { en: 'Policy card · Family Health Plan · ₹2,00,000 cover', hi: 'पॉलिसी कार्ड · फ़ैमिली हेल्थ प्लान · ₹2,00,000 कवर' } },
  { id: 'bill', kind: 'bill', en: 'Final hospital bill', hi: 'अस्पताल का फ़ाइनल बिल', found: { en: 'Hospital bill · ₹52,000 · City Care Hospital, Karnal', hi: 'अस्पताल बिल · ₹52,000 · सिटी केयर हॉस्पिटल, करनाल' } },
  { id: 'discharge', kind: 'discharge', en: 'Discharge summary', hi: 'डिस्चार्ज समरी', found: { en: 'Discharge summary · Ramesh Kumar · 4 days', hi: 'डिस्चार्ज समरी · रमेश कुमार · 4 दिन' } },
  { id: 'pharmacy', kind: 'pharmacy', en: 'Pharmacy bills', hi: 'दवाई के बिल', found: { en: 'Pharmacy bills · ₹6,800 · 9 receipts', hi: 'दवाई के बिल · ₹6,800 · 9 रसीदें' } },
  { id: 'lab', kind: 'lab', en: 'Lab reports', hi: 'जाँच रिपोर्ट', found: { en: 'Lab reports · 3 reports', hi: 'जाँच रिपोर्ट · 3 रिपोर्ट' } },
  { id: 'id', kind: 'id', en: 'ID proof', hi: 'पहचान पत्र', found: { en: 'ID proof · Aadhaar · Sunita Devi', hi: 'पहचान पत्र · आधार · सुनीता देवी' } },
  { id: 'bank', kind: 'bank', en: 'Bank passbook', hi: 'बैंक पासबुक', found: { en: 'Bank passbook · account ending 4417', hi: 'बैंक पासबुक · खाता …4417' } },
]
const FILL_ORDER = ['bill', 'discharge', 'lab', 'pharmacy']
const SIMPLE_DOCS = {
  pmsby: [['Claim form', 'क्लेम फ़ॉर्म', 'form'], ['FIR or police report', 'FIR या पुलिस रिपोर्ट', 'letter'], ['Hospital or doctor certificate', 'अस्पताल / डॉक्टर का प्रमाण-पत्र', 'discharge'], ['ID proof', 'पहचान पत्र', 'id'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
  pmjjby: [['Claim form', 'क्लेम फ़ॉर्म', 'form'], ['Death certificate', 'मृत्यु प्रमाण-पत्र', 'discharge'], ['Nominee ID proof', 'नॉमिनी का पहचान पत्र', 'id'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
  pmfby: [['Crop loss report (within 72 hours)', 'फ़सल नुक़सान की सूचना (72 घंटे में)', 'form'], ['Land record (khasra / khatauni)', 'ज़मीन का रिकॉर्ड (खसरा / खतौनी)', 'policy'], ['Sowing certificate', 'बुआई प्रमाण-पत्र', 'discharge'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
  other: [['Policy paper', 'पॉलिसी का काग़ज़', 'policy'], ['Bills or receipts', 'बिल या रसीदें', 'bill'], ['ID proof', 'पहचान पत्र', 'id'], ['Bank passbook', 'बैंक पासबुक', 'bank']],
}

const pageText = () => document.getElementById('page')?.innerText || ''

/* =====================================================================
   APP
   ===================================================================== */
export default function App() {
  const [lang, setLang] = useState('en')
  const t = (en, hi) => (lang === 'hi' ? hi : en)
  const L = (o) => (o ? o[lang] : '')

  const [stack, setStack] = useState(['home'])
  const screen = stack[stack.length - 1]
  const go = (s) => setStack((st) => [...st, s])
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st))
  const replace = (s) => setStack((st) => [...st.slice(0, -1), s])

  const [policy, setPolicy] = useState('health')
  const [docs, setDocs] = useState({ policy: true, id: true, bank: true })
  const [simpleDocs, setSimpleDocs] = useState({})
  const [fixes, setFixes] = useState({ pharmacy: false, room: false })
  const [checked, setChecked] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [appealSent, setAppealSent] = useState(false)
  const [letterAdded, setLetterAdded] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef()
  const showToast = (m) => { clearTimeout(toastTimer.current); setToast(m); toastTimer.current = setTimeout(() => setToast(''), 3000) }

  const pharmacyOk = !!(docs.pharmacy || fixes.pharmacy)
  const atRisk = (pharmacyOk ? 0 : RISK.pharmacy) + (fixes.room ? 0 : RISK.room)
  const ready = atRisk === 0
  const expected = ready ? FINAL_EXPECTED : CLAIM_TOTAL - atRisk
  const healthStatus = submitted ? 'submitted' : !checked ? 'checking' : ready ? 'ready' : 'fix'

  useEffect(() => { try { window.speechSynthesis?.cancel() } catch (e) {} window.scrollTo({ top: 0 }) }, [screen])
  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const nav = (k) => {
    if (k === 'home') return setStack(['home'])
    if (k === 'check') return setStack(['home', 'choose'])
    if (k === 'appeals') return setStack(['home', appealSent || letterAdded ? 'decoder' : 'decoder'])
    setStack(['home', k])
  }
  const active = { home: 'home', choose: 'check', docs: 'check', reading: 'check', result: 'check', fix: 'check', package: 'check', decoder: 'appeals', appeal: 'appeals', claims: 'claims', help: 'help' }[screen]
  const restart = () => {
    setDocs({ policy: true, id: true, bank: true }); setSimpleDocs({}); setFixes({ pharmacy: false, room: false })
    setChecked(false); setSubmitted(false); setAppealSent(false); setLetterAdded(false); setPolicy('health'); setStack(['home'])
    showToast(t('Demo reset.', 'डेमो फिर से शुरू।'))
  }

  const P = { t, L, lang, go, back: stack.length > 1 ? back : null, nav, showToast }
  const S = { atRisk, expected, ready, pharmacyOk, fixes }
  let body
  switch (screen) {
    case 'home': body = <HomeScreen {...P} healthStatus={healthStatus} appealSent={appealSent} checked={checked} />; break
    case 'choose': body = <Choose {...P} policy={policy} setPolicy={setPolicy} />; break
    case 'docs': body = policy === 'health'
      ? <DocsHealth {...P} docs={docs} setDocs={setDocs} />
      : <DocsSimple {...P} policy={policy} simpleDocs={simpleDocs} setSimpleDocs={setSimpleDocs} setPolicy={setPolicy} replace={replace} />; break
    case 'reading': body = <Reading {...P} onDone={() => { setChecked(true); replace('result') }} />; break
    case 'result': body = <Result {...P} {...S} />; break
    case 'fix': body = <Fix {...P} {...S} setFixes={setFixes} />; break
    case 'package': body = <Package {...P} docs={docs} submitted={submitted} onSubmitted={() => { setSubmitted(true); nav('claims'); showToast(t('Marked as submitted. We will remind you to check for a reply.', 'जमा हुआ मान लिया। जवाब देखने के लिए हम याद दिलाएँगे।')) }} />; break
    case 'decoder': body = <Decoder {...P} letterAdded={letterAdded} setLetterAdded={setLetterAdded} />; break
    case 'appeal': body = <Appeal {...P} appealSent={appealSent} onSent={() => { setAppealSent(true); nav('claims'); showToast(t('Appeal marked as sent. If there is no reply by 8 Dec 2026, we move to Bima Bharosa.', 'अपील भेजी गई मान ली। 8 दिसंबर 2026 तक जवाब न आए तो बीमा भरोसा पर चलेंगे।')) }} />; break
    case 'claims': body = <Claims {...P} healthStatus={healthStatus} appealSent={appealSent} checked={checked} />; break
    case 'help': body = <Help {...P} restart={restart} />; break
    default: body = null
  }

  return (
    <LangCtx.Provider value={{ lang, t, L }}>
      <Sidebar active={active} go={nav} lang={lang} setLang={setLang} />
      <Rail active={active} go={nav} lang={lang} setLang={setLang} />
      <TopBar lang={lang} setLang={setLang} go={nav} />
      <main className="md:ml-[84px] lg:ml-[260px] min-h-[100dvh]">
        <div id="page" key={screen + lang} className="page-in mx-auto max-w-[1200px] px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-16 lg:px-12 lg:pt-12">{body}</div>
      </main>
      <BottomNav active={active} go={nav} />
      <Toast msg={toast} />
    </LangCtx.Provider>
  )
}

/* =====================================================================
   SHARED PIECES
   ===================================================================== */
function SectionLabel({ children }) {
  return <div className="text-[13px] font-semibold text-ink2 mb-3">{children}</div>
}

function ClaimSummaryCard({ t, lang, atRisk, expected, ready, showToast }) {
  const big = useCountUp(ready ? expected : atRisk)
  const exp = useCountUp(expected)
  const tone = ready ? TONES.green : TONES.amber
  const paidPct = (expected / CLAIM_TOTAL) * 100
  const riskPct = ready ? 0 : (atRisk / CLAIM_TOTAL) * 100
  return (
    <Card className={`relative overflow-hidden transition-colors duration-500 ${ready ? 'border-green/40' : ''}`}>
      <div className={`absolute inset-x-0 top-0 h-1 transition-colors duration-500 ${ready ? 'bg-green' : 'bg-amber'}`} />
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex items-center gap-2 text-[14px] font-semibold ${tone.fg}`}>
          {ready ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {ready ? t('Ready to submit', 'जमा करने के लिए तैयार') : t('Money at risk', 'ख़तरे में पैसा')}
        </div>
        <ListenButton getText={pageText} lang={lang} onFail={showToast} className="h-10 px-3 text-[14px]" />
      </div>
      <div key={ready ? 'g' : 'a'} className="mt-4 fade">
        <div className={`num font-semibold tracking-[-0.02em] leading-none text-[44px] md:text-[52px] ${tone.solid}`}>{inr(big)}</div>
        <div className="mt-2 text-[17px] text-ink">
          {ready ? t('expected payout on your ₹52,000 claim', 'आपके ₹52,000 के क्लेम पर मिलने की उम्मीद')
            : t('at risk, out of a ₹52,000 claim', '₹52,000 के क्लेम में से ख़तरे में')}
        </div>
      </div>

      <div className="mt-6 h-3 rounded-full bg-soft overflow-hidden flex" role="img"
        aria-label={t(`Expected ${inr(expected)}, at risk ${inr(atRisk)}`, `उम्मीद ${inr(expected)}, ख़तरे में ${inr(atRisk)}`)}>
        <div className={`h-full transition-all duration-700 ${ready ? 'bg-green' : 'bg-em'}`} style={{ width: `${paidPct}%` }} />
        <div className="h-full bg-amber transition-all duration-700" style={{ width: `${riskPct}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-ink2">
        <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${ready ? 'bg-green' : 'bg-em'}`} />{t('Likely paid', 'मिलने की संभावना')} <b className="num text-ink font-semibold">{inr(exp)}</b></span>
        {!ready && <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber" />{t('At risk', 'ख़तरे में')} <b className="num text-ink font-semibold">{inr(atRisk)}</b></span>}
        {ready && <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-soft border border-line" />{t('Never payable', 'कभी नहीं मिलता')} <b className="num text-ink font-semibold">₹1,000</b></span>}
      </div>

      <div className="mt-6 pt-5 border-t border-line flex flex-wrap items-center gap-x-3 gap-y-2 text-[16px]">
        {ready ? (
          <span className="text-ink">{t('All problems fixed. Expected', 'सब ठीक हो गया। उम्मीद')} <b className="num text-green-ink">{inr(FINAL_EXPECTED)}</b></span>
        ) : (
          <>
            <span className="text-ink2">{t('Expected now', 'अभी')}</span><b className="num text-ink">{inr(expected)}</b>
            <ArrowRight size={18} className="text-ink2" />
            <span className="text-ink2">{t('after fixing', 'ठीक करने के बाद')}</span><b className="num text-em">{inr(FINAL_EXPECTED)}</b>
          </>
        )}
      </div>
      <p className="mt-3 text-[13px] text-ink2">{t('Small items like gloves and registration (about ₹1,000) are never paid by any health plan.', 'दस्ताने, रजिस्ट्रेशन जैसी छोटी चीज़ें (लगभग ₹1,000) कोई हेल्थ प्लान नहीं देता।')}</p>
    </Card>
  )
}

function PaperDoc({ children, className = '' }) {
  return <div className={`bg-white border border-line rounded-[14px] shadow-lift ${className}`}>{children}</div>
}

/* =====================================================================
   HOME
   ===================================================================== */
function HomeScreen({ t, lang, go, nav, showToast, healthStatus, appealSent, checked }) {
  const actions = [
    { id: 'choose', Icon: ShieldCheck, en: 'Check a claim before sending', hi: 'भेजने से पहले क्लेम जाँचें', sub: { en: 'Find missing papers and cuts before the insurer does.', hi: 'बीमा कंपनी से पहले कमी और कटौती पकड़ें।' }, primary: true },
    { id: 'decoder', Icon: FileSearch, en: 'My claim was rejected or cut', hi: 'मेरा क्लेम रुका या कम मिला', sub: { en: 'Understand the letter and appeal for free.', hi: 'चिट्ठी समझें और मुफ़्त में अपील करें।' } },
    { id: 'claims', Icon: ListChecks, en: 'Track my claims', hi: 'मेरे क्लेम देखें', sub: { en: 'Status, next step and deadline for each claim.', hi: 'हर क्लेम की स्थिति, अगला क़दम और आख़िरी तारीख़।' } },
  ]
  const stats = [
    [t('8%', '8%'), t('of health claims were rejected in FY25', 'हेल्थ क्लेम FY25 में नामंज़ूर हुए')],
    [t('₹12,400', '₹12,400'), t('at risk in our demo case', 'हमारे डेमो केस में ख़तरे में')],
    [t('Free', 'मुफ़्त'), t('for families, always', 'परिवारों के लिए, हमेशा')],
  ]
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-[15px] text-ink2">{t('Namaste, Sunita ji', 'नमस्ते, सुनीता जी')}</div>
          <ListenButton getText={pageText} lang={lang} onFail={showToast} />
        </div>
        <h1 className={`mt-4 text-ink ${lang === 'hi' ? 'font-sans font-semibold text-[34px] md:text-[44px] leading-[1.2] tracking-tight' : 'font-serif text-[44px] md:text-[56px] leading-[1.02] tracking-[-0.015em]'}`}>
          {t(<>Get the insurance money <span className="italic text-em">you're owed.</span></>, <>बीमे का पूरा पैसा, <span className="text-em">आपका हक़ है।</span></>)}
        </h1>
        <p className="mt-4 text-[18px] text-ink2 max-w-[560px]">{t("Check your claim before you send it. Fight it if it's cut.", 'भेजने से पहले क्लेम जाँचें। कटे तो लड़ें।')}</p>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {actions.map((a) => (
            <button key={a.id} onClick={() => go(a.id)}
              className={`lift group text-left rounded-card p-6 min-h-[208px] flex flex-col border ${a.primary ? 'bg-em text-white border-em shadow-[0_8px_24px_rgba(15,118,110,.22)]' : 'bg-surface text-ink border-line shadow-card'}`}>
              <span className={`h-12 w-12 rounded-2xl grid place-items-center ${a.primary ? 'bg-white/15' : 'bg-em-tint text-em'}`}><a.Icon size={24} /></span>
              <span className="mt-auto pt-6 block text-[19px] font-semibold leading-snug">{t(a.en, a.hi)}</span>
              <span className={`mt-1.5 block text-[15px] leading-snug ${a.primary ? 'text-white/80' : 'text-ink2'}`}>{t(a.sub.en, a.sub.hi)}</span>
              <span className={`mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold ${a.primary ? 'text-white' : 'text-em'}`}>{a.primary ? t('Start check', 'जाँच शुरू करें') : t('Open', 'खोलें')}<ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-card border border-line bg-[#F6F3EE] grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line">
          {stats.map(([n, l], i) => (
            <div key={i} className="px-6 py-5">
              <div className="num text-[28px] font-semibold tracking-[-0.02em] text-ink leading-none">{n}</div>
              <div className="mt-1.5 text-[14px] text-ink2">{l}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-ink2">{t('Rejection share from IRDAI data reported for FY25. Other figures are from the demo case.', 'नामंज़ूरी का आँकड़ा FY25 के IRDAI डेटा की रिपोर्ट से। बाक़ी आँकड़े डेमो केस के।')}</p>
      </div>

      <aside>
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-[17px] font-semibold">{t('Recent activity', 'हाल की गतिविधि')}</div>
            <button onClick={() => nav('claims')} className="h-11 px-2 text-[14px] font-semibold text-em">{t('See all', 'सभी देखें')}</button>
          </div>
          <div className="mt-2 flex flex-col divide-y divide-line">
            <ActivityRow Icon={Hospital} title={t('Health · Ramesh Kumar', 'स्वास्थ्य · रमेश कुमार')} amount={52000} status={healthStatus}
              next={healthStatus === 'submitted' ? t('Awaiting insurer reply', 'बीमा कंपनी के जवाब का इंतज़ार') : healthStatus === 'ready' ? t('Submit by 24 Dec 2026', '24 दिसंबर 2026 तक जमा करें') : checked ? t('Fix 2 problems', '2 दिक़्क़तें ठीक करें') : t('Check papers before 24 Dec', '24 दिसंबर से पहले काग़ज़ जाँचें')}
              onClick={() => go(checked ? (healthStatus === 'fix' ? 'result' : 'package') : 'choose')} />
            <ActivityRow Icon={Bike} title={t('Accident · PMSBY', 'दुर्घटना · PMSBY')} amount={200000} status={appealSent ? 'appeal' : 'rejected'}
              next={appealSent ? t('Reply due by 8 Dec 2026', '8 दिसंबर 2026 तक जवाब') : t('Appeal by 10 Dec 2026', '10 दिसंबर 2026 तक अपील करें')} urgent={!appealSent}
              onClick={() => go(appealSent ? 'appeal' : 'decoder')} />
          </div>
        </Card>
        <Card className="mt-4 bg-[#F6F3EE] shadow-none">
          <div className="flex gap-3">
            <Lock size={20} className="text-em shrink-0 mt-0.5" />
            <p className="text-[14px] text-ink">{t('A claim checker and appeal drafter, not legal advice. Every flag links to the exact clause, and you decide.', 'यह क्लेम जाँचने और अपील लिखने का साधन है, क़ानूनी सलाह नहीं। हर चेतावनी पॉलिसी की धारा से जुड़ी है, फ़ैसला आपका।')}</p>
          </div>
        </Card>
      </aside>
    </div>
  )
}

function ActivityRow({ Icon, title, amount, status, next, urgent, onClick }) {
  return (
    <button onClick={onClick} className="text-left py-4 flex gap-3 group">
      <span className="h-10 w-10 rounded-xl bg-soft text-ink grid place-items-center shrink-0"><Icon size={19} /></span>
      <span className="flex-1 min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-semibold leading-snug">{title}</span>
          <span className="num text-[15px] font-semibold">{inr(amount)}</span>
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-2">
          <StatusChip status={status} />
        </span>
        <span className={`mt-2 flex items-center gap-1.5 text-[14px] ${urgent ? 'text-red-ink font-medium' : 'text-ink2'}`}>
          <CalendarClock size={15} />{next}<ChevronRight size={15} className="ml-auto transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </button>
  )
}

/* =====================================================================
   CHOOSE INSURANCE
   ===================================================================== */
function Choose({ t, L, lang, go, back, showToast, policy, setPolicy }) {
  return (
    <>
      <PageHead onBack={back} lang={lang} onToast={showToast} listenText={pageText}
        title={t('Which insurance are you claiming from?', 'किस बीमे से क्लेम कर रहे हैं?')}
        sub={t('Pick one. We will show you exactly which papers it needs.', 'एक चुनें। हम बताएँगे कि इसके लिए कौन-से काग़ज़ चाहिए।')} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label={t('Insurance type', 'बीमे का प्रकार')}>
        {POLICIES.map((p) => {
          const on = policy === p.id
          return (
            <button key={p.id} role="radio" aria-checked={on} onClick={() => setPolicy(p.id)}
              className={`lift relative text-left rounded-card p-6 min-h-[168px] flex flex-col bg-surface border transition-colors ${on ? 'border-em ring-2 ring-em/15 shadow-lift' : 'border-line shadow-card'}`}>
              <span className={`h-12 w-12 rounded-2xl grid place-items-center transition-colors ${on ? 'bg-em text-white' : 'bg-em-tint text-em'}`}><p.Icon size={24} /></span>
              <span className={`absolute top-5 right-5 h-6 w-6 rounded-full border-2 grid place-items-center transition-colors ${on ? 'border-em bg-em text-white' : 'border-[#D6D0C5]'}`}>{on && <Check size={14} strokeWidth={3} />}</span>
              <span className="mt-auto pt-5 text-[19px] font-semibold">{t(p.en, p.hi)}</span>
              <span className="text-[15px] text-ink2">{L(p.sub)}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-[14px] text-ink2 flex gap-2"><Info size={17} className="shrink-0 mt-0.5" />{t('Not sure? The plan name is printed at the top of your policy card.', 'पता नहीं? योजना का नाम पॉलिसी कार्ड के ऊपर छपा होता है।')}</p>
        <Button size="lg" iconRight={ArrowRight} onClick={() => go('docs')}>{t('Continue', 'आगे बढ़ें')}</Button>
      </div>
    </>
  )
}

/* =====================================================================
   ADD DOCUMENTS
   ===================================================================== */
function DocsHealth({ t, L, lang, go, back, showToast, docs, setDocs }) {
  const [cam, setCam] = useState(null)
  const count = HEALTH_DOCS.filter((d) => docs[d.id]).length
  const canCheck = docs.bill && docs.discharge
  const nextMissing = (n) => FILL_ORDER.filter((id) => !docs[id]).slice(0, n)
  const addFiles = (n) => {
    const ids = nextMissing(n)
    if (!ids.length) return showToast(t('All papers are already added.', 'सभी काग़ज़ पहले से जुड़े हैं।'))
    setDocs((s) => ({ ...s, ...Object.fromEntries(ids.map((id) => [id, true])) }))
    showToast(t(`${ids.length} paper${ids.length > 1 ? 's' : ''} read and matched.`, `${ids.length} काग़ज़ पढ़े और मिलाए गए।`))
  }
  const camFor = (id) => { const d = HEALTH_DOCS.find((x) => x.id === id); if (d) setCam(d) }
  const added = HEALTH_DOCS.filter((d) => docs[d.id])
  return (
    <>
      <PageHead onBack={back} lang={lang} onToast={showToast} listenText={pageText}
        title={t('Add your documents', 'अपने काग़ज़ जोड़ें')}
        sub={t('Health claim for Ramesh Kumar · City Care Hospital, Karnal', 'रमेश कुमार का हेल्थ क्लेम · सिटी केयर हॉस्पिटल, करनाल')} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] items-start">
        <div>
          <DropZone onFiles={addFiles} onCamera={() => { const id = nextMissing(1)[0]; id ? camFor(id) : showToast(t('All papers are already added.', 'सभी काग़ज़ पहले से जुड़े हैं।')) }}
            title={t('Drop photos or PDFs, or take a photo', 'फ़ोटो या PDF यहाँ छोड़ें, या फ़ोटो लें')}
            hint={t('Blurry or folded is fine. We read Hindi and English bills.', 'धुंधला या मुड़ा काग़ज़ भी चलेगा। हम हिंदी और अंग्रेज़ी बिल पढ़ते हैं।')}>
            <button onClick={() => addFiles(2)} className="mt-4 h-11 px-4 inline-flex items-center gap-2 rounded-full text-[14px] font-semibold text-em hover:bg-em-tint">
              <Sparkles size={16} />{t('Use sample photos (demo)', 'नमूना फ़ोटो लगाएँ (डेमो)')}
            </button>
          </DropZone>
          <div className="mt-6">
            <SectionLabel>{t(`Uploaded · ${added.length}`, `अपलोड हुए · ${added.length}`)}</SectionLabel>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {added.map((d) => (
                <div key={d.id} className="pop rounded-2xl border border-line bg-surface p-3 flex flex-col items-center text-center">
                  <div className="relative"><DocThumb kind={d.kind} w={52} /><span className="absolute -right-2 -bottom-1 h-6 w-6 rounded-full bg-green text-white grid place-items-center ring-2 ring-white"><Check size={14} strokeWidth={3} /></span></div>
                  <div className="mt-2 text-[13px] font-medium leading-tight">{t(d.en, d.hi)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="lg:sticky lg:top-8">
          <div className="flex items-center gap-4">
            <ProgressRing value={count} max={7} size={76} stroke={7}>
              <span className="num text-[17px] font-semibold leading-none">{count}<span className="text-ink2 font-medium">/7</span></span>
            </ProgressRing>
            <div>
              <div className="text-[18px] font-semibold">{t(`${count} of 7 added`, `7 में से ${count} जुड़े`)}</div>
              <div className="text-[14px] text-ink2">{t('Papers your health policy asks for', 'आपकी हेल्थ पॉलिसी के लिए ज़रूरी काग़ज़')}</div>
            </div>
          </div>
          <ul className="mt-5 flex flex-col">
            {HEALTH_DOCS.map((d) => {
              const has = docs[d.id]
              return (
                <li key={d.id} className="py-3 border-t border-line flex items-start gap-3">
                  <span className={`mt-0.5 h-6 w-6 rounded-full grid place-items-center shrink-0 transition-colors duration-300 ${has ? 'bg-green text-white' : 'border-2 border-[#D6D0C5]'}`}>{has && <Check size={14} strokeWidth={3} className="pop" />}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold">{t(d.en, d.hi)}</div>
                    <div className={`text-[14px] leading-snug ${has ? 'text-green-ink' : 'text-ink2'}`}>{has ? L(d.found) : t('Not added yet', 'अभी नहीं जुड़ा')}</div>
                  </div>
                  {!has && <button onClick={() => setCam(d)} aria-label={t(`Add ${d.en}`, `${d.hi} जोड़ें`)} className="h-11 w-11 -my-2 rounded-full grid place-items-center text-em hover:bg-em-tint"><Plus size={20} /></button>}
                </li>
              )
            })}
          </ul>
          <Button size="lg" className="w-full mt-4" icon={ShieldCheck} disabled={!canCheck} onClick={() => go('reading')}>{t('Check my documents', 'मेरे काग़ज़ जाँचें')}</Button>
          {!canCheck && <p className="mt-2 text-center text-[13px] text-ink2">{t('Add the hospital bill and discharge summary to start.', 'शुरू करने के लिए अस्पताल बिल और डिस्चार्ज समरी जोड़ें।')}</p>}
        </Card>
      </div>
      {cam && <CameraOverlay kind={cam.kind} title={t(cam.en, cam.hi)} onDone={() => { setDocs((s) => ({ ...s, [cam.id]: true })); setCam(null) }} />}
    </>
  )
}

function DocsSimple({ t, lang, back, showToast, policy, simpleDocs, setSimpleDocs, setPolicy, replace }) {
  const [cam, setCam] = useState(null)
  const list = SIMPLE_DOCS[policy]
  const p = POLICIES.find((x) => x.id === policy)
  const have = simpleDocs[policy] || {}
  const count = list.filter((_, i) => have[i]).length
  const addN = (n) => {
    const idx = list.map((_, i) => i).filter((i) => !have[i]).slice(0, n)
    setSimpleDocs((s) => ({ ...s, [policy]: { ...(s[policy] || {}), ...Object.fromEntries(idx.map((i) => [i, true])) } }))
  }
  return (
    <>
      <PageHead onBack={back} lang={lang} onToast={showToast} listenText={pageText} title={t('Add your documents', 'अपने काग़ज़ जोड़ें')} sub={t(p.en, p.hi)} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] items-start">
        <div>
          <DropZone onFiles={addN} onCamera={() => { const i = list.findIndex((_, k) => !have[k]); if (i >= 0) setCam({ i, kind: list[i][2], title: t(list[i][0], list[i][1]) }) }}
            title={t('Drop photos or PDFs, or take a photo', 'फ़ोटो या PDF यहाँ छोड़ें, या फ़ोटो लें')} />
          <Card className="mt-6 bg-em-tint border-em/20 shadow-none flex gap-3">
            <Info size={20} className="text-em shrink-0 mt-0.5" />
            <div>
              <p className="text-[15px] text-ink">{t('The full check for this cover is coming next. For now, use this list to collect every paper before you visit the bank.', 'इस बीमे की पूरी जाँच जल्द आ रही है। अभी, बैंक जाने से पहले इस सूची से सारे काग़ज़ इकट्ठा करें।')}</p>
              <button onClick={() => { setPolicy('health'); replace('docs') }} className="mt-2 h-11 text-[14px] font-semibold text-em">{t('See the full Health check instead →', 'इसकी जगह पूरी हेल्थ जाँच देखें →')}</button>
            </div>
          </Card>
        </div>
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing value={count} max={list.length} size={76} stroke={7}><span className="num text-[17px] font-semibold">{count}<span className="text-ink2">/{list.length}</span></span></ProgressRing>
            <div className="text-[18px] font-semibold">{t(`${count} of ${list.length} added`, `${list.length} में से ${count} जुड़े`)}</div>
          </div>
          <ul className="mt-5">
            {list.map(([en, hi, kind], i) => (
              <li key={en} className="py-3 border-t border-line flex items-center gap-3">
                <span className={`h-6 w-6 rounded-full grid place-items-center shrink-0 ${have[i] ? 'bg-green text-white' : 'border-2 border-[#D6D0C5]'}`}>{have[i] && <Check size={14} strokeWidth={3} />}</span>
                <div className="flex-1"><div className="text-[15px] font-semibold">{t(en, hi)}</div><div className={`text-[14px] ${have[i] ? 'text-green-ink' : 'text-ink2'}`}>{have[i] ? t('Added and readable', 'जुड़ गया, साफ़ पढ़ा जा रहा है') : t('Not added yet', 'अभी नहीं जुड़ा')}</div></div>
                {!have[i] && <button onClick={() => setCam({ i, kind, title: t(en, hi) })} aria-label={t(en, hi)} className="h-11 w-11 rounded-full grid place-items-center text-em hover:bg-em-tint"><Plus size={20} /></button>}
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full mt-4" icon={Check} onClick={() => showToast(t('List saved. We will remind you before the deadline.', 'सूची सेव हो गई। आख़िरी तारीख़ से पहले याद दिलाएँगे।'))}>{t('Save my list', 'मेरी सूची सेव करें')}</Button>
        </Card>
      </div>
      {cam && <CameraOverlay kind={cam.kind} title={cam.title} onDone={() => { setSimpleDocs((s) => ({ ...s, [policy]: { ...(s[policy] || {}), [cam.i]: true } })); setCam(null) }} />}
    </>
  )
}

/* =====================================================================
   READING
   ===================================================================== */
function Reading({ t, lang, onDone }) {
  const steps = [
    t('Reading the hospital bill', 'अस्पताल का बिल पढ़ रहे हैं'),
    t('Reading your policy', 'आपकी पॉलिसी पढ़ रहे हैं'),
    t('Matching bill items to policy rules', 'बिल को पॉलिसी के नियमों से मिला रहे हैं'),
    t('Checking for missing papers', 'छूटे हुए काग़ज़ देख रहे हैं'),
  ]
  const [n, setN] = useState(0)
  useEffect(() => {
    const ids = steps.map((_, i) => setTimeout(() => setN(i + 1), 950 * (i + 1)))
    const end = setTimeout(onDone, 950 * steps.length + 450)
    return () => { ids.forEach(clearTimeout); clearTimeout(end) }
  }, [])
  return (
    <div className="min-h-[70vh] grid place-items-center">
      <Card className="w-full max-w-[520px] p-8 md:p-10 text-center">
        <div className="flex justify-center">
          <ProgressRing value={n} max={steps.length} size={128} stroke={9}>
            <div><div className="num text-[30px] font-semibold leading-none">{Math.round((n / steps.length) * 100)}%</div><div className="text-[13px] text-ink2 mt-1">{t('done', 'पूरा')}</div></div>
          </ProgressRing>
        </div>
        <h1 className={`mt-6 ${lang === 'hi' ? 'font-sans font-semibold text-[28px]' : 'font-serif text-[36px] leading-tight'}`}>{t('Reading your documents', 'आपके काग़ज़ पढ़ रहे हैं')}</h1>
        <p className="mt-1 text-[16px] text-ink2">{t('7 papers · about 4 seconds', '7 काग़ज़ · लगभग 4 सेकंड')}</p>
        <ul className="mt-7 text-left flex flex-col gap-1">
          {steps.map((s, i) => {
            const done = n > i, act = n === i
            return (
              <li key={i} className="flex items-center gap-3 h-11">
                <span className={`h-7 w-7 rounded-full grid place-items-center shrink-0 transition-colors duration-300 ${done ? 'bg-green text-white' : act ? 'border-2 border-em' : 'border-2 border-line'}`}>
                  {done ? <Check size={15} strokeWidth={3} className="pop" /> : act ? <span className="h-2 w-2 rounded-full bg-em animate-pulse" /> : null}
                </span>
                <span className={`text-[16px] transition-colors ${done ? 'text-ink' : act ? 'text-ink font-medium' : 'text-ink2'}`}>{s}</span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

/* =====================================================================
   RESULT
   ===================================================================== */
function ProblemCard({ t, tone, Icon, label, title, line, clause, note, onFix }) {
  const [open, setOpen] = useState(false)
  const c = TONES[tone]
  return (
    <Card className="lift">
      <div className="flex gap-4">
        <span className={`h-11 w-11 rounded-2xl grid place-items-center shrink-0 ${c.bg} ${c.fg}`}><Icon size={22} /></span>
        <div className="flex-1 min-w-0">
          <Chip tone={tone}>{label}</Chip>
          <div className="mt-2 text-[18px] font-semibold leading-snug">{title}</div>
          <p className="mt-1 text-[16px] text-ink2">{line}</p>
        </div>
      </div>
      {open && (
        <div className="mt-4 fade">
          <blockquote className="border-l-[3px] border-em bg-[#FBFAF7] rounded-r-xl px-4 py-3">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink2 mb-1"><Quote size={13} />{t('From your policy wording', 'आपकी पॉलिसी के शब्द')}</div>
            <p className="font-serif text-[19px] leading-snug text-ink">{clause}</p>
          </blockquote>
          {note && <p className="mt-3 text-[15px] text-ink">{note}</p>}
        </div>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="h-11 px-1 inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          {t('Why?', 'क्यों?')}<ChevronDown size={18} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        <Button onClick={onFix} iconRight={ArrowRight}>{t('Fix this', 'इसे ठीक करें')}</Button>
      </div>
    </Card>
  )
}

function PassedList({ t, items }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-[16px] font-semibold">{t('Checks that passed', 'जो जाँच पास हुईं')}</div>
        <Chip tone="green">{t(`${items.length} passed`, `${items.length} पास`)}</Chip>
      </div>
      <ul className="mt-3">
        {items.map((s) => (
          <li key={s} className="py-3 border-t border-line flex items-center gap-3 text-[15px]">
            <CheckCircle2 size={20} className="text-green shrink-0" /><span className="flex-1">{s}</span><span className="text-[13px] font-semibold text-green-ink">{t('Passed', 'पास')}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function Result({ t, lang, go, back, showToast, atRisk, expected, ready, pharmacyOk, fixes }) {
  const problems = (pharmacyOk ? 0 : 1) + (fixes.room ? 0 : 1)
  const passed = [
    t('Discharge summary is complete and signed', 'डिस्चार्ज समरी पूरी और हस्ताक्षरित है'),
    t('Policy active on admission date (20 Nov 2026)', 'भर्ती की तारीख़ (20 नवंबर 2026) पर पॉलिसी चालू थी'),
    t('Hospital is in the insurer’s list', 'अस्पताल बीमा कंपनी की सूची में है'),
    t('Bill total matches item-wise charges', 'बिल का कुल जोड़ हर ख़र्च से मेल खाता है'),
    ...(pharmacyOk ? [t('Pharmacy bills match the medicines', 'दवाई के बिल दवाइयों से मेल खाते हैं')] : []),
    ...(fixes.room ? [t('Hospital letter on room rent added', 'कमरे के किराए पर अस्पताल की चिट्ठी जुड़ी')] : []),
  ]
  return (
    <>
      <PageHead onBack={back} lang={lang} title={t('Your claim check', 'आपके क्लेम की जाँच')}
        sub={problems ? t(`${problems} problem${problems > 1 ? 's' : ''} found. ${problems > 1 ? 'Both' : 'It'} can be fixed before you send.`, `${problems} दिक़्क़त${problems > 1 ? 'ें' : ''} मिलीं। भेजने से पहले ठीक हो सकती हैं।`) : t('No problems left. You are ready to submit.', 'कोई दिक़्क़त नहीं बची। आप जमा करने के लिए तैयार हैं।')} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
        <div className="lg:sticky lg:top-8">
          <ClaimSummaryCard t={t} lang={lang} atRisk={atRisk} expected={expected} ready={ready} showToast={showToast} />
          {ready && <Button size="lg" className="w-full mt-4" iconRight={ArrowRight} onClick={() => go('package')}>{t('Build my claim package', 'मेरा क्लेम पैकेट बनाएँ')}</Button>}
        </div>
        <div className="flex flex-col gap-4">
          {!pharmacyOk && (
            <ProblemCard t={t} tone="red" Icon={XCircle} label={t('Problem · ₹6,800', 'दिक़्क़त · ₹6,800')} onFix={() => go('fix')}
              title={t('Pharmacy bill missing', 'दवाई का बिल नहीं है')}
              line={t("₹6,800 of medicines won't be paid without it.", 'इसके बिना ₹6,800 की दवाइयों का पैसा नहीं मिलेगा।')}
              clause={t('“Clause 6.1: Medicines are payable only against original pharmacy bills supported by the treating doctor’s prescription.”', '“धारा 6.1: दवाइयों का भुगतान केवल डॉक्टर के पर्चे के साथ दवाई के मूल बिल पर होगा।”')}
              note={t('Your hospital bill lists ₹6,800 of medicines, but no pharmacy bill was added.', 'आपके अस्पताल बिल में ₹6,800 की दवाइयाँ हैं, पर दवाई का बिल नहीं जुड़ा।')} />
          )}
          {!fixes.room && (
            <ProblemCard t={t} tone="amber" Icon={AlertTriangle} label={t('Money at risk · ₹5,600', 'ख़तरे में · ₹5,600')} onFix={() => go('fix')}
              title={t('Room rent above your policy limit (₹3,500/day vs ₹2,000/day)', 'कमरे का किराया सीमा से ज़्यादा (₹3,500/दिन बनाम ₹2,000/दिन)')}
              line={t('The insurer may cut other charges too. Ask the hospital for a corrected bill.', 'बीमा कंपनी बाक़ी ख़र्चे भी काट सकती है। अस्पताल से सही बिल माँगें।')}
              clause={t('“Clause 4.2: Room rent is payable up to 1% of the sum insured per day. Clause 4.3: If a higher room is chosen, associated charges are paid in the same proportion.”', '“धारा 4.2: कमरे का किराया बीमा राशि के 1% प्रतिदिन तक देय है। धारा 4.3: महँगा कमरा लेने पर जुड़े ख़र्चे भी उसी अनुपात में दिए जाएँगे।”')}
              note={t('1% of ₹2,00,000 is ₹2,000 a day. You were charged ₹3,500 a day for 4 days, so doctor and nursing charges can be cut too: about ₹5,600. If no general-ward bed was free, the hospital can say so in writing.', '₹2,00,000 का 1% यानी ₹2,000 प्रतिदिन। 4 दिन ₹3,500 प्रतिदिन लगा, इसलिए डॉक्टर और नर्सिंग ख़र्च भी कट सकते हैं: लगभग ₹5,600। अगर जनरल वार्ड में बेड नहीं था, तो अस्पताल लिखकर दे सकता है।')} />
          )}
          <PassedList t={t} items={passed} />
          <p className="text-[13px] text-ink2 flex gap-1.5"><Info size={15} className="shrink-0 mt-0.5" />{t('This is a check, not the insurer’s decision. Every flag shows the clause it is based on.', 'यह एक जाँच है, बीमा कंपनी का फ़ैसला नहीं। हर चेतावनी उस धारा को दिखाती है जिस पर वह आधारित है।')}</p>
        </div>
      </div>
    </>
  )
}

/* =====================================================================
   FIX IT
   ===================================================================== */
function Fix({ t, lang, go, back, showToast, atRisk, expected, ready, pharmacyOk, fixes, setFixes }) {
  const [cam, setCam] = useState(null)
  const fileRef = useRef(); const pending = useRef(null)
  const msg = t('Namaste. Please give a letter that no general-ward bed was free when Ramesh Kumar was admitted on 20 Nov 2026, or a bill at the general-ward rate (₹2,000 a day). It is needed for the insurance claim. – Sunita Devi', 'नमस्ते। कृपया लिखकर दें कि 20 नवंबर 2026 को रमेश कुमार की भर्ती के समय जनरल वार्ड में बेड ख़ाली नहीं था, या जनरल वार्ड रेट (₹2,000 प्रतिदिन) वाला बिल दें। यह बीमा क्लेम के लिए ज़रूरी है। – सुनीता देवी')
  const copy = async () => {
    try { await navigator.clipboard.writeText(msg); showToast(t('Message copied. Show it at the billing desk.', 'संदेश कॉपी हुआ। बिलिंग काउंटर पर दिखाएँ।')) }
    catch (e) { showToast(t('Could not copy here. Show the message from this screen.', 'यहाँ कॉपी नहीं हुआ। इसी स्क्रीन से संदेश दिखाएँ।')) }
  }
  const done = (id) => setFixes((f) => ({ ...f, [id]: true }))
  const tasks = [
    { id: 'pharmacy', kind: 'pharmacy', ok: pharmacyOk, tone: 'red', title: t('Upload the pharmacy bills', 'दवाई के बिल अपलोड करें'), sub: t('Ask the hospital chemist for all receipts. Recovers ₹6,800.', 'अस्पताल के केमिस्ट से सारी रसीदें माँगें। ₹6,800 वापस।'), doneText: t('Pharmacy bills · ₹6,800 · 9 receipts', 'दवाई के बिल · ₹6,800 · 9 रसीदें') },
    { id: 'room', kind: 'corrected', ok: fixes.room, tone: 'amber', title: t('Upload the hospital’s letter or corrected bill', 'अस्पताल की चिट्ठी या सही बिल अपलोड करें'), sub: t('Shows the general-ward rate, or that no ward bed was free. Recovers ₹5,600.', 'जनरल वार्ड रेट, या वार्ड में बेड न होने की बात। ₹5,600 वापस।'), doneText: t('Hospital letter · general ward full on 20 Nov', 'अस्पताल की चिट्ठी · 20 नवंबर को जनरल वार्ड भरा था') },
  ]
  return (
    <>
      <PageHead onBack={back} lang={lang} title={t('Fix it', 'ठीक करें')} sub={t('Two uploads. Watch your expected payout go up with each one.', 'दो अपलोड। हर एक के साथ आपका पैसा बढ़ता देखें।')} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
        <div className="lg:sticky lg:top-8"><ClaimSummaryCard t={t} lang={lang} atRisk={atRisk} expected={expected} ready={ready} showToast={showToast} /></div>
        <div className="flex flex-col gap-4">
          {tasks.map((k, i) => (
            <Card key={k.id} className={`transition-colors duration-300 ${k.ok ? 'border-green/40' : ''}`}>
              <div className="flex items-start gap-4">
                <DocThumb kind={k.kind} w={44} />
                <div className="flex-1 min-w-0">
                  {k.ok ? <Chip tone="green">{t('Done', 'हो गया')}</Chip> : <Chip tone={k.tone}>{t(`Step ${i + 1} of 2`, `क़दम ${i + 1} / 2`)}</Chip>}
                  <div className="mt-2 text-[17px] font-semibold leading-snug">{k.title}</div>
                  <div className={`text-[15px] ${k.ok ? 'text-green-ink' : 'text-ink2'}`}>{k.ok ? k.doneText : k.sub}</div>
                </div>
                {k.ok && <span className="h-10 w-10 rounded-full bg-green text-white grid place-items-center pop shrink-0"><Check size={20} strokeWidth={3} /></span>}
              </div>
              {!k.ok && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button variant="secondary" icon={Upload} onClick={() => { pending.current = k.id; fileRef.current?.click() }}>{t('Upload', 'अपलोड करें')}</Button>
                  <Button variant="secondary" icon={Camera} onClick={() => setCam(k)}>{t('Take a photo', 'फ़ोटो लें')}</Button>
                  {k.id === 'room' && <Button variant="ghost" icon={Copy} onClick={copy}>{t('Copy message for hospital', 'अस्पताल के लिए संदेश कॉपी करें')}</Button>}
                </div>
              )}
            </Card>
          ))}
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { if (e.target.files?.length && pending.current) done(pending.current); e.target.value = '' }} />
          {ready
            ? <Button size="lg" className="self-stretch sm:self-end" iconRight={ArrowRight} onClick={() => go('package')}>{t('Build my claim package', 'मेरा क्लेम पैकेट बनाएँ')}</Button>
            : <p className="text-[14px] text-ink2 text-center sm:text-right">{t('Your package unlocks when both are done.', 'दोनों होने पर आपका पैकेट तैयार होगा।')}</p>}
        </div>
      </div>
      {cam && <CameraOverlay kind={cam.kind} title={cam.title} onDone={() => { done(cam.id); setCam(null) }} />}
    </>
  )
}

/* =====================================================================
   CLAIM PACKAGE
   ===================================================================== */
function Package({ t, L, lang, back, showToast, docs, submitted, onSubmitted }) {
  const order = [
    [t('Claim form, filled for you', 'क्लेम फ़ॉर्म, आपके लिए भरा हुआ'), '1'],
    [t('Policy card', 'पॉलिसी कार्ड'), '1'],
    [t('Final hospital bill · ₹52,000', 'अस्पताल का फ़ाइनल बिल · ₹52,000'), '3'],
    [t('Hospital letter on room rent', 'कमरे के किराए पर अस्पताल की चिट्ठी'), '1'],
    [t('Discharge summary', 'डिस्चार्ज समरी'), '2'],
    [t('Pharmacy bills · ₹6,800', 'दवाई के बिल · ₹6,800'), '3'],
    ...(docs.lab ? [[t('Lab reports', 'जाँच रिपोर्ट'), '1']] : []),
    [t('ID proof · Aadhaar', 'पहचान पत्र · आधार'), '1'],
    [t('Bank passbook', 'बैंक पासबुक'), '1'],
  ]
  const waText = encodeURIComponent(t('Claim Defender: Health claim for Ramesh Kumar is ready. ₹52,000 claimed, about ₹51,000 expected. Submit by 24 Dec 2026.', 'Claim Defender: रमेश कुमार का हेल्थ क्लेम तैयार है। ₹52,000 का क्लेम, लगभग ₹51,000 की उम्मीद। 24 दिसंबर 2026 तक जमा करें।'))
  return (
    <>
      <PageHead onBack={back} lang={lang} onToast={showToast} listenText={pageText} title={t('Your claim package', 'आपका क्लेम पैकेट')}
        sub={t('Checked, complete and in the order the insurer expects.', 'जाँचा हुआ, पूरा, और उसी क्रम में जैसा बीमा कंपनी चाहती है।')} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] items-start">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-wrap items-center gap-4 border-green/40">
            <span className="h-12 w-12 rounded-2xl bg-green-tint text-green-ink grid place-items-center"><CheckCircle2 size={24} /></span>
            <div className="flex-1 min-w-[180px]">
              <Chip tone="green">{t('Ready to submit', 'जमा करने के लिए तैयार')}</Chip>
              <div className="mt-1.5 text-[15px] text-ink2">{t('Expected payout', 'मिलने की उम्मीद')}</div>
            </div>
            <div className="num text-[36px] font-semibold tracking-[-0.02em] text-green-ink">₹51,000</div>
          </Card>

          <Card>
            <div className="text-[17px] font-semibold">{t('Documents, in this order', 'काग़ज़, इसी क्रम में')}</div>
            <ol className="mt-3">
              {order.map(([d, pages], i) => (
                <li key={i} className="py-3 border-t border-line flex items-center gap-3 text-[15px]">
                  <span className="num h-7 w-7 rounded-full bg-soft text-ink text-[13px] font-semibold grid place-items-center shrink-0">{i + 1}</span>
                  <span className="flex-1">{d}</span>
                  <span className="text-[13px] text-ink2 num">{t(`${pages} pg`, `${pages} पेज`)}</span>
                  <Check size={18} className="text-green" aria-label={t('included', 'शामिल')} />
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <div className="text-[17px] font-semibold">{t('Where and how to submit', 'कहाँ और कैसे जमा करें')}</div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-[15px]">
              <div className="flex gap-3"><Building2 size={19} className="text-em shrink-0 mt-0.5" /><div><dt className="text-[13px] text-ink2">{t('Insurer', 'बीमा कंपनी')}</dt><dd>{L(INSURERS.health)}</dd></div></div>
              <div className="flex gap-3 min-w-0"><Mail size={19} className="text-em shrink-0 mt-0.5" /><div className="min-w-0"><dt className="text-[13px] text-ink2">{t('Email the packet to', 'पैकेट ईमेल करें')}</dt><dd className="[overflow-wrap:anywhere]">{HEALTH_EMAIL}</dd></div></div>
              <div className="flex gap-3 sm:col-span-2"><Landmark size={19} className="text-em shrink-0 mt-0.5" /><div><dt className="text-[13px] text-ink2">{t('Or post / hand it to', 'या डाक से / हाथ से दें')}</dt><dd>{t('Claims Dept, Plot 21, Sector 44, Gurugram, Haryana 122003', 'क्लेम विभाग, प्लॉट 21, सेक्टर 44, गुरुग्राम, हरियाणा 122003')}</dd></div></div>
            </dl>
            <div className="mt-5 rounded-2xl bg-amber-tint px-4 py-3.5 flex items-center gap-3">
              <CalendarClock size={20} className="text-amber-ink shrink-0" />
              <div className="text-[15px]"><b className="text-amber-ink">{t('Submit by 24 Dec 2026', '24 दिसंबर 2026 तक जमा करें')}</b><span className="text-ink"> · {t('30 days from discharge on 24 Nov', '24 नवंबर की छुट्टी से 30 दिन')}</span></div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" icon={Download} onClick={() => showToast(t('Demo: in the app this saves Claim-Ramesh-Kumar.pdf (14 pages).', 'डेमो: ऐप में यह Claim-Ramesh-Kumar.pdf (14 पेज) सेव करेगा।'))}>{t('Download claim packet', 'क्लेम पैकेट डाउनलोड करें')}</Button>
            <Button size="lg" variant="secondary" as="a" href={`https://wa.me/?text=${waText}`} icon={Share2}>{t('Share on WhatsApp', 'WhatsApp पर भेजें')}</Button>
          </div>
          {!submitted && <button onClick={onSubmitted} className="self-start h-11 text-[15px] font-semibold text-em underline underline-offset-4">{t('I have submitted it', 'मैंने जमा कर दिया')}</button>}
        </div>

        <div className="lg:sticky lg:top-8">
          <SectionLabel>{t('Preview · Claim-Ramesh-Kumar.pdf', 'प्रीव्यू · Claim-Ramesh-Kumar.pdf')}</SectionLabel>
          <div className="relative">
            <PaperDoc className="absolute inset-0 translate-x-3 translate-y-3 rotate-[1.5deg] shadow-card" />
            <PaperDoc className="relative aspect-[1/1.32] p-7 flex flex-col text-[11px] leading-relaxed text-ink">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Logo size={22} /><span className="font-serif text-[15px]">Claim Defender</span></div>
                <span className="text-ink2">24 Nov 2026</span>
              </div>
              <div className="mt-5 font-serif text-[24px] leading-tight">{t('Health insurance claim', 'स्वास्थ्य बीमा क्लेम')}</div>
              <div className="text-ink2">{L(INSURERS.health)}</div>
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-line py-3">
                {[[t('Patient', 'मरीज़'), t('Ramesh Kumar', 'रमेश कुमार')], [t('Claimant', 'दावेदार'), t('Sunita Devi', 'सुनीता देवी')], [t('Hospital', 'अस्पताल'), t('City Care, Karnal', 'सिटी केयर, करनाल')], [t('Stay', 'भर्ती'), t('20–24 Nov 2026', '20–24 नवंबर 2026')], [t('Sum insured', 'बीमा राशि'), '₹2,00,000'], [t('Claimed', 'क्लेम'), '₹52,000']].map(([k, v]) => (
                  <div key={k}><div className="text-ink2 text-[10px]">{k}</div><div className="font-semibold num">{v}</div></div>
                ))}
              </div>
              <div className="mt-3 font-semibold">{t('Enclosures', 'संलग्न')}</div>
              <ol className="mt-1 space-y-0.5">{order.slice(0, 7).map(([d], i) => <li key={i} className="flex gap-2"><span className="text-ink2 num">{i + 1}.</span>{d}</li>)}</ol>
              <div className="mt-auto pt-3 flex items-end justify-between">
                <div><div className="h-px w-24 bg-ink/40 mb-1" /><div className="text-ink2">{t('Signature of claimant', 'दावेदार के हस्ताक्षर')}</div></div>
                <span className="text-ink2 num">{t('Page 1 of 14', 'पेज 1 / 14')}</span>
              </div>
            </PaperDoc>
          </div>
        </div>
      </div>
    </>
  )
}

/* =====================================================================
   REJECTION DECODER
   ===================================================================== */
function LetterPreview({ t }) {
  return (
    <PaperDoc className="p-6 text-[11px] leading-relaxed">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-[12px]">{t('Bharat Suraksha General', 'भारत सुरक्षा जनरल')}</div>
        <span className="text-ink2">10 Nov 2026</span>
      </div>
      <div className="mt-1 text-ink2">{t('Ref: PMSBY/KNL/2026/0418', 'संदर्भ: PMSBY/KNL/2026/0418')}</div>
      <div className="mt-4 space-y-1.5">{[92, 100, 84, 96, 70].map((w, i) => <div key={i} className="h-2 rounded bg-soft" style={{ width: `${w}%` }} />)}</div>
      <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-red/40 bg-red-tint text-red-ink font-semibold px-2 py-1"><XCircle size={13} />{t('Claim repudiated: documents incomplete', 'क्लेम नामंज़ूर: काग़ज़ अधूरे')}</div>
      <div className="mt-4 space-y-1.5">{[88, 100, 64].map((w, i) => <div key={i} className="h-2 rounded bg-soft" style={{ width: `${w}%` }} />)}</div>
    </PaperDoc>
  )
}

function Decoder({ t, lang, go, back, showToast, letterAdded, setLetterAdded }) {
  const [cam, setCam] = useState(false)
  if (!letterAdded) {
    return (
      <>
        <PageHead onBack={back} lang={lang} onToast={showToast} listenText={pageText} title={t('Understand your rejection letter', 'नामंज़ूरी की चिट्ठी समझें')}
          sub={t('Upload the letter or SMS from your insurer. We explain it in two plain sentences and check if it holds up.', 'बीमा कंपनी की चिट्ठी या SMS अपलोड करें। हम इसे दो आसान वाक्यों में समझाएँगे और जाँचेंगे कि यह सही है या नहीं।')} />
        <div className="max-w-[720px]">
          <DropZone onFiles={() => setLetterAdded(true)} onCamera={() => setCam(true)}
            title={t('Drop the insurer’s letter, or take a photo', 'बीमा कंपनी की चिट्ठी यहाँ छोड़ें, या फ़ोटो लें')}
            hint={t('A photo, PDF, or a screenshot of the SMS or email', 'फ़ोटो, PDF, या SMS / ईमेल का स्क्रीनशॉट')}>
            <button onClick={() => setLetterAdded(true)} className="mt-4 h-11 px-4 inline-flex items-center gap-2 rounded-full text-[14px] font-semibold text-em hover:bg-em-tint"><Sparkles size={16} />{t('Use the sample PMSBY letter (demo)', 'नमूना PMSBY चिट्ठी लगाएँ (डेमो)')}</button>
          </DropZone>
        </div>
        {cam && <CameraOverlay kind="letter" title={t('Rejection letter', 'नामंज़ूरी की चिट्ठी')} onDone={() => { setCam(false); setLetterAdded(true) }} />}
      </>
    )
  }
  return (
    <>
      <PageHead onBack={back} lang={lang} onToast={showToast} listenText={pageText} title={t('What your letter means', 'आपकी चिट्ठी का मतलब')}
        sub={t('PMSBY accident claim · ₹2,00,000 · Ramesh Kumar', 'PMSBY दुर्घटना क्लेम · ₹2,00,000 · रमेश कुमार')} />
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
        <div className="lg:sticky lg:top-8">
          <SectionLabel>{t('Your letter', 'आपकी चिट्ठी')}</SectionLabel>
          <LetterPreview t={t} />
          <div className="mt-4 flex items-center justify-between gap-2"><StatusChip status="rejected" /><span className="text-[14px] font-medium text-red-ink inline-flex items-center gap-1.5"><CalendarClock size={15} />{t('Appeal by 10 Dec 2026', '10 दिसंबर 2026 तक अपील')}</span></div>
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <SectionLabel>{t('What the letter says', 'चिट्ठी में क्या लिखा है')}</SectionLabel>
            <p className="text-[18px] leading-relaxed">{t('Your accident claim of ₹2,00,000 under PMSBY has been rejected. The insurer says two papers never reached them: the FIR copy and the hospital certificate.', 'PMSBY के तहत आपका ₹2,00,000 का दुर्घटना क्लेम नामंज़ूर हुआ है। बीमा कंपनी कहती है कि दो काग़ज़ उन तक नहीं पहुँचे: FIR की कॉपी और अस्पताल का प्रमाण-पत्र।')}</p>
          </Card>
          <Card>
            <SectionLabel>{t('The clause they used', 'जिस धारा का इस्तेमाल किया')}</SectionLabel>
            <blockquote className="border-l-[3px] border-em bg-[#FBFAF7] rounded-r-xl px-4 py-3">
              <p className="font-serif text-[20px] leading-snug">{t('“Claim procedure, para 3: The claim form shall be submitted with a copy of the FIR and the medical certificate from the treating hospital.”', '“क्लेम प्रक्रिया, पैरा 3: क्लेम फ़ॉर्म के साथ FIR की कॉपी और इलाज करने वाले अस्पताल का मेडिकल प्रमाण-पत्र जमा करना होगा।”')}</p>
            </blockquote>
            <p className="mt-3 text-[15px] text-ink2">{t('In plain words: they need proof of the accident and proof of treatment.', 'आसान शब्दों में: उन्हें दुर्घटना और इलाज का सबूत चाहिए।')}</p>
          </Card>
          <div className="rounded-card border border-amber/40 bg-amber-tint p-6">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-amber-ink"><AlertTriangle size={18} />{t('Our check', 'हमारी जाँच')}</div>
            <div className="mt-2 text-[19px] font-semibold leading-snug">{t("This rejection doesn't seem to match your papers", 'यह नामंज़ूरी आपके काग़ज़ों से मेल नहीं खाती')}</div>
            <p className="mt-2 text-[16px] text-ink">{t('Your claim file shows you gave both the FIR copy and the hospital certificate to the bank on 2 Nov 2026 (receipt no. 4471). The bank may not have forwarded them. That makes this worth appealing.', 'आपकी फ़ाइल के अनुसार आपने 2 नवंबर 2026 को FIR की कॉपी और अस्पताल का प्रमाण-पत्र, दोनों बैंक में जमा किए थे (रसीद नं. 4471)। हो सकता है बैंक ने आगे नहीं भेजा। इसलिए अपील करनी चाहिए।')}</p>
          </div>
          <Button size="lg" className="self-stretch sm:self-start" icon={Scale} onClick={() => go('appeal')}>{t('Help me appeal', 'अपील में मदद करें')}</Button>
        </div>
      </div>
    </>
  )
}

/* =====================================================================
   APPEAL BUILDER
   ===================================================================== */
const LETTERS = {
  en: `To,
The Grievance Officer,
Bharat Suraksha General (demo)
(through my bank branch, Sector 12, Karnal)

Subject: Request to review rejected PMSBY claim no. PMSBY/KNL/2026/0418

Sir/Madam,

I am Sunita Devi of Karnal, Haryana. The PMSBY accident claim of ₹2,00,000 for my husband, Ramesh Kumar, was rejected on 10 Nov 2026 with the reason "documents incomplete".

I gave the FIR copy and the hospital certificate to the bank on 2 Nov 2026 (receipt no. 4471). Copies are attached again with this letter.

Please review my claim and settle it. Kindly reply within 14 days.

Attached:
1. Rejection letter dated 10 Nov 2026
2. FIR copy
3. Hospital certificate
4. Bank receipt no. 4471
5. Aadhaar card copy
6. Bank passbook copy

Yours faithfully,
Sunita Devi
Karnal, Haryana
Mobile: 98XXX XXX21
Date: 24 Nov 2026`,
  hi: `सेवा में,
शिकायत अधिकारी (Grievance Officer),
भारत सुरक्षा जनरल (डेमो)
(मेरी बैंक शाखा, सेक्टर 12, करनाल के माध्यम से)

विषय: नामंज़ूर PMSBY क्लेम नं. PMSBY/KNL/2026/0418 की दोबारा जाँच का अनुरोध

महोदय/महोदया,

मैं सुनीता देवी, करनाल, हरियाणा से हूँ। मेरे पति रमेश कुमार का ₹2,00,000 का PMSBY दुर्घटना क्लेम 10 नवंबर 2026 को "काग़ज़ अधूरे" बताकर नामंज़ूर कर दिया गया।

मैंने FIR की कॉपी और अस्पताल का प्रमाण-पत्र 2 नवंबर 2026 को बैंक में जमा कर दिया था (रसीद नं. 4471)। इनकी कॉपी इस पत्र के साथ फिर से लगा रही हूँ।

कृपया मेरे क्लेम की दोबारा जाँच करके भुगतान करें। कृपया 14 दिन के अंदर जवाब दें।

संलग्न:
1. 10 नवंबर 2026 की नामंज़ूरी की चिट्ठी
2. FIR की कॉपी
3. अस्पताल का प्रमाण-पत्र
4. बैंक रसीद नं. 4471
5. आधार कार्ड की कॉपी
6. बैंक पासबुक की कॉपी

भवदीया,
सुनीता देवी
करनाल, हरियाणा
मोबाइल: 98XXX XXX21
तारीख़: 24 नवंबर 2026`,
}

function Appeal({ t, lang, back, showToast, appealSent, onSent }) {
  const [letterLang, setLetterLang] = useState(lang)
  const [texts, setTexts] = useState(LETTERS)
  const [sheet, setSheet] = useState(false)
  const text = texts[letterLang]
  const steps = [
    { Icon: Mail, title: t('Grievance to the insurer', 'बीमा कंपनी को शिकायत'), when: t('Now · by 10 Dec 2026', 'अभी · 10 दिसंबर 2026 तक'), sub: t('The letter on the right. Most claims are settled here.', 'दाईं ओर की चिट्ठी। ज़्यादातर क्लेम यहीं सुलझ जाते हैं।'), state: appealSent ? 'done' : 'now' },
    { Icon: Landmark, title: t('Bima Bharosa', 'बीमा भरोसा'), when: t('If no reply in 14 days', '14 दिन में जवाब न आए तो'), sub: t('IRDAI’s official grievance portal. We fill it in with you.', 'IRDAI का सरकारी शिकायत पोर्टल। हम साथ में भरेंगे।'), state: appealSent ? 'now' : 'later' },
    { Icon: Scale, title: t('Insurance Ombudsman', 'बीमा लोकपाल'), when: t('Free · if still unresolved', 'मुफ़्त · अगर तब भी हल न हो'), sub: t('An independent officer who decides disputes. No lawyer needed.', 'स्वतंत्र अधिकारी जो विवाद तय करते हैं। वकील की ज़रूरत नहीं।'), state: 'later' },
  ]
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); showToast(t('Letter copied.', 'चिट्ठी कॉपी हुई।')) }
    catch (e) { showToast(t('Could not copy in this browser.', 'इस ब्राउज़र में कॉपी नहीं हुआ।')) }
  }
  return (
    <>
      <PageHead onBack={back} lang={lang} title={t('Your appeal', 'आपकी अपील')} sub={t('PMSBY claim no. PMSBY/KNL/2026/0418 · ₹2,00,000', 'PMSBY क्लेम नं. PMSBY/KNL/2026/0418 · ₹2,00,000')} />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)] items-start">
        <Card className="lg:sticky lg:top-8">
          <div className="text-[17px] font-semibold">{t('Three steps, all free', 'तीन क़दम, सब मुफ़्त')}</div>
          <ol className="mt-5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`h-11 w-11 rounded-full grid place-items-center shrink-0 ${s.state === 'done' ? 'bg-green text-white' : s.state === 'now' ? 'bg-em text-white' : 'bg-soft text-ink2'}`}>{s.state === 'done' ? <Check size={20} strokeWidth={3} /> : <s.Icon size={19} />}</span>
                  {i < steps.length - 1 && <span className={`w-[2px] flex-1 my-1.5 rounded ${s.state === 'done' ? 'bg-green' : 'bg-line'}`} />}
                </div>
                <div className={i < steps.length - 1 ? 'pb-6' : ''}>
                  <div className={`text-[13px] font-semibold ${s.state === 'now' ? 'text-em' : s.state === 'done' ? 'text-green-ink' : 'text-ink2'}`}>{s.state === 'done' ? t('Sent · 24 Nov 2026', 'भेजी · 24 नवंबर 2026') : s.when}</div>
                  <div className="text-[16px] font-semibold leading-snug">{s.title}</div>
                  <div className="text-[14px] text-ink2">{s.sub}</div>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div>
          <Card pad={false} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-line bg-[#FBFAF7]">
              <div className="flex items-center gap-2 text-[14px] font-semibold"><FileText size={17} className="text-em" />{t('Appeal letter', 'अपील की चिट्ठी')}</div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-full bg-soft p-1" role="group" aria-label={t('Letter language', 'चिट्ठी की भाषा')}>
                  {[['en', 'English'], ['hi', 'हिंदी']].map(([k, l]) => (
                    <button key={k} onClick={() => setLetterLang(k)} aria-pressed={letterLang === k} className={`h-9 px-3.5 rounded-full text-[14px] font-semibold transition-all ${letterLang === k ? 'bg-surface shadow-card text-ink' : 'text-ink2'}`}>{l}</button>
                  ))}
                </div>
                <ListenButton getText={() => text} lang={letterLang} onFail={showToast} className="h-10 px-3 text-[14px]" />
              </div>
            </div>
            <div className="bg-[#F6F3EE] p-3 sm:p-6">
              <PaperDoc className="shadow-card">
                <textarea value={text} onChange={(e) => setTexts((s) => ({ ...s, [letterLang]: e.target.value }))} aria-label={t('Appeal letter, editable', 'अपील की चिट्ठी, बदल सकते हैं')}
                  className="block w-full min-h-[560px] resize-y bg-transparent px-6 py-7 sm:px-10 sm:py-9 text-[15px] leading-[1.75] text-ink focus:outline-none rounded-[14px]" />
              </PaperDoc>
              <p className="mt-3 text-[13px] text-ink2 flex items-center gap-1.5"><Info size={14} />{t('Your details are filled in. Click anywhere in the letter to change a word.', 'आपकी जानकारी भरी है। कोई शब्द बदलने के लिए चिट्ठी में कहीं भी क्लिक करें।')}</p>
            </div>
          </Card>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" icon={Copy} onClick={copy}>{t('Copy', 'कॉपी')}</Button>
            <Button variant="secondary" icon={Download} onClick={() => showToast(t('Demo: in the app this saves the letter as a PDF.', 'डेमो: ऐप में यह चिट्ठी PDF में सेव होगी।'))}>{t('Download PDF', 'PDF डाउनलोड करें')}</Button>
            {appealSent
              ? <Chip tone="green" className="h-12 px-5 text-[15px] self-center">{t('Sent on 24 Nov 2026', '24 नवंबर 2026 को भेजी')}</Chip>
              : <Button icon={Mail} onClick={() => setSheet(true)}>{t('Send by email', 'ईमेल से भेजें')}</Button>}
          </div>
        </div>
      </div>

      {sheet && (
        <Sheet onClose={() => setSheet(false)} title={t('Send by email', 'ईमेल से भेजें')}>
          <div className={lang === 'hi' ? 'text-[24px] font-semibold' : 'font-serif text-[30px] leading-tight'}>{t('Send your appeal', 'अपनी अपील भेजें')}</div>
          <dl className="mt-4 flex flex-col gap-3 text-[15px]">
            <div className="rounded-2xl bg-soft px-4 py-3"><dt className="text-[13px] text-ink2">{t('To', 'किसे')}</dt><dd className="[overflow-wrap:anywhere]">grievance@bharat-suraksha.example</dd></div>
            <div className="rounded-2xl bg-soft px-4 py-3"><dt className="text-[13px] text-ink2">{t('Attached', 'साथ में')}</dt><dd>{t('Appeal letter (PDF) + 6 papers from your claim file', 'अपील की चिट्ठी (PDF) + आपकी फ़ाइल के 6 काग़ज़')}</dd></div>
          </dl>
          <p className="mt-3 text-[14px] text-ink2 flex gap-1.5"><Info size={16} className="shrink-0 mt-0.5" />{t('If there is no reply by 8 Dec 2026, we help you file on Bima Bharosa.', '8 दिसंबर 2026 तक जवाब न आए, तो हम बीमा भरोसा पर शिकायत में मदद करेंगे।')}</p>
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={() => setSheet(false)}>{t('Not now', 'अभी नहीं')}</Button>
            <Button icon={Mail} onClick={() => { setSheet(false); onSent() }}>{t('Send now', 'अभी भेजें')}</Button>
          </div>
        </Sheet>
      )}
    </>
  )
}

/* =====================================================================
   MY CLAIMS
   ===================================================================== */
function Claims({ t, L, lang, go, showToast, healthStatus, appealSent, checked }) {
  const rows = [
    {
      id: 'h', Icon: Hospital, name: t('Health · Ramesh Kumar', 'स्वास्थ्य · रमेश कुमार'), sub: t('City Care Hospital, Karnal', 'सिटी केयर हॉस्पिटल, करनाल'), insurer: L(INSURERS.health), amount: 52000, status: healthStatus,
      next: { checking: t('Add papers and check', 'काग़ज़ जोड़ें और जाँचें'), fix: t('Fix 2 problems', '2 दिक़्क़तें ठीक करें'), ready: t('Submit to insurer', 'बीमा कंपनी को जमा करें'), submitted: t('Wait for reply', 'जवाब का इंतज़ार') }[healthStatus],
      date: t('24 Dec 2026', '24 दिसंबर 2026'), urgent: false,
      onClick: () => go(healthStatus === 'checking' ? 'choose' : healthStatus === 'fix' ? 'result' : 'package'),
    },
    {
      id: 'p', Icon: Bike, name: t('Accident · PMSBY', 'दुर्घटना · PMSBY'), sub: t('Rejected – documents incomplete', 'नामंज़ूर – काग़ज़ अधूरे'), insurer: L(INSURERS.pmsby), amount: 200000, status: appealSent ? 'appeal' : 'rejected',
      next: appealSent ? t('Bima Bharosa if no reply', 'जवाब न आए तो बीमा भरोसा') : t('Appeal', 'अपील करें'), date: appealSent ? t('8 Dec 2026', '8 दिसंबर 2026') : t('10 Dec 2026', '10 दिसंबर 2026'), urgent: !appealSent,
      onClick: () => go(appealSent ? 'appeal' : 'decoder'),
    },
    {
      id: 'c', Icon: Wheat, name: t('Crop · PMFBY, Kharif 2025', 'फ़सल · PMFBY, ख़रीफ़ 2025'), sub: t('Hail damage, 1.5 acres', 'ओलावृष्टि, 1.5 एकड़'), insurer: L(INSURERS.pmfby), amount: 18500, status: 'paid',
      next: t('Paid in full', 'पूरा भुगतान'), date: t('12 Mar 2026', '12 मार्च 2026'), urgent: false,
      onClick: () => showToast(t('Closed. ₹18,500 was paid in full to the account ending 4417.', 'बंद। ₹18,500 पूरा …4417 वाले खाते में आया।')),
    },
  ]
  return (
    <>
      <PageHead lang={lang} onToast={showToast} listenText={pageText} title={t('My claims', 'मेरे क्लेम')} sub={t('Everything in one place, with the next step and its date.', 'सब एक जगह, अगले क़दम और उसकी तारीख़ के साथ।')} />
      {/* table: laptop and desktop */}
      <Card pad={false} className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[13px] text-ink2 border-b border-line bg-[#FBFAF7]">
              {[t('Claim', 'क्लेम'), t('Insurer', 'बीमा कंपनी'), t('Amount', 'रक़म'), t('Status', 'स्थिति'), t('Next action', 'अगला क़दम'), t('Date', 'तारीख़')].map((h, i) => (
                <th key={h} className={`font-semibold px-5 py-3.5 ${i === 2 ? 'text-right' : ''} ${i === 1 || i === 5 ? 'hidden xl:table-cell' : ''} whitespace-nowrap`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={r.onClick} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && r.onClick()} className="border-b border-line last:border-0 cursor-pointer hover:bg-[#FDFCFA] transition-colors">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="h-10 w-10 rounded-xl bg-soft grid place-items-center shrink-0"><r.Icon size={19} /></span><div className="min-w-0"><div className="text-[15px] font-semibold whitespace-nowrap">{r.name}</div><div className="text-[13px] text-ink2">{r.sub}</div><div className="text-[13px] text-ink2 xl:hidden">{r.insurer}</div></div></div></td>
                <td className="px-5 py-4 text-[14px] text-ink2 hidden xl:table-cell">{r.insurer}</td>
                <td className="px-5 py-4 text-right num text-[15px] font-semibold whitespace-nowrap">{inr(r.amount)}</td>
                <td className="px-5 py-4"><StatusChip status={r.status} /></td>
                <td className={`px-5 py-4 text-[14px] font-medium ${r.urgent ? 'text-red-ink' : ''}`}><span className="inline-flex items-center gap-1.5 whitespace-nowrap">{r.next}{r.status !== 'paid' && <ChevronRight size={16} />}</span><div className={`xl:hidden num text-[13px] ${r.urgent ? 'font-semibold' : 'text-ink2 font-normal'}`}>{r.date}</div></td>
                <td className={`hidden xl:table-cell px-5 py-4 text-[14px] whitespace-nowrap num ${r.urgent ? 'text-red-ink font-semibold' : 'text-ink2'}`}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {/* cards: phone and tablet */}
      <div className="lg:hidden grid gap-3 md:grid-cols-2">
        {rows.map((r) => (
          <button key={r.id} onClick={r.onClick} className="text-left bg-surface border border-line rounded-card shadow-card p-5">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-xl bg-soft grid place-items-center shrink-0"><r.Icon size={19} /></span>
              <div className="flex-1 min-w-0"><div className="text-[16px] font-semibold leading-snug">{r.name}</div><div className="text-[13px] text-ink2">{r.insurer}</div></div>
              <div className="num text-[16px] font-semibold">{inr(r.amount)}</div>
            </div>
            <div className="mt-3"><StatusChip status={r.status} /></div>
            <div className={`mt-3 pt-3 border-t border-line flex items-center gap-2 text-[14px] font-medium ${r.urgent ? 'text-red-ink' : ''}`}>
              <CalendarClock size={16} /><span className="flex-1">{r.next} · {r.date}</span><ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/* =====================================================================
   HELP
   ===================================================================== */
function Help({ t, lang, showToast, restart }) {
  const words = [
    [t('Sum insured', 'बीमा राशि'), t('The most your policy pays in a year. Yours is ₹2,00,000.', 'एक साल में पॉलिसी से मिलने वाली सबसे ज़्यादा रक़म। आपकी ₹2,00,000 है।')],
    [t('Proportionate deduction', 'आनुपातिक कटौती'), t('If your room costs more than allowed, other charges are cut by the same share.', 'कमरा सीमा से महँगा हो, तो बाक़ी ख़र्चे भी उसी हिस्से में कटते हैं।')],
    [t('Repudiation', 'नामंज़ूरी'), t('The insurer’s word for rejecting a claim.', 'क्लेम नामंज़ूर करने का बीमा कंपनी का शब्द।')],
    [t('Bima Bharosa', 'बीमा भरोसा'), t('The insurance regulator’s free online complaint portal.', 'बीमा नियामक का मुफ़्त ऑनलाइन शिकायत पोर्टल।')],
    [t('Insurance Ombudsman', 'बीमा लोकपाल'), t('A free, independent officer who settles disputes.', 'विवाद सुलझाने वाले मुफ़्त, स्वतंत्र अधिकारी।')],
  ]
  return (
    <>
      <PageHead lang={lang} onToast={showToast} listenText={pageText} title={t('Help', 'मदद')} sub={t('No question is too small.', 'कोई भी सवाल छोटा नहीं।')} />
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="text-[17px] font-semibold">{t('Talk to a person', 'किसी से बात करें')}</div>
            <p className="mt-1 text-[15px] text-ink2">{t('Hindi and English · 9 am to 7 pm, Monday to Saturday', 'हिंदी और अंग्रेज़ी · सुबह 9 से शाम 7, सोमवार से शनिवार')}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button icon={Phone} onClick={() => showToast(t('Demo: this would call 1800-000-0000 (toll-free).', 'डेमो: यह 1800-000-0000 (टोल-फ़्री) पर कॉल करेगा।'))}>{t('Call helpline', 'हेल्पलाइन पर कॉल करें')}</Button>
              <span className="num text-[15px] font-semibold">1800-000-0000</span>
            </div>
          </Card>
          <Card>
            <div className="text-[17px] font-semibold">{t('How Claim Defender works', 'Claim Defender कैसे काम करता है')}</div>
            <ol className="mt-3">
              {[t('Upload photos of your papers', 'अपने काग़ज़ों की फ़ोटो अपलोड करें'), t('We read them and match every item to your policy', 'हम उन्हें पढ़कर हर चीज़ को पॉलिसी से मिलाते हैं'), t('Fix problems before you send', 'भेजने से पहले दिक़्क़तें ठीक करें'), t('If it is still cut, we write your appeal', 'फिर भी कटे, तो हम अपील लिखते हैं')].map((s, i) => (
                <li key={i} className="py-3 border-t border-line flex items-center gap-3 text-[15px]"><span className="num h-7 w-7 rounded-full bg-em-tint text-em text-[13px] font-semibold grid place-items-center shrink-0">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card>
            <div className="text-[17px] font-semibold">{t('Words you may see', 'शब्द जो आप देख सकते हैं')}</div>
            <dl className="mt-2">{words.map(([w, d]) => <div key={w} className="py-3 border-t border-line"><dt className="text-[15px] font-semibold">{w}</dt><dd className="text-[14px] text-ink2">{d}</dd></div>)}</dl>
          </Card>
          <Card className="bg-[#F6F3EE] shadow-none">
            <div className="flex gap-3"><Lock size={20} className="text-em shrink-0 mt-0.5" /><p className="text-[14px]">{t('Your papers are read to check your claim, then deleted. We never sell your data. Claim Defender is a claim checker and appeal drafter, not legal advice. This prototype uses sample data.', 'आपके काग़ज़ सिर्फ़ जाँच के लिए पढ़े जाते हैं, फिर मिटा दिए जाते हैं। हम डेटा कभी नहीं बेचते। Claim Defender क्लेम जाँचने और अपील लिखने का साधन है, क़ानूनी सलाह नहीं। यह प्रोटोटाइप नमूना डेटा इस्तेमाल करता है।')}</p></div>
            <button onClick={restart} className="mt-3 h-11 text-[14px] font-semibold text-em">{t('Restart demo', 'डेमो फिर से शुरू करें')}</button>
          </Card>
        </div>
      </div>
    </>
  )
}
