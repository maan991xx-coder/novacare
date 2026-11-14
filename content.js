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
    subtitle: { ar: "فريق NovaCare · يكشف الانحراف البطيء في صحة الرائد قبل الحدود الثابتة", en: "Team NovaCare · catches slow drift in astronaut health before fixed limits do" },
    synthetic: { ar: "العلامات الحيوية محاكاة · CO2 من ناسا", en: "Vital signs simulated · CO2 from NASA" },
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
      chart: { ar: "نبض الراحة: الفارس الزكواني", en: "Resting HR: Al-Faris AlZakwani" },
      onset: { ar: "بدء الانحراف", en: "Drift starts" }
    },

    // 2) الحل: الساعة واللوحي
    solution: {
      steps: [
        { ar: "قياس", en: "Measure" },
        { ar: "خط أساسك", en: "Your baseline" },
        { ar: "انحراف", en: "Drift" },
        { ar: "تنبيه + السبب", en: "Alert + why" },
        { ar: "المستشار", en: "Advisor" }
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
      hint: { ar: "اضغط تشغيل وشاهد من يكشف أولاً", en: "Press play and see who catches it first" },
      // وضع بيانات ناسا الحقيقية (RR-12)
      modeSim: { ar: "محاكاة الطاقم", en: "Crew simulation" },
      modeReal: { ar: "بيانات ناسا حقيقية", en: "Real NASA data" },
      realTitle: { ar: "CO2 مقصورة محطة الفضاء · مهمة RR-12 (2019)", en: "ISS cabin CO2 · mission RR-12 (2019)" },
      realTag: { ar: "بيانات ناسا حقيقية", en: "Real NASA data" },
      testTag: { ar: "اختبار مصطنع", en: "Synthetic test" },
      observed: { ar: "CO2 الحقيقي (وسيط يومي)", en: "Real CO2 (daily median)" },
      drift: { ar: "+ ارتفاع مصطنع 0.05/يوم", en: "+ synthetic rise 0.05/day" },
      limit: { ar: "حد ناسا 3 mmHg", en: "NASA limit 3 mmHg" },
      realOurs: { ar: "VITALX على البيانات الحقيقية", en: "VITALX on real data" },
      realFixed: { ar: "حد ناسا الثابت", en: "NASA fixed limit" },
      noAlarm: { ar: "لا إنذار كاذب", en: "No false alarm" },
      noBreach: { ar: "لم يُتجاوز", en: "Not crossed" },
      driftHead: { ar: "اختبار: نضيف ارتفاعًا بطيئًا فوق البيانات الحقيقية", en: "Test: add a slow rise on top of the real data" },
      never: { ar: "لم يكشف", en: "Never" },
      day: { ar: "يوم", en: "day" },
      allHead: { ar: "على 10 مهمات ناسا حقيقية", en: "Across 10 real NASA missions" },
      allQuiet: { ar: "هادئة: لا إنذار", en: "Quiet: no alert" },
      allBelow: { ar: "ارتفاع رصده VITALX دون الحد", en: "Rise VITALX caught below the limit" },
      allSame: { ar: "VITALX والحد معًا", en: "VITALX and limit together" },
      allFixed: { ar: "قفزة مفاجئة: الحد أسبق", en: "Sudden spike: limit first" },
      allNote: { ar: "الحد الثابت يلتقط القفزات، وVITALX يلتقط الانجراف البطيء: يعملان معًا", en: "Fixed limits catch spikes, VITALX catches slow drift: they work together" },
      source: { ar: "المصدر: NASA OSDR Environmental Data App · أول 5 أيام قيمة تعبئة ثابتة فاستُبعدت", en: "Source: NASA OSDR Environmental Data App · first 5 days were a constant fill value and were excluded" }
    },

    // طبقة الاقتراحات: عند الإنذار نعرض ماذا تغيّر، ماذا قد يحدث، وماذا نقترح. اقتراح لطبيب الطاقم فقط، ليس وصفة.
    advice: {
      head: { ar: "المستشار الذكي", en: "Smart Advisor" },
      tag: { ar: "اقتراح", en: "Suggestion" },
      foot: { ar: "يراجعه طبيب الطاقم ويقرر", en: "Crew medical officer reviews and decides" },
      ok: { ar: "كل شيء ضمن خطك", en: "All within baseline" },
      what: { ar: "ما تغيّر", en: "What changed" },
      risk: { ar: "إن استمر", en: "If it continues" },
      act: { ar: "نقترح", en: "We suggest" },
      ch: {
        sleep: {
          s: { what: { ar: "النوم ↓", en: "Sleep ↓" }, risk: { ar: "إرهاق", en: "Fatigue" }, act: { ar: "نوم 7 س", en: "Sleep 7 h" } },
          what: { ar: "نومك أقل من معدلك الشخصي لعدة ليالٍ", en: "Sleep below your personal norm for several nights" },
          risk: { ar: "إرهاق، بطء رد الفعل، أخطاء انتباه في المهام", en: "Fatigue, slower reactions, attention errors on tasks" },
          act: { ar: "نافذة نوم 7 ساعات، تخفيف الإضاءة والشاشات قبل النوم، مراجعة الجدول", en: "7-hour sleep window, dim lights and screens before bed, review the schedule" }
        },
        hr: {
          s: { what: { ar: "النبض ↑", en: "Heart rate ↑" }, risk: { ar: "إجهاد", en: "Strain" }, act: { ar: "راحة + ماء", en: "Rest + water" } },
          what: { ar: "نبض الراحة أعلى من خطك الشخصي", en: "Resting heart rate above your personal baseline" },
          risk: { ar: "إجهاد متراكم أو بداية عارض صحي", en: "Accumulated strain or an early health issue" },
          act: { ar: "تقليل الحمل اليوم، شرب الماء، قياس متابعة غدًا مع الطبيب", en: "Lighter load today, hydrate, follow-up check with the doctor tomorrow" }
        },
        co2: {
          s: { what: { ar: "CO2 ↑", en: "CO2 ↑" }, risk: { ar: "صداع", en: "Headache" }, act: { ar: "تهوية", en: "Ventilate" } },
          what: { ar: "CO2 المقصورة يرتفع ببطء عن المعتاد", en: "Cabin CO2 creeping above its usual level" },
          risk: { ar: "صداع، ضعف التركيز، نوم أسوأ", en: "Headache, poor focus, worse sleep" },
          act: { ar: "فحص التهوية وجهاز إزالة CO2، تجنّب التجمع في وحدة واحدة", en: "Check ventilation and the CO2 scrubber, avoid crowding one module" }
        },
        chem: {
          s: { what: { ar: "مؤشر ↕", en: "Marker ↕" }, risk: { ar: "يحتاج فحص", en: "Needs check" }, act: { ar: "إعادة القياس", en: "Re-measure" } },
          what: { ar: "المؤشر الكيميائي خارج نطاقك الشخصي", en: "Chemical marker outside your personal range" },
          risk: { ar: "تغيّر يحتاج تفسيرًا من الطبيب", en: "A change the doctor should interpret" },
          act: { ar: "تكرار القياس ومراجعته مع الطبيب", en: "Repeat the measurement and review with the doctor" }
        }
      }
    },

    // 5) ناسا
    nasa: {
      head: { ar: "كل إشارة مربوطة بخطر في برنامج أبحاث الإنسان HRP", en: "Every signal maps to a NASA Human Research Program (HRP) risk" },
      map: [
        { ch: "sleep", risk: "Sleep Loss, Circadian Desynchronization & Work Overload" },
        { ch: "co2", risk: "Ambient Carbon Dioxide Exposure in Crewed Vehicles (CO2 Risk)" },
        { ch: "rad", risk: "Radiation Carcinogenesis" },
        { ch: "hr", risk: { ar: "مؤشر عام للإجهاد، يُقرأ مع النوم وCO2", en: "General strain marker, read with sleep and CO2" } }
      ],
      honest: { ar: "بيئة المقصورة (CO2) بيانات ناسا حقيقية من OSDR لمهمة RR-12. العلامات الحيوية للرواد محاكاة، لأن بيانات البشر عند ناسا محمية.", en: "Cabin environment (CO2) is real NASA OSDR data from mission RR-12. Crew vital signs are simulated, because NASA human data is access-controlled." },
      link: { ar: "خارطة أبحاث HRP", en: "HRP Human Research Roadmap" },
      team: { ar: "الفريق", en: "Team" },
      challenge: { ar: "التحدي", en: "Challenge" },
      challengeName: { ar: "⟨اسم تحدي ناسا⟩", en: "⟨NASA challenge name⟩" },
      members: { ar: "الأعضاء", en: "Members" },
      membersNames: { ar: "الفارس الزكواني · عبدالملك الغنيمي · معن الشبيبي · رَونق الزكواني · فاطمة الحارثي", en: "Al-Faris AlZakwani · Abdulmalik AlGhunaimi · Maan AlShabibi · Rawnuq AlZakwani · Fatma AlHarthi" }
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

    /* الطاقم: أعضاء فريق NovaCare (البيانات مولّدة وليست قياساتهم). driftMult: 0 = لا انحراف (رائد مستقر) */
    crew: [
      { id: "A", seed: 11, driftMult: 1.2, noiseMult: 1.0, onset: 50,
        name: { ar: "الفارس الزكواني", en: "Al-Faris AlZakwani" }, role: { ar: "القيادة", en: "Command" } },
      { id: "B", seed: 23, driftMult: 0,   noiseMult: 1.0, onset: 60,
        name: { ar: "عبدالملك الغنيمي", en: "Abdulmalik AlGhunaimi" }, role: { ar: "هندسة الطيران", en: "Flight engineering" } },
      { id: "C", seed: 37, driftMult: 0.8, noiseMult: 1.1, onset: 68,
        name: { ar: "معن الشبيبي", en: "Maan AlShabibi" }, role: { ar: "عمليات المهمة", en: "Mission operations" } },
      { id: "D", seed: 53, driftMult: 1.0, noiseMult: 1.3, onset: 58,
        name: { ar: "رَونق الزكواني", en: "Rawnuq AlZakwani" }, role: { ar: "العلوم", en: "Science" } },
      { id: "E", seed: 71, driftMult: 0.6, noiseMult: 1.0, onset: 64,
        name: { ar: "فاطمة الحارثي", en: "Fatma AlHarthi" }, role: { ar: "الطب", en: "Medical" } }
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
