// الصورة اللي بتظهر على وجه الروبوت
const PHOTO = '/assets/me.jpg';

// الكلام اللي بيقوله الروبوت (عدّل عليه متل ما بدك)
const SCRIPTS = {
  en: { lang: 'en', dir: 'ltr', lines: [
    "Hi! I'm Jawad Haidar, and this robot is going to introduce me.",
    "I'm a software developer who builds responsive web and desktop applications with React, PHP, Java, C sharp and ASP.NET, backed by solid SQL database design.",
    "I hold a B.Sc. in Computer Science from the Lebanese International University, with a GPA of 3.3.",
    "Since March 2025 I've delivered six applications: a gym platform, a restaurant CMS, a Java Swing hospital app, an ASP.NET MVC repository, and a React movie library.",
    "I set up role-based access control and use SQL Server triggers and procedures to keep data reliable.",
    "If you'd like to work with me, scroll down to the contact section. Thanks for visiting!"
  ] },
  ar: { lang: 'ar', dir: 'rtl', lines: [
    "مرحباً! أنا جواد حيدر، وهذا الروبوت رح يعرّفكم عليّ.",
    "أنا مطوّر برمجيات، بني تطبيقات ويب وسطح مكتب بواجهات متجاوبة باستخدام React وPHP وJava وC# وASP.NET، مع تصميم قواعد بيانات SQL متين.",
    "حاصل على بكالوريوس في علوم الحاسوب من الجامعة اللبنانية الدولية بمعدل 3.3.",
    "منذ آذار 2025 أنجزت ستة تطبيقات: منصة نادي رياضي، ونظام إدارة محتوى لمطعم، وتطبيق مستشفى بـ Java Swing، ومستودع بـ ASP.NET MVC، ومكتبة أفلام بـ React.",
    "أضبط صلاحيات الوصول حسب الأدوار وأستخدم المشغّلات والإجراءات المخزّنة في SQL Server لضمان موثوقية البيانات.",
    "إذا حبيتوا تشتغلوا معي، انتقلوا إلى قسم التواصل في الأسفل. شكراً لزيارتكم!"
  ] }
};

const robotSVG = (cls) => `
<svg class="rb-svg ${cls}" viewBox="0 0 150 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <clipPath id="rbClip${cls}"><rect x="32" y="40" width="86" height="72" rx="14"/></clipPath>
    <linearGradient id="rbBody${cls}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
  </defs>
  <circle class="rb-ring" cx="75" cy="76" r="62" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="75" y1="12" x2="75" y2="28" stroke="#64748b" stroke-width="3"/>
  <circle class="antenna-dot" cx="75" cy="10" r="6" fill="#38bdf8"/>
  <rect x="20" y="28" width="110" height="98" rx="26" fill="url(#rbBody${cls})" stroke="#334155" stroke-width="2"/>
  <rect x="10" y="60" width="10" height="28" rx="5" fill="#334155"/><rect x="130" y="60" width="10" height="28" rx="5" fill="#334155"/>
  <rect x="32" y="40" width="86" height="72" rx="14" fill="#0b1220"/>
  <g clip-path="url(#rbClip${cls})">
    <image href="${PHOTO}" x="32" y="40" width="86" height="72" preserveAspectRatio="xMidYMid slice"/>
  </g>
  <rect x="32" y="40" width="86" height="72" rx="14" fill="none" stroke="#38bdf8" stroke-opacity=".7" stroke-width="2"/>
  <rect class="mouth" x="58" y="118" width="34" height="4" rx="2" fill="#38bdf8"/>
  <rect x="48" y="134" width="54" height="24" rx="10" fill="url(#rbBody${cls})" stroke="#334155" stroke-width="2"/>
  <circle cx="75" cy="146" r="4" fill="#2563eb"/>
</svg>`;

const root = document.createElement('div');
root.innerHTML = `
  <div class="rb-tip" id="rbTip">Meet my robot 👋</div>
  <button class="rb-fab" id="rbFab" aria-label="Open robot guide">${robotSVG('fab')}</button>
  <section class="rb-panel" id="rbPanel" aria-live="polite">
    <div class="rb-head"><div>Jawad's Robot Guide<small>Hear a quick intro about me</small></div><button class="rb-x" id="rbX" aria-label="Close">✕</button></div>
    <div class="rb-stage" id="rbStage"><div class="rb-big">${robotSVG('big')}</div></div>
    <div class="rb-caption" id="rbCap">Press “Introduce Jawad” and I'll talk you through my profile.</div>
    <div class="rb-row">
      <button class="rb-btn primary" id="rbPlay">▶ Introduce Jawad</button>
      <button class="rb-btn" id="rbLang">العربية</button>
    </div>
  </section>`;
document.body.append(...root.children);

const $ = (id) => document.getElementById(id);
const panel = $('rbPanel'), cap = $('rbCap'), stage = $('rbStage'), fab = $('rbFab');
let lang = 'en', runId = 0, speaking = false;
const synth = window.speechSynthesis;

const setSpeaking = (on) => {
  speaking = on;
  [stage, fab].forEach((el) => el.classList.toggle('speaking', on));
  $('rbPlay').textContent = on ? '⏹ Stop' : (lang === 'en' ? '▶ Introduce Jawad' : '▶ عرّف بجواد');
};

const voiceFor = (code) =>
  (synth?.getVoices() || []).find((v) => v.lang.toLowerCase().startsWith(code)) || null;

function stop() { runId++; synth?.cancel(); setSpeaking(false); }

function speak() {
  const s = SCRIPTS[lang], id = ++runId;
  cap.dir = s.dir;
  if (!synth) { cap.textContent = s.lines.join(' '); return; }
  synth.cancel(); setSpeaking(true);
  const next = (i) => {
    if (id !== runId) return;
    if (i >= s.lines.length) { setSpeaking(false); return; }
    cap.textContent = s.lines[i];
    const u = new SpeechSynthesisUtterance(s.lines[i]);
    u.lang = s.lang; u.rate = 0.98; u.pitch = 1;
    const v = voiceFor(s.lang); if (v) u.voice = v;
    u.onend = () => next(i + 1);
    u.onerror = () => next(i + 1);
    synth.speak(u);
  };
  next(0);
}

fab.addEventListener('click', () => {
  panel.classList.toggle('open');
  $('rbTip').style.opacity = 0;
  if (!panel.classList.contains('open')) stop();
});
$('rbX').addEventListener('click', () => { panel.classList.remove('open'); stop(); });
$('rbPlay').addEventListener('click', () => (speaking ? stop() : speak()));
$('rbLang').addEventListener('click', () => {
  stop(); lang = lang === 'en' ? 'ar' : 'en';
  $('rbLang').textContent = lang === 'en' ? 'العربية' : 'English';
  cap.dir = SCRIPTS[lang].dir;
  cap.textContent = lang === 'en'
    ? "Press “Introduce Jawad” and I'll talk you through my profile."
    : 'اضغط «عرّف بجواد» وسأحدّثكم عني.';
  setSpeaking(false);
});
setTimeout(() => { const t = $('rbTip'); if (t) t.style.opacity = 0; }, 9000);