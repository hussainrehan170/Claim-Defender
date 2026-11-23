@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
html, body { background: #FAF8F5; }
body { margin: 0; font-family: Inter, "Noto Sans Devanagari", system-ui, sans-serif; font-size: 16px; line-height: 1.55; color: #14161A; -webkit-font-smoothing: antialiased; font-feature-settings: "cv11", "ss01"; }
.num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
*:focus-visible { outline: 2px solid #0F766E; outline-offset: 2px; }
button { -webkit-tap-highlight-color: transparent; }
svg.lucide[stroke-width="2"] { stroke-width: 1.75; }

.lift { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease; }
@media (hover: hover) { .lift:hover { transform: translateY(-2px); box-shadow: 0 2px 4px rgba(20,22,26,.05), 0 12px 28px rgba(20,22,26,.08); } }

@keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.page-in { animation: pageIn 240ms ease-out both; }
@keyframes popIn { 0% { transform: scale(.5); opacity: 0; } 70% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
.pop { animation: popIn 300ms ease-out both; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 1s linear infinite; }
@keyframes flash { 0% { opacity: 0; } 20% { opacity: .9; } 100% { opacity: 0; } }
.flash { animation: flash 350ms ease-out both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade { animation: fadeIn 200ms ease-out both; }
@keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.rise { animation: rise 260ms ease-out both; }
@keyframes toastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
.toast { animation: toastIn 200ms ease-out both; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}
