/* =====================================================================
   VITALX — ملف المحتوى (عدّل هنا فقط) · Content file (edit here only)
   ---------------------------------------------------------------------
   الموقع 6 شاشات فقط. كل نص مكتوب باللغتين هكذا: { ar: "...", en: "..." }
   أي نص بين ⟨ ⟩ خانة لم تُستكمل بعد، ويظهر في الموقع بلون مميز.
   الحساب كله في engine.js، والأرقام في sim أسفل الملف.
   ===================================================================== */

window.VITALX_CONTENT = {

  defaultLang: "ar",
  ui: { langToggle: { ar: "English", en: "العربية" } },

  alerts: {
    1: { name: { ar: "معلومة", en: "Info" } },
    2: { name: { ar: "مراقبة", en: "Monitor" } },
    3: { name: { ar: "عاجل", en: "Urgent" } }
  },

  site: {
    title: { ar: "VITALX", en: "VITALX" },
    subtitle: { ar: "فريق NovaCore · يكشف الانحراف البطيء في صحة الرائد قبل الحدود الثابتة", en: "Team NovaCore · catches slow drift in astronaut health before fixed limits do" },
    synthetic: { ar: "بيانات مولّدة · ليست بيانات رواد حقيقيين", en: "Synthetic data · not real crew data" },
    disclaimer: { ar: "أداة دعم قرار لطبيب الطاقم، وليست تشخيصاً.", en: "Decision support for the crew medical officer, not diagnosis." },

    screens: {
      home:     { ar: "الرئيسية", en: "Home" },
      problem:  { ar: "المشكلة", en: "Problem" },
      solution: { ar: "الحل", en: "Solution" },
      edge:     { ar: "ما يميزنا", en: "Our edge" },
      demo:     { ar: "العرض الحي", en: "Live demo" },
      nasa:     { ar: "ناسا", en: "NASA" }
    },

    // 1) المشكلة
    problem: {
      head: { ar: "الانحراف البطيء يمرّ تحت الحد الثابت", en: "Slow drift slips under a fixed limit" },
      stats: [
        { v: "≈20", u: { ar: "دقيقة", en: "min" }, t: { ar: "تأخر الاتصال مع الأرض في رحلة المريخ", en: "Earth link delay on a Mars mission" } },
        { v: "+0.25", u: "bpm/day", t: { ar: "ارتفاع بطيء لا يُلاحظ يوماً بيوم (محاكى)", en: "A slow rise you can't see day to day (simulated)" } },
        { v: "85", u: "bpm", t: { ar: "حد ثابت واحد لكل الرواد", en: "One fixed limit for every astronaut" } }
      ],
      chart: { ar: "نبض الراحة للرائد أ", en: "Resting HR, Crew A" },
      onset: { ar: "بدء الانحراف", en: "Drift starts" }
    },

    // 2) الحل: الساعة واللوحي
    solution: {
      steps: [
        { ar: "خط أساس شخصي", en: "Personal baseline" },
        { ar: "robust z", en: "robust z" },
        { ar: "CUSUM", en: "CUSUM" },
        { ar: "تنبيه مع السبب", en: "Alert + reason" }
      ],
      watch: { ar: "ساعة الرائد", en: "Astronaut watch" },
      tablet: { ar: "لوحة طبيب الطاقم", en: "Crew medical officer tablet" },
      adapt: { ar: "أول 14 يوماً تكيّف: لا تُحسب في خط الأساس", en: "First 14 days are adaptation: excluded from the baseline" }
    },

    // 3) ما يميزنا
    edge: {
      personal: { ar: "خط أساس لكل رائد", en: "A baseline per astronaut" },
      personalNote: { ar: "النبض الطبيعي لكل رائد (الوسيط)", en: "Each astronaut's normal HR (median)" },
      why: { ar: "لماذا التنبيه؟", en: "Why this alert?" },
      whyNote: { ar: "مساهمة كل إشارة يوم آخر تنبيه", en: "Each signal's share on the last alert day" },
      noAlert: { ar: "لا تنبيه حتى الآن", en: "No alert yet" },
      proj: { ar: "إسقاط اتجاه 14 يوماً", en: "14-day trend projection" },
      projAt: { ar: "يعبر عتبة المراقبة قرب اليوم", en: "Crosses the monitoring line near day" },
      projNone: { ar: "لا اتجاه صاعد واضح الآن", en: "No clear rising trend now" },
      projErr: { ar: "خطأ التوقيت (الوسيط، 200 رائد محاكى):", en: "Timing error (median, 200 simulated crew):" },
      days: { ar: "يوم", en: "days" }
    },

    // 4) العرض الحي
    demo: {
      ours: { ar: "VITALX (شخصي)", en: "VITALX (personal)" },
      fixed: { ar: "الحد الثابت", en: "Fixed threshold" },
      detected: { ar: "كشف يوم", en: "Detected day" },
      waiting: { ar: "لم يكشف بعد", en: "Not detected yet" },
      earlier: { ar: "أبكر بـ", en: "Earlier by" },
      cohort: { ar: "على 200 رائد محاكى", en: "Across 200 simulated crew" },
      rate: { ar: "نسبة الكشف", en: "Detection rate" },
      delay: { ar: "التأخير (الوسيط)", en: "Delay (median)" },
      fa: { ar: "إنذار كاذب / 100 يوم", en: "False alarms / 100 days" },
      hint: { ar: "اضغط تشغيل وشاهد من يكشف أولاً", en: "Press play and see who catches it first" }
    },

    // 5) ناسا
    nasa: {
      head: { ar: "كل إشارة مربوطة بخطر في برنامج أبحاث الإنسان HRP", en: "Every signal maps to a NASA Human Research Program (HRP) risk" },
      map: [
        { ch: "sleep", risk: "Sleep Loss, Circadian Desynchronization & Work Overload" },
        { ch: "co2", risk: { ar: "⟨اسم خطر HRP المرتبط بـ CO2 — تحققوا من الاسم الدقيق⟩", en: "⟨HRP risk related to CO2 — verify exact title⟩" } },
        { ch: "rad", risk: "Radiation Carcinogenesis" },
        { ch: "hr", risk: { ar: "مؤشر عام للإجهاد، يُقرأ مع النوم وCO2", en: "General strain marker, read with sleep and CO2" } }
      ],
      honest: { ar: "البيانات مولّدة، والسيناريوهات مبنية على مخاطر HRP. لم نستخدم أي مجموعة بيانات من ناسا.", en: "The data is synthetic; the scenarios are based on HRP risks. We did not use any NASA dataset." },
      link: { ar: "خارطة أبحاث HRP", en: "HRP Human Research Roadmap" },
      team: { ar: "الفريق", en: "Team" },
      challenge: { ar: "التحدي", en: "Challenge" },
      challengeName: { ar: "⟨اسم تحدي ناسا⟩", en: "⟨NASA challenge name⟩" },
      members: { ar: "الأعضاء", en: "Members" },
      membersNames: { ar: "⟨أسماء أعضاء الفريق⟩", en: "⟨Team member names⟩" }
    },

    player: {
      play: { ar: "تشغيل", en: "Play" }, pause: { ar: "إيقاف", en: "Pause" },
      restart: { ar: "من البداية", en: "Restart" }, step: { ar: "يوم واحد", en: "One day" },
      next: { ar: "الرائد التالي", en: "Next crew" },
      tilt: { ar: "التنقل بالإمالة", en: "Tilt to navigate" },
      tiltOn: { ar: "الإمالة تعمل", en: "Tilt on" },
      speed: { ar: "السرعة", en: "Speed" }, day: { ar: "اليوم", en: "Day" },
      perSec: { ar: "يوم/ث", en: "days/s" }
    },
    phase: {
      adapt: { ar: "مرحلة التكيف", en: "Adaptation phase" },
      calib: { ar: "معايرة خط الأساس", en: "Calibrating baseline" },
      watch: { ar: "مراقبة شخصية فعّالة", en: "Personal monitoring active" }
    },
    status: {
      0: { ar: "ضمن خط الأساس", en: "Within baseline" },
      1: { ar: "معلومة", en: "Info" },
      2: { ar: "مراقبة", en: "Monitor" },
      3: { ar: "عاجل", en: "Urgent" },
      calib: { ar: "معايرة", en: "Calibrating" }
    },
    labels: {
      composite: { ar: "الدرجة المركبة", en: "Composite score" },
      dose: { ar: "الجرعة التراكمية", en: "Cumulative dose" },
      radShort: { ar: "الإشعاع", en: "Radiation" },
      baselineBand: { ar: "خط الأساس ±3", en: "Baseline ±3" },
      observed: { ar: "القراءة اليومية", en: "Daily reading" },
      fixedThr: { ar: "العتبة الثابتة", en: "Fixed threshold" },
      monitorLine: { ar: "عتبة المراقبة الشخصية", en: "Personal monitoring line" },
      newAlert: { ar: "تنبيه جديد", en: "New alert" }
    },

    /* الطاقم: رموز وليس أسماء أشخاص حقيقيين. driftMult: 0 = لا انحراف (رائد مستقر) */
    crew: [
      { id: "A", seed: 11, driftMult: 1.2, noiseMult: 1.0, onset: 50,
        name: { ar: "الرائد أ", en: "Crew A" }, role: { ar: "قائد المهمة", en: "Commander" } },
      { id: "B", seed: 23, driftMult: 0,   noiseMult: 1.0, onset: 60,
        name: { ar: "الرائد ب", en: "Crew B" }, role: { ar: "مهندس الطيران", en: "Flight engineer" } },
      { id: "C", seed: 37, driftMult: 0.8, noiseMult: 1.1, onset: 68,
        name: { ar: "الرائد ج", en: "Crew C" }, role: { ar: "أخصائي المهمة", en: "Mission specialist" } },
      { id: "D", seed: 53, driftMult: 1.0, noiseMult: 1.3, onset: 58,
        name: { ar: "الرائد د", en: "Crew D" }, role: { ar: "عالم المهمة", en: "Science officer" } }
    ]
  },

  /* إعدادات المحاكاة — أرقام عرض فقط، وليست قيماً سريرية */

  sim: {
    seed: 42,
    missionDays: 120,
    preflightDays: 30,
    cohortSize: 200,
    onsetRange: [45, 75],       // يبدأ الانحراف عشوائياً بين هذين اليومين
    detectWindow: 40,           // يُحسب الكشف ناجحاً إذا حدث خلال هذه الأيام بعد البدء
    adaptation: { days: 14, tau: 4 },   // مرحلة التكيف المصطنعة (أيام التجاهل، وسرعة التلاشي)

    // direction: +1 يعني الارتفاع سيئ، -1 الانخفاض سيئ
    channels: {
      hr:    { name: { ar: "نبض الراحة", en: "Resting HR" }, unit: "bpm", popMean: 62, popSd: 7, noiseSd: 2.5, preflightOffsetSd: 2.0, adaptAmp: 6, drift: 0.25, direction: +1, weight: 1, minScale: { type: "relative", value: 0.05 } },
      sleep: { name: { ar: "مدة النوم", en: "Sleep" }, unit: "h", popMean: 6.8, popSd: 0.5, noiseSd: 0.45, preflightOffsetSd: 0.3, adaptAmp: -0.8, drift: -0.02, direction: -1, weight: 1, minScale: { type: "absolute", value: 0.25 } },
      co2:   { name: { ar: "CO2 المقصورة", en: "Cabin CO2" }, unit: "mmHg", popMean: 2.6, popSd: 0.3, noiseSd: 0.25, preflightOffsetSd: 0.0, adaptAmp: 0, drift: 0.03, direction: +1, weight: 1, minScale: { type: "relative", value: 0.05 } },
      chem:  { name: { ar: "مؤشر كيميائي (محاكى)", en: "Chemical marker (simulated)" }, unit: "a.u.", popMean: 10, popSd: 2, noiseSd: 1.2, preflightOffsetSd: 0.5, adaptAmp: 1.5, drift: 0.06, direction: +1, weight: 0.5, minScale: { type: "relative", value: 0.05 } }
    },

    radiation: { dailyMean: 0.5, dailySd: 0.08, limit: 50 },   // mSv — أرقام عرض فقط

    personal: {
      baselineMode: "stable",   // preflight | stable | naive | rolling
      stableWindow: 14,
      k: 0.5,
      h: 5,
      rollingWindow: 28,
      guardZ: 2.5,               // القيم الأبعد من هذا لا تدخل خط الأساس المتحرك
      anchorMaxShiftZ: 1.0,      // أقصى انزياح لخط الأساس المتحرك عن الخط المستقر (بوحدات المقياس)
      useAnchor: true,
      includeChem: false,        // الكيميائي خارج الدرجة افتراضياً؛ وزنه عند الإدخال في channels.chem.weight
      urgentZ: 3                 // عاجل: الدرجة المركبة + إشارتان أو أكثر فوق هذا الحد
    },

    fixed: {
      thresholds: { hr: { op: ">", value: 85 }, sleep: { op: "<", value: 6 }, co2: { op: ">", value: 4 } },
      persistenceDays: 2,
      ignoreAdaptation: true     // للعدالة: فترة التجاهل نفسها على الطريقتين
    },

    projection: { window: 14, monitorZ: 3, evalOffsets: [0, 7, 14], compareWindows: [7, 10, 14] },

    sensitivity: { noise: [0.5, 1, 1.5, 2], drift: [0.5, 1, 1.5], reps: 80 }
  }
};
