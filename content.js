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

    // تحديات الجسم في الفضاء + المؤشرات التي نرصدها بها (رموز أولًا، التفاصيل في التلميح)
    body: {
      challengesHead: { ar: "تحديات الجسم في الفضاء", en: "Space physiology challenges" },
      indicatorsHead: { ar: "ما نرصده وما يكشفه", en: "What we monitor and what it detects" },
      detectedBy: { ar: "نرصده بـ", en: "Detected by" },
      detects: { ar: "يكشف", en: "Detects" },
      live: { ar: "يعمل الآن", en: "Live now" },
      planned: { ar: "مخطط · نفس المحرك", en: "Planned · same engine" },
      simulated: { ar: "محاكى", en: "Simulated" },
      honest: { ar: "الأخضر يعمل الآن في المحرك. البقية إشارات إضافية تدخل نفس خط الأساس الشخصي ونفس الإنذار.", en: "Green runs in the engine today. The rest are extra signals feeding the same personal baseline and alert." },
      ch: [
        { id: "fluid", s: { ar: "انتقال السوائل", en: "Fluid shift" }, d: { ar: "انتقال السوائل نحو الجزء العلوي من الجسم (Cephalad Fluid Shift)", en: "Cephalad fluid shift toward the upper body" } },
        { id: "sans", s: { ar: "العين والضغط", en: "SANS" }, d: { ar: "ارتفاع الضغط داخل الجمجمة ومتلازمة العين العصبية (SANS)", en: "Raised intracranial pressure and Spaceflight-Associated Neuro-ocular Syndrome" } },
        { id: "cardio", s: { ar: "ضعف القلب", en: "Heart deconditioning" }, d: { ar: "انخفاض حجم البلازما وضعف الكتلة العضلية للقلب (Cardiovascular Deconditioning)", en: "Lower plasma volume and cardiac muscle loss" } },
        { id: "arrhythmia", s: { ar: "اضطراب النظم", en: "Arrhythmias" }, d: { ar: "عدم انتظام ضربات القلب (Arrhythmias)", en: "Irregular heart rhythm" } },
        { id: "ortho", s: { ar: "دوخة الوقوف", en: "Orthostatic" }, d: { ar: "عدم تحمل الجاذبية الانتصابية عند العودة (Orthostatic Intolerance)", en: "Orthostatic intolerance on return to gravity" } },
        { id: "circadian", s: { ar: "الساعة البيولوجية", en: "Circadian" }, d: { ar: "اضطراب الساعة البيولوجية وجودة النوم (Circadian Rhythm Disruption)", en: "Circadian rhythm and sleep quality disruption" } },
        { id: "stress", s: { ar: "الإجهاد النفسي", en: "Stress" }, d: { ar: "الإجهاد العصبي والنفسي الناتج عن العزلة (Psychological & Autonomic Stress)", en: "Psychological and autonomic stress from isolation" } },
        { id: "heat", s: { ar: "حرارة وجفاف", en: "Heat & dehydration" }, d: { ar: "الإجهاد الحراري والجفاف أثناء المهام الخارجية (Thermal Stress & Dehydration during EVA)", en: "Thermal stress and dehydration during EVA" } },
        { id: "hypoxia", s: { ar: "نقص الأكسجين", en: "Hypoxia" }, d: { ar: "نقص الأكسجة وتغيرات التنفس داخل البدلة الفضائية (Hypoxia & Respiratory Changes)", en: "Hypoxia and breathing changes in the suit" } },
        { id: "immune", s: { ar: "المناعة", en: "Immunity" }, d: { ar: "ضعف الاستجابة المناعية وزيادة القابلية للالتهابات (Immune Dysregulation)", en: "Immune dysregulation and higher infection risk" } },
        { id: "radiation", s: { ar: "الإشعاع", en: "Radiation" }, d: { ar: "تأثيرات التعرض للإشعاع الفضائي على العلامات الحيوية (Space Radiation Effects)", en: "Space radiation effects on vital signs" } }
      ],
      ind: [
        { id: "hrsleep", st: "live", s: { ar: "النبض + النوم", en: "Resting HR + sleep" }, d: { ar: "مراقبة معدل النبض أثناء الراحة وجودة الاستشفاء (Resting HR & Sleep Recovery)", en: "Resting HR and sleep recovery" }, ch: ["cardio", "circadian", "stress"] },
        { id: "co2", st: "live", s: { ar: "CO2 المقصورة", en: "Cabin CO2" }, d: { ar: "CO2 المقصورة من بيانات ناسا الحقيقية (OSDR)", en: "Cabin CO2 from real NASA data (OSDR)" }, ch: ["hypoxia", "stress"] },
        { id: "rad", st: "live", s: { ar: "الجرعة التراكمية", en: "Cumulative dose" }, d: { ar: "تتبع الجرعة الإشعاعية التراكمية لكل رائد", en: "Cumulative radiation dose per astronaut" }, ch: ["radiation"] },
        { id: "bp", st: "plan", s: { ar: "ضغط الدم", en: "Blood pressure" }, d: { ar: "تتبع منحنيات ضغط الدم ومقارنتها بالمعدل القاعدي (Blood Pressure Trends vs. Baseline). مؤشر غير مباشر لـ SANS، وتشخيصه بفحص العين.", en: "Blood pressure trends vs baseline. Indirect for SANS, which is diagnosed by eye exam." }, ch: ["fluid", "sans", "cardio", "ortho"] },
        { id: "ecg", st: "plan", s: { ar: "تخطيط القلب", en: "ECG" }, d: { ar: "الرصد المستمر لمخطط كهربية القلب (Continuous ECG Monitoring)", en: "Continuous ECG monitoring" }, ch: ["arrhythmia"] },
        { id: "hrv", st: "plan", s: { ar: "تقلب النبض", en: "HRV" }, d: { ar: "تحليل تقلبات معدل ضربات القلب لقياس الإجهاد (Heart Rate Variability)", en: "Heart rate variability for stress" }, ch: ["stress", "circadian"] },
        { id: "temp", st: "plan", s: { ar: "حرارة الجسم", en: "Core temp" }, d: { ar: "المراقبة اللحظية لدرجة حرارة الجسم الأساسية (Core Body Temperature)", en: "Real-time core body temperature" }, ch: ["heat", "immune"] },
        { id: "spo2", st: "plan", s: { ar: "SpO2 + التنفس", en: "SpO2 + breathing" }, d: { ar: "رصد تشبع الأكسجين ومعدل التنفس (SpO2 & Respiratory Rate)", en: "Oxygen saturation and respiratory rate" }, ch: ["hypoxia"] },
        { id: "eva", st: "plan", s: { ar: "وضع EVA", en: "EVA mode" }, d: { ar: "وضع حماية المهام الخارجية (EVA Safety Mode): حرارة، أكسجين، نبض أثناء السير الفضائي", en: "EVA Safety Mode: heat, oxygen and heart rate during spacewalks" }, ch: ["heat", "hypoxia"] },
        { id: "inflam", st: "sim", s: { ar: "مؤشرات الالتهاب", en: "Inflammation" }, d: { ar: "نظام الإنذار المبكر للاستجابات الالتهابية (Early Inflammatory Biomarkers Alerts). في العرض: المؤشر الكيميائي المحاكى.", en: "Early inflammatory biomarker alerts. In the demo: the simulated chemical marker." }, ch: ["immune"] }
      ]
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
      source: { ar: "المصدر: NASA OSDR Environmental Data App · خطوة التحقق اكتشفت قيمة التعبئة الثابتة (3000 ppm) في أول 5 أيام واستبعدتها", en: "Source: NASA OSDR Environmental Data App · the validation step found the constant fill value (3000 ppm) in the first 5 days and excluded it" },
      // مسار البيانات: ناسا ← تحقق ← محرك المخاطر ← المخرجات (pipeline.js)
      pipe: {
        head: { ar: "مسار البيانات", en: "Data pipeline" },
        modeAna: { ar: "التحليلات", en: "Analytics" },
        loading: { ar: "تحميل قراءات ناسا الخام…", en: "Loading raw NASA readings…" },
        replay: { ar: "RR-12", en: "RR-12" },
        replayTip: { ar: "إعادة تشغيل مهمة RR-12 يومًا بيوم عبر المسار كاملًا", en: "Replay mission RR-12 day by day through the whole pipeline" },
        src: { ar: "قراءة ناسا", en: "NASA readings" },
        srcTip: { ar: "قراءات خام كل 5 دقائق من NASA OSDR EDA: CO2 والحرارة والرطوبة، وجرعة الإشعاع اليومية", en: "Raw 5-minute readings from NASA OSDR EDA: CO2, temperature, humidity, plus daily radiation dose" },
        val: { ar: "تحقق: مُعلَّمة", en: "Validation: flagged" },
        valTip: { ar: "كل قيمة تُفحص: فجوات، قيم مفقودة، خارج المدى الفيزيائي، حساس عالق، قفزات. العالق والمستحيل يُستبعد، والقفزة تُصحَّح بوسيط الساعة.", en: "Every value is checked: gaps, missing, physically impossible, stuck sensor, spikes. Stuck and impossible values are excluded; spikes are replaced by the hourly median." },
        eng: { ar: "محرك المخاطر", en: "Risk engine" },
        engTip: { ar: "4 قنوات: CO2 والحرارة والرطوبة والإشعاع. خط أساس من أول 14 يومًا + CUSUM، وحد ناسا الثابت لـ CO2 (3 mmHg).", en: "4 channels: CO2, temperature, humidity, radiation. 14-day baseline + CUSUM, plus NASA's fixed CO2 limit (3 mmHg)." },
        o: { mon: { ar: "المخاطر", en: "Risk" }, alerts: { ar: "تنبيهات", en: "Alerts" }, dash: { ar: "اللوحة", en: "Dashboard" }, ana: { ar: "تحليلات", en: "Analytics" } },
        f: { stuck: { ar: "حساس عالق", en: "Stuck sensor" }, spike: { ar: "قفزة صُحّحت", en: "Spike corrected" }, gap: { ar: "فجوة في البث", en: "Data gap" }, range: { ar: "خارج المدى", en: "Out of range" }, missing: { ar: "مفقودة", en: "Missing" } },
        checked: { ar: "قيمة فُحصت", en: "Values checked" },
        valid: { ar: "صالحة للمحرك", en: "Valid for the engine" },
        valHead: { ar: "تحقق البيانات", en: "Data validation" },
        ch: { co2: { ar: "CO2", en: "CO2" }, temp: { ar: "حرارة المقصورة", en: "Cabin temp" }, hum: { ar: "الرطوبة", en: "Humidity" }, rad: { ar: "الإشعاع", en: "Radiation" } },
        base: { ar: "خط الأساس", en: "Baseline" },
        lvl: { 0: { ar: "ضمن خط الأساس", en: "Within baseline" }, 2: { ar: "مراقبة: تغيّر بطيء", en: "Monitor: slow change" }, 3: { ar: "تجاوز حد ناسا", en: "Over NASA limit" } },
        monNote: { ar: "النقطة: لون أعلى مستوى في آخر 3 أيام", en: "Dot: highest level in the last 3 days" },
        radHead: { ar: "الإشعاع: المعدل اليومي مقابل الجرعة التراكمية", en: "Radiation: daily rate vs cumulative dose" },
        radRate: { ar: "المعدل", en: "Rate" },
        radCum: { ar: "التراكمية", en: "Cumulative" },
        total: { ar: "المجموع", en: "Total" }, gcr: { ar: "أشعة كونية GCR", en: "Cosmic rays GCR" }, saa: { ar: "شذوذ جنوب الأطلسي SAA", en: "South Atlantic Anomaly SAA" },
        trendHead: { ar: "اتجاه CO2 مقابل حد ناسا", en: "CO2 trend vs NASA limit" },
        trend: { ar: "اتجاه آخر 14 يومًا (إسقاط)", en: "Last-14-day trend (projection)" },
        toLimit: { ar: "إن استمر الاتجاه يصل الحد بعد ≈", en: "If the trend continues, limit in ≈" },
        noRise: { ar: "لا اتجاه صاعد الآن", en: "No rising trend now" },
        hour: { ar: "أعلى متوسط ساعة", en: "Max 1-hour average" },
        honest: { ar: "البيئة والإشعاع قياسات ناسا حقيقية للمقصورة، وليست قياسات طبية للرواد. العلامات الحيوية في العرض محاكاة.", en: "Environment and radiation are real NASA cabin measurements, not medical readings of astronauts. Vitals in the demo are simulated." },
        alertTest: { ar: "CO2 · اختبار مصطنع", en: "CO2 · synthetic test" }
      }
    },

    // طبقة الاقتراحات: عند الإنذار نعرض ماذا تغيّر، ماذا قد يحدث، وماذا نقترح. اقتراح لطبيب الطاقم فقط، ليس وصفة.
    advice: {
      head: { ar: "المستشار الذكي", en: "Smart Advisor" },
      personal: { ar: "الاستشارة الشخصية", en: "Personal Advice" },
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
      challengeName: { ar: "Create Health Monitoring Software for Astronauts on Space Missions", en: "Create Health Monitoring Software for Astronauts on Space Missions" },
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
      newAlert: { ar: "تنبيه جديد", en: "New alert" },
      alertsLog: { ar: "آخر التنبيهات", en: "Recent alerts" },
      noAlerts: { ar: "لا تنبيهات بعد", en: "No alerts yet" },
      close: { ar: "إغلاق", en: "Close" }
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
