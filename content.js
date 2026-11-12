/* =====================================================================
   VITALX — ملف المحتوى (عدّل هنا فقط) · Content file (edit here only)
   ---------------------------------------------------------------------
   كل نصوص الموقع وأرقامه وإعدادات المحاكاة موجودة في هذا الملف.
   كل نص مكتوب باللغتين هكذا:  { ar: "...", en: "..." }
   لا تحتاج لمس index.html أو app.js لتغيير أي نص أو رقم.

   status:
     "built"     = مبنية ومُثبتة      / Built & validated
     "designed"  = مصمَّمة             / Designed
     "future"    = مستقبلية · بحث      / Future · research
     "simulated" = محاكاة              / Simulated
     "pending"   = بانتظار قرار الفريق / Pending team decision
   أي نص يبدأ بـ "⟨" خانة لم تُستكمل بعد، وتظهر في الموقع بلون مميز.
   ===================================================================== */

window.VITALX_CONTENT = {

  defaultLang: "ar",

  meta: {
    title: { ar: "VITALX — دعم قرار طبيب الطاقم", en: "VITALX — Crew Medical Officer Decision Support" },
    teamName: { ar: "فريق NovaCore", en: "Team NovaCore" },
    challenge: { ar: "⟨اسم تحدي ناسا الذي تشاركون فيه⟩", en: "⟨NASA challenge name⟩" },
    targetPrizes: ["Best Mission Concept", "Galactic Impact"],
    disclaimer: {
      ar: "VITALX أداة دعم قرار وليست أداة تشخيص. القرار الطبي لطبيب الطاقم دائماً.",
      en: "VITALX is a decision-support tool, not a diagnostic tool. The medical decision always belongs to the crew medical officer."
    }
  },

  /* نصوص الواجهة (القوائم، العناوين، الأزرار) */
  ui: {
    nav: {
      layers:  { ar: "الطبقات", en: "Layers" },
      channels:{ ar: "القنوات", en: "Channels" },
      data:    { ar: "البيانات", en: "Data" },
      demo:    { ar: "العرض التفاعلي", en: "Live demo" },
      proof:   { ar: "الإثبات", en: "Evidence" },
      roadmap: { ar: "خارطة الطريق", en: "Roadmap" }
    },
    langToggle: { ar: "English", en: "العربية" },
    sections: {
      layers:   { ar: "ثلاث طبقات، كل واحدة بحالتها الصريحة", en: "Three layers, each with an explicit status" },
      device:   { ar: "الجهاز المصمَّم ومواضع الحساسات", en: "Designed device and sensor placement" },
      channels: { ar: "كل قناة لها حساس ومصدر وسبب", en: "Every channel has a sensor, a source and a reason" },
      data:     { ar: "إفصاح البيانات", en: "Data disclosure" },
      hypothesis:{ ar: "الفرضية", en: "Hypothesis" },
      demo:     { ar: "العرض التفاعلي: رائد واحد", en: "Live demo: one astronaut" },
      proof:    { ar: "المقارنة: خط أساس شخصي مقابل عتبات ثابتة", en: "Comparison: personal baseline vs fixed thresholds" },
      sensitivity:{ ar: "اختبار الحساسية للضجيج وحجم الانحراف", en: "Sensitivity to noise and drift size" },
      forecast: { ar: "إسقاط الاتجاه", en: "Trend projection" },
      method:   { ar: "الخوارزمية", en: "The algorithm" },
      diff:     { ar: "ما يميزنا", en: "What sets us apart" },
      nurses:   { ar: "قرارات فريق الممرضين", en: "Decisions for the nursing team" },
      roadmap:  { ar: "خارطة الطريق", en: "Roadmap" },
      refs:     { ar: "المراجع العلمية", en: "Scientific references" },
      alerts:   { ar: "مستويات التنبيه الثلاثة", en: "The three alert levels" }
    },
    table: {
      sensor: { ar: "الحساس", en: "Sensor" }, source: { ar: "المصدر", en: "Source" }, reason: { ar: "سبب الوجود", en: "Why it is here" },
      status: { ar: "الحالة", en: "Status" }, channel: { ar: "القناة", en: "Channel" },
      method: { ar: "الطريقة", en: "Method" }, rate: { ar: "نسبة الكشف", en: "Detection rate" },
      delay: { ar: "وسيط زمن الكشف", en: "Median time to detect" }, fa: { ar: "إنذارات كاذبة / 100 يوم", en: "False alarms / 100 days" },
      faRuns: { ar: "رواد تلقوا إنذاراً كاذباً", en: "Astronauts with ≥1 false alarm" },
      personal: { ar: "خط أساس شخصي + CUSUM", en: "Personal baseline + CUSUM" }, fixed: { ar: "عتبات ثابتة عامة", en: "Fixed generic thresholds" },
      days: { ar: "يوم", en: "days" }, noise: { ar: "الضجيج ×", en: "Noise ×" }, drift: { ar: "الانحراف ×", en: "Drift ×" },
      item: { ar: "البند", en: "Item" }, current: { ar: "القيمة الحالية", en: "Current value" },
      evalAt: { ar: "لحظة الإسقاط", en: "Projected at" }, medAbs: { ar: "وسيط الخطأ المطلق", en: "Median absolute error" },
      bias: { ar: "الانحياز", en: "Bias" }, within5: { ar: "ضمن ±5 أيام", en: "Within ±5 days" }, n: { ar: "عدد الحالات", en: "Cases" },
      atAlert: { ar: "عند أول تنبيه", en: "At first alert" }, plus: { ar: "بعد التنبيه بـ", en: "After alert +" },
      windowCmp: { ar: "مقارنة النوافذ (عند أول تنبيه + 14 يوماً)", en: "Window comparison (first alert + 14 days)" }
    },
    controls: {
      astronaut: { ar: "رائد رقم", en: "Astronaut #" },
      baseline: { ar: "خط الأساس", en: "Baseline" },
      modes: {
        stable:   { ar: "مستقر بعد التكيف", en: "Stable after adaptation" },
        preflight:{ ar: "ما قبل الرحلة (الأرض)", en: "Pre-flight (ground)" },
        naive:    { ar: "ساذج: أول أيام المهمة", en: "Naive: first mission days" },
        rolling:  { ar: "متحرك مع حماية", en: "Rolling with guard" }
      },
      anchor: { ar: "حماية المرساة (يمنع الانحراف من أن يصبح طبيعياً)", en: "Anchor guard (stops drift becoming the new normal)" },
      chem: { ar: "أدخل القناة الكيميائية المحاكاة", en: "Include simulated chemical channel" },
      noise: { ar: "الضجيج", en: "Noise" }, drift: { ar: "حجم الانحراف", en: "Drift size" },
      k: { ar: "k (الحساسية)", en: "k (slack)" }, h: { ar: "h (عتبة القرار)", en: "h (decision limit)" },
      window: { ar: "نافذة الإسقاط (أيام)", en: "Projection window (days)" },
      runCohort: { ar: "شغّل المقارنة على مجموعة رواد", en: "Run cohort comparison" },
      runSens: { ar: "شغّل اختبار الحساسية", en: "Run sensitivity test" },
      reset: { ar: "إعادة الإعدادات", en: "Reset settings" },
      running: { ar: "جارٍ الحساب…", en: "Computing…" }
    },
    chart: {
      day: { ar: "يوم المهمة", en: "Mission day" },
      adaptation: { ar: "فترة التكيف", en: "Adaptation" },
      onset: { ar: "بدء الانحراف (حقيقة مُدخلة)", en: "Drift onset (ground truth)" },
      baseline: { ar: "خط الأساس الشخصي ±3", en: "Personal baseline ±3" },
      fixedThr: { ar: "العتبة الثابتة", en: "Fixed threshold" },
      personalAlert: { ar: "تنبيه شخصي", en: "Personal alert" },
      fixedAlert: { ar: "تنبيه ثابت", en: "Fixed alert" },
      composite: { ar: "CUSUM للدرجة المركبة", en: "Composite-score CUSUM" },
      projection: { ar: "إسقاط الاتجاه", en: "Trend projection" },
      monitorThr: { ar: "عتبة المراقبة", en: "Monitoring threshold" },
      radLimit: { ar: "حد الجرعة (عرض)", en: "Dose limit (demo)" },
      radiation: { ar: "جرعة الإشعاع التراكمية", en: "Cumulative radiation dose" }
    },
    explain: {
      title: { ar: "لماذا هذا التنبيه؟", en: "Why this alert?" },
      none: { ar: "لا يوجد تنبيه مراقبة بعد بدء الانحراف لهذا الرائد.", en: "No monitoring alert after drift onset for this astronaut." },
      day: { ar: "اليوم", en: "Day" }, share: { ar: "المساهمة", en: "Share" },
      detected: { ar: "الطريقة الشخصية كشفت بعد", en: "Personal method detected after" }, notDetected: { ar: "لم يُكشف", en: "Not detected" },
      fixedDetected: { ar: "العتبات الثابتة كشفت بعد", en: "Fixed thresholds detected after" },
      falseAlarms: { ar: "إنذارات كاذبة قبل البدء", en: "False alarms before onset" },
      projSaid: { ar: "الإسقاط عند التنبيه: العبور يوم", en: "Projection at alert: crossing on day" },
      truthSaid: { ar: "العبور الحقيقي يوم", en: "True crossing on day" }
    },
    synthetic: { ar: "بيانات مولّدة", en: "Synthetic data" },
    cohortNote: { ar: "رائداً صناعياً، لكل واحد خط أساس مختلف وبدء انحراف عشوائي.", en: "synthetic astronauts, each with a different baseline and a random drift onset." }
  },

  hero: {
    kicker: { ar: "مفهوم مهمة · هاكاثون ناسا", en: "Mission concept · NASA hackathon" },
    vision: {
      ar: "VITALX نظام دعم قرار لطبيب الطاقم، يدمج إشارات الجسم والبيئة والإشعاع، ويقارنها بخط الأساس الشخصي لكل رائد، ويعمل محلياً دون انتظار الأرض.",
      en: "VITALX is a decision-support system for the crew medical officer. It fuses body, environment and radiation signals, compares them with each astronaut's personal baseline, and runs locally without waiting for Earth."
    },
    scope: {
      ar: "الرؤية بعيدة المدى تشمل لاصقة إبر دقيقة. أما ما نبنيه ونثبته في 48 ساعة فهو طبقة الذكاء التحليلي.",
      en: "The long-term vision includes a microneedle patch. What we build and prove in 48 hours is the analytics layer."
    },
    ctaDemo: { ar: "جرّب العرض التفاعلي", en: "Try the live demo" },
    ctaLayers: { ar: "ما المبني وما المستقبلي؟", en: "What is built vs. future?" }
  },

  statusLabels: {
    built:     { ar: "مبنية ومُثبتة", en: "Built & validated" },
    designed:  { ar: "مصمَّمة", en: "Designed" },
    future:    { ar: "مستقبلية · بحث", en: "Future · research" },
    simulated: { ar: "محاكاة", en: "Simulated" },
    pending:   { ar: "بانتظار قرار الفريق", en: "Pending team decision" }
  },

  layers: [
    {
      status: "built",
      title: { ar: "طبقة الذكاء التحليلي", en: "Analytics layer" },
      text: { ar: "النبض والنوم وCO2 وجرعة الإشعاع التراكمية في داشبورد، وخوارزمية كشف تعمل فعلاً على بيانات مولّدة.",
              en: "Heart rate, sleep, CO2 and cumulative radiation dose in a dashboard, with a detection algorithm that actually runs on synthetic data." },
      items: [
        { ar: "خط أساس شخصي (وسيط + MAD)", en: "Personal baseline (median + MAD)" },
        { ar: "CUSUM ثنائي الاتجاه مع إعادة التصفير", en: "Two-sided CUSUM with reset" },
        { ar: "تفسير كل تنبيه بمساهمة كل إشارة", en: "Every alert explained by each signal's contribution" },
        { ar: "إسقاط اتجاه قصير المدى", en: "Short-term trend projection" },
        { ar: "مقارنة كمية مع العتبات الثابتة", en: "Quantitative comparison with fixed thresholds" }
      ]
    },
    {
      status: "designed",
      title: { ar: "الجهاز", en: "The device" },
      text: { ar: "رسم للجهاز مع مخطط الحساسات ومواضعها. لا يوجد نموذج عتادي مبني.", en: "A drawing of the device with its sensors and placement. No hardware prototype is built." },
      items: [
        { ar: "لاصقة/ساعة: النبض، حرارة الجلد، النوم", en: "Patch/watch: heart rate, skin temperature, sleep" },
        { ar: "حساس المقصورة: CO2، الرطوبة، الحرارة", en: "Cabin sensor: CO2, humidity, temperature" },
        { ar: "مقياس جرعة شخصي", en: "Personal dosimeter" }
      ]
    },
    {
      status: "future",
      title: { ar: "الإبر الدقيقة والمؤشرات الكيميائية", en: "Microneedles and chemical markers" },
      text: { ar: "مؤشرات مثل الغلوكوز أو اللاكتات أو الكورتيزول. مرحلة بحث، وليست جاهزة للاستخدام المستمر الطويل في الفضاء.",
              en: "Markers such as glucose, lactate or cortisol. A research stage, not ready for long continuous use in space." },
      items: [
        { ar: "تظهر في النموذج كعمود محاكى فقط", en: "Appears in the model only as a simulated column" },
        { ar: "وزنها في الدرجة المركبة صفر افتراضياً", en: "Weight in the composite score is zero by default" },
        { ar: "الهدف: إثبات أن المنصة تستوعبها دون ادعاء وجود الحساس", en: "Goal: show the platform can host it without claiming the sensor exists" }
      ]
    }
  ],

  /* قنوات الإشارات: كل قناة لها حساس معلن ومصدر وسبب */
  channels: [
    { id: "hr", status: "built", unit: "bpm",
      name:   { ar: "نبض الراحة", en: "Resting heart rate" },
      sensor: { ar: "لاصقة أو ساعة قابلة للارتداء", en: "Wearable patch or watch" },
      source: { ar: "قياس فسيولوجي مستمر", en: "Continuous physiological measurement" },
      reason: { ar: "مؤشر مبكر على الإجهاد وقلة النوم والتغيرات القلبية الوعائية", en: "Early marker of stress, sleep loss and cardiovascular change" } },
    { id: "sleep", status: "built", unit: "h",
      name:   { ar: "مدة النوم", en: "Sleep duration" },
      sensor: { ar: "لاصقة أو ساعة (قياس الحركة)", en: "Patch or watch (actigraphy)" },
      source: { ar: "قياس فسيولوجي يومي", en: "Daily physiological measurement" },
      reason: { ar: "خطر النوم واضطراب الإيقاع موثّق في HRP", en: "Sleep loss and circadian risk is documented in HRP" } },
    { id: "temp", status: "designed", unit: "°C",
      name:   { ar: "حرارة الجلد", en: "Skin temperature" },
      sensor: { ar: "لاصقة أو ساعة", en: "Patch or watch" },
      source: { ar: "قياس فسيولوجي", en: "Physiological measurement" },
      reason: { ar: "سياق للنوم والإجهاد الحراري (معروضة، غير مستخدمة في الدرجة حالياً)", en: "Context for sleep and heat stress (shown, not used in the score yet)" } },
    { id: "co2", status: "built", unit: "mmHg",
      name:   { ar: "CO2 في المقصورة", en: "Cabin CO2" },
      sensor: { ar: "حساس بيئي في المقصورة (موجود فعلاً في المحطة)", en: "Cabin environmental sensor (already on the station)" },
      source: { ar: "بيئة المقصورة", en: "Cabin environment" },
      reason: { ar: "خطر بيئي موثّق في HRP، ويرتبط بالصداع وتراجع الأداء", en: "Environmental risk documented in HRP, linked to headaches and lower performance" } },
    { id: "hum", status: "designed", unit: "% / °C",
      name:   { ar: "الرطوبة والحرارة", en: "Humidity and temperature" },
      sensor: { ar: "حساس بيئي في المقصورة", en: "Cabin environmental sensor" },
      source: { ar: "بيئة المقصورة", en: "Cabin environment" },
      reason: { ar: "سياق بيئي للراحة والنوم", en: "Environmental context for comfort and sleep" } },
    { id: "rad", status: "built", unit: "mSv",
      name:   { ar: "جرعة الإشعاع التراكمية", en: "Cumulative radiation dose" },
      sensor: { ar: "مقياس جرعة شخصي", en: "Personal dosimeter" },
      source: { ar: "جرعة تراكمية فقط", en: "Cumulative dose only" },
      reason: { ar: "تتبع ميزانية الجرعة. هذه جرعة فيزيائية، وليست تأثيراً بيولوجياً", en: "Tracks the dose budget. This is a physical dose, not a biological effect" } },
    { id: "chem", status: "future", unit: { ar: "وحدة اعتبارية", en: "arbitrary unit" },
      name:   { ar: "مؤشر كيميائي", en: "Chemical marker" },
      sensor: { ar: "إبر دقيقة (غير موجودة)", en: "Microneedles (not available)" },
      source: { ar: "عمود إضافي في البيانات الصناعية", en: "Extra column in the synthetic data" },
      reason: { ar: "محاكى، تقنية مستقبلية: لإظهار أن المنصة تستوعب القناة", en: "Simulated, future technology: shows the platform can host the channel" } }
  ],

  /* مواضع الحساسات على رسم الجهاز (إحداثيات من 0 إلى 100) */
  deviceDiagram: [
    { x: 50, y: 30, status: "designed", label: { ar: "لاصقة الصدر: النبض والحرارة", en: "Chest patch: heart rate & temperature" } },
    { x: 24, y: 56, status: "designed", label: { ar: "ساعة المعصم: النوم والحركة", en: "Wrist watch: sleep & activity" } },
    { x: 62, y: 22, status: "designed", label: { ar: "مقياس الجرعة الشخصي", en: "Personal dosimeter" } },
    { x: 66, y: 48, status: "future",   label: { ar: "إبر دقيقة (مستقبلية)", en: "Microneedles (future)" } },
    { x: 88, y: 10, status: "designed", label: { ar: "حساس المقصورة: CO2 والرطوبة", en: "Cabin sensor: CO2 & humidity" } }
  ],

  data: {
    disclosure: { ar: "البيانات مولّدة، والسيناريوهات مبنية على مخاطر HRP.", en: "The data is synthetic; the scenarios are based on HRP risks." },
    notClaim: {
      ar: "مراجع HRP وHHP وNTRS أساس علمي لاختيار المؤشرات والسيناريوهات. هذا ليس استخداماً لبيانات ناسا ولا ندّعيه.",
      en: "HRP, HHP and NTRS are the scientific basis for choosing markers and scenarios. This is not use of NASA data, and we do not claim it is."
    },
    nasaDataset: {
      status: "pending",
      name: { ar: "⟨لم يُتحقق من مجموعة بيانات بعد⟩", en: "⟨No dataset verified yet⟩" },
      note: {
        ar: "نبحث في NASA OSDR وبوابات بيانات ناسا عن بيانات بشرية أو بيئية (حرارة المقصورة، CO2، النوم). لن نذكر اسم مجموعة قبل التحقق منها. إن وُجدت، تُستخدم لمعايرة المدى الواقعي للقيم فقط، ويُذكر المصدر بدقة هنا.",
        en: "We are searching NASA OSDR and NASA data portals for human or environmental data (cabin temperature, CO2, sleep). No dataset will be named before it is verified. If found, it is used only to calibrate realistic value ranges, and the exact source is cited here."
      },
      url: ""
    }
  },

  hypothesis: {
    question: {
      ar: "هل يكتشف خط أساس شخصي متعدد الإشارات، يعمل محلياً، الانحراف التدريجي أبكر وبإنذارات كاذبة أقل من العتبات الثابتة العامة؟",
      en: "Does a local, multi-signal personal baseline detect gradual drift earlier, and with fewer false alarms, than generic fixed thresholds?"
    },
    proof: {
      ar: "جدول مقارنة بين الطريقتين يقيس زمن الكشف ونسبة الكشف والإنذارات الكاذبة، مع اختبار حساسية للضجيج وحجم الانحراف، ومع إعلان صريح أن البيانات مولّدة.",
      en: "A comparison table measuring time to detect, detection rate and false alarms for both methods, with a sensitivity test for noise and drift size, and an explicit statement that the data is synthetic."
    }
  },

  /* صياغة رسائل التنبيه الثلاث — بانتظار فريق الممرضين */
  alerts: {
    1: { status: "pending", name: { ar: "معلومة", en: "Info" },
         text: { ar: "⟨صياغة الممرضين⟩ إشارة واحدة خرجت عن خط الأساس الشخصي. لا يلزم إجراء.", en: "⟨Nursing team wording⟩ One signal left the personal baseline. No action needed." } },
    2: { status: "pending", name: { ar: "مراقبة", en: "Monitor" },
         text: { ar: "⟨صياغة الممرضين⟩ انحراف تدريجي مستمر في الدرجة المركبة. يُقترح مراجعة طبيب الطاقم.", en: "⟨Nursing team wording⟩ Sustained gradual drift in the composite score. Suggest a review by the crew medical officer." } },
    3: { status: "pending", name: { ar: "عاجل", en: "Urgent" },
         text: { ar: "⟨صياغة الممرضين⟩ انحراف مركب مع إشارتين أو أكثر بعيدتين جداً عن خط الأساس. يُقترح تواصل فوري مع طبيب الطاقم.", en: "⟨Nursing team wording⟩ Composite drift with two or more signals far from baseline. Suggest contacting the crew medical officer now." } }
  },

  /* ما يجب أن يقرره فريق الممرضين قبل البرمجة */
  nurseDecisions: [
    { status: "pending", item: { ar: "السيناريو السريري الواحد للقصة", en: "The single clinical scenario for the story" },
      current: { ar: "مقترح: ارتفاع CO2 مع قلة النوم وارتفاع نبض الراحة", en: "Proposed: rising CO2 with less sleep and higher resting heart rate" } },
    { status: "pending", item: { ar: "أوزان الإشارات في الدرجة المركبة", en: "Signal weights in the composite score" },
      current: { ar: "متساوية مؤقتاً (1 / 1 / 1)، والكيميائي 0", en: "Equal for now (1 / 1 / 1), chemical 0" } },
    { status: "pending", item: { ar: "المدى الطبيعي لكل مؤشر", en: "Normal range of each marker" },
      current: { ar: "قيم افتراضية للعرض في إعدادات المحاكاة", en: "Demo defaults in the simulation settings" } },
    { status: "pending", item: { ar: "min_scale لكل مؤشر", en: "min_scale for each marker" },
      current: { ar: "5% من الوسيط، والنوم 0.25 ساعة", en: "5% of the median; sleep 0.25 h" } },
    { status: "pending", item: { ar: "عتبات الطريقة الثابتة", en: "Fixed-method thresholds" },
      current: { ar: "نبض > 85، نوم < 6 ساعات، CO2 > 4 mmHg (افتراضية)", en: "HR > 85, sleep < 6 h, CO2 > 4 mmHg (defaults)" } },
    { status: "pending", item: { ar: "صياغة رسائل التنبيه الثلاث", en: "Wording of the three alert messages" },
      current: { ar: "نصوص مؤقتة", en: "Temporary text" } }
  ],

  differentiation: [
    { vs: "Microdoze", point: { ar: "لا ندّعي الأولوية في خط الأساس الشخصي، فهو موجود. نضيف القياس الكمي المقارن، والاستقلالية عن الأرض، والتفسير.",
                                en: "We do not claim to be first with a personal baseline; it exists. We add quantitative comparison, independence from Earth, and explanation." } },
    { vs: "Canaria · SAHM", point: { ar: "لا ننافس في العتاد وحده. قيمتنا في طبقة القرار فوق أي حساس.",
                                    en: "We do not compete on hardware alone. Our value is the decision layer on top of any sensor." } },
    { vs: { ar: "ما يميزنا", en: "Our edge" }, point: { ar: "تفسير التنبيه، والعمل بلا اتصال، ومقارنة مثبتة، وإفصاح صادق عن الحدود.",
                                                       en: "Explained alerts, offline operation, a proven comparison, and honest disclosure of limits." } }
  ],

  forecast: {
    text: {
      ar: "إذا استمر الميل الحالي لنبض الراحة (انحدار خطي على آخر أيام النافذة)، متى سيتجاوز عتبة المراقبة؟ نقيس الخطأ في توقيت العبور مقارنة بالحقيقة المُدخلة في البيانات الصناعية.",
      en: "If the current resting-heart-rate slope continues (linear fit over the last window of days), when will it cross the monitoring threshold? We measure the crossing-time error against the ground truth in the synthetic data."
    },
    notThis: {
      ar: "هذا إسقاط اتجاه، وليس تنبؤاً بحالة الرائد بعد شهر. التنبؤ لشهر كامل في خارطة الطريق، ويشترط بيانات طولية حقيقية.",
      en: "This is a trend projection, not a prediction of the astronaut's condition in a month. Month-long forecasting is on the roadmap and requires real longitudinal data."
    }
  },

  methodNotes: [
    { ar: "CUSUM ثنائي الاتجاه: يكتشف الارتفاع (النبض وCO2) والانخفاض (النوم).", en: "Two-sided CUSUM: detects rises (heart rate, CO2) and drops (sleep)." },
    { ar: "إعادة التصفير بعد كل تنبيه، حتى لا يستمر التنبيه إلى ما لا نهاية.", en: "Reset after each alert, so an alert does not persist forever." },
    { ar: "حدّ أدنى للمقام (min_scale) نسبي للوسيط، والنوم بوحدات الساعات. يُضبط مع الممرضين.", en: "A minimum denominator (min_scale) relative to the median; sleep uses hours. Tuned with the nurses." },
    { ar: "k وh تُضبطان بالتجربة، وليست قيماً نهائية.", en: "k and h are tuned by experiment; they are not final values." },
    { ar: "خط الأساس المتحرك محمي بمرساة: لا يبتعد عن الخط المستقر أكثر من حد معيّن، حتى لا يصبح الانحراف البطيء هو \"الطبيعي الجديد\".", en: "The rolling baseline is anchored: it cannot move beyond a set distance from the stable baseline, so slow drift cannot become the \"new normal\"." }
  ],

  roadmap: [
    { status: "built", phase: { ar: "الآن · 48 ساعة", en: "Now · 48 hours" },
      text: { ar: "طبقة التحليل على بيانات مولّدة، المقارنة مع العتبات الثابتة، إسقاط الاتجاه، تفسير التنبيه.", en: "Analytics on synthetic data, comparison with fixed thresholds, trend projection, alert explanation." } },
    { status: "designed", phase: { ar: "بعد الهاكاثون", en: "After the hackathon" },
      text: { ar: "معايرة المدى بالبيانات الحقيقية إن وُجدت، ضبط الأوزان والعتبات مع فريق التمريض، نموذج الجهاز.", en: "Calibrate ranges with real data if found, tune weights and thresholds with the nursing team, device prototype." } },
    { status: "future", phase: { ar: "بحث", en: "Research" },
      text: { ar: "قناة كيميائية حقيقية بالإبر الدقيقة، وتنبؤ لمدة شهر بشرط توفر بيانات طولية حقيقية.", en: "A real chemical channel with microneedles, and month-long forecasting once real longitudinal data exists." } }
  ],

  references: [
    { name: "NASA Human Research Program (HRP) — Human Research Roadmap", url: "https://humanresearchroadmap.nasa.gov/",
      use: { ar: "أساس اختيار المخاطر والسيناريوهات", en: "Basis for choosing risks and scenarios" } },
    { name: "HRP: Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload", url: "https://humanresearchroadmap.nasa.gov/",
      use: { ar: "مبرر قناة النوم", en: "Rationale for the sleep channel" } },
    { name: { ar: "⟨اسم خطر HRP المرتبط بـ CO2 — تحققوا من الاسم الدقيق⟩", en: "⟨HRP risk name related to CO2 — verify exact title⟩" }, url: "https://humanresearchroadmap.nasa.gov/",
      use: { ar: "مبرر قناة CO2", en: "Rationale for the CO2 channel" } },
    { name: "HRP: Risk of Radiation Carcinogenesis", url: "https://humanresearchroadmap.nasa.gov/",
      use: { ar: "مبرر تتبع الجرعة التراكمية", en: "Rationale for tracking cumulative dose" } },
    { name: "NASA Human Health and Performance (HHP)", url: "https://www.nasa.gov/hhp/",
      use: { ar: "سياق صحة الطاقم", en: "Crew health context" } },
    { name: "NASA Technical Reports Server (NTRS)", url: "https://ntrs.nasa.gov/",
      use: { ar: "أوراق علمية داعمة ⟨أضيفوا الأوراق المحددة⟩", en: "Supporting papers ⟨add the specific papers⟩" } },
    { name: "NASA Open Science Data Repository (OSDR)", url: "https://osdr.nasa.gov/",
      use: { ar: "مكان البحث عن بيانات للمعايرة (لم يُستخدم بعد)", en: "Where we search for calibration data (not used yet)" } }
  ],

  /* =====================================================================
     صفحة الأجهزة (devices.html) · Devices page
     ===================================================================== */
  devicesPage: {
    navLink: { ar: "الأجهزة", en: "Devices" },
    back: { ar: "الصفحة الرئيسية", en: "Main page" },
    kicker: { ar: "الطبقة المصمَّمة", en: "The designed layer" },
    title: { ar: "النظام داخل الساعة والشريحة", en: "The system inside the watch and the patch" },
    intro: {
      ar: "هذه تصاميم وليست عتاداً مبنياً. أما الواجهة داخل الشاشة فهي النظام الحقيقي يعمل الآن على بيانات مولّدة لرائد واحد، يوماً بيوم.",
      en: "These are designs, not built hardware. The interface on the screen, however, is the real system running now on synthetic data for one astronaut, day by day."
    },
    play: { ar: "تشغيل المهمة", en: "Play mission" },
    pause: { ar: "إيقاف", en: "Pause" },
    restart: { ar: "من البداية", en: "Restart" },
    speed: { ar: "السرعة", en: "Speed" },
    day: { ar: "اليوم", en: "Day" },
    watch: {
      title: { ar: "ساعة VITALX", en: "VITALX watch" },
      status: "designed",
      text: { ar: "واجهة الرائد وطبيب الطاقم. تعرض الحالة مقارنة بخط الأساس الشخصي، وتشرح سبب كل تنبيه. تعمل دون اتصال بالأرض.",
              en: "The interface for the astronaut and the crew medical officer. Shows status against the personal baseline and explains every alert. Works with no link to Earth." },
      screens: {
        vitals:  { ar: "المؤشرات", en: "Vitals" },
        explain: { ar: "لماذا التنبيه؟", en: "Why the alert?" },
        trend:   { ar: "الاتجاه", en: "Trend" }
      },
      calibrating: { ar: "معايرة خط الأساس", en: "Calibrating baseline" },
      ok: { ar: "ضمن خط الأساس", en: "Within baseline" },
      baseline: { ar: "خط الأساس", en: "Baseline" },
      dose: { ar: "الجرعة", en: "Dose" },
      noAlert: { ar: "لا توجد تنبيهات", en: "No alerts" },
      projection: { ar: "إسقاط العبور بعد", en: "Projected crossing in" },
      days: { ar: "يوم", en: "days" },
      flat: { ar: "لا اتجاه صاعد", en: "No rising trend" }
    },
    patch: {
      title: { ar: "الشريحة (اللاصقة)", en: "The patch" },
      status: "designed",
      text: { ar: "تُلصق على الصدر. تقيس النبض وحرارة الجلد، وترسل البيانات للساعة. اضغط لترى الطبقات.",
              en: "Worn on the chest. Measures heart rate and skin temperature and sends data to the watch. Tap to see the layers." },
      explode: { ar: "افصل الطبقات", en: "Explode layers" },
      collapse: { ar: "اجمع الطبقات", en: "Collapse layers" },
      layers: [
        { status: "designed", name: { ar: "غلاف مرن", en: "Flexible shell" }, note: { ar: "سيليكون طبي", en: "Medical silicone" } },
        { status: "designed", name: { ar: "معالج + بلوتوث منخفض الطاقة", en: "Processor + Bluetooth LE" }, note: { ar: "يحسب ويرسل", en: "Computes and transmits" } },
        { status: "designed", name: { ar: "بطارية رقيقة", en: "Thin battery" }, note: { ar: "⟨مدة التشغيل: تُحدد⟩", en: "⟨Runtime: to be set⟩" } },
        { status: "designed", name: { ar: "حساسات النبض والحرارة", en: "Heart-rate & temperature sensors" }, note: { ar: "ECG / PPG + حرارة", en: "ECG / PPG + temperature" } },
        { status: "future",   name: { ar: "إبر دقيقة (كيميائية)", en: "Microneedles (chemical)" }, note: { ar: "مستقبلية · بحث", en: "Future · research" } }
      ]
    },
    others: [
      { status: "designed", icon: "cabin", name: { ar: "حساس المقصورة", en: "Cabin sensor" }, text: { ar: "CO2 والرطوبة والحرارة. موجود فعلاً في المحطة.", en: "CO2, humidity, temperature. Already on the station." } },
      { status: "designed", icon: "dose",  name: { ar: "مقياس الجرعة الشخصي", en: "Personal dosimeter" }, text: { ar: "جرعة تراكمية فقط، وليست تأثيراً بيولوجياً.", en: "Cumulative dose only, not a biological effect." } }
    ],
    flow: {
      title: { ar: "مسار البيانات: كله داخل المركبة", en: "Data path: all inside the spacecraft" },
      nodes: [
        { ar: "الشريحة", en: "Patch" },
        { ar: "الساعة", en: "Watch" },
        { ar: "الحاسوب المحلي في المحطة", en: "Local station computer" },
        { ar: "طبيب الطاقم", en: "Crew medical officer" }
      ],
      earth: { ar: "الأرض: اختيارية، للمزامنة فقط", en: "Earth: optional, sync only" }
    }
  },

  /* =====================================================================
     إعدادات المحاكاة — كل الأرقام هنا افتراضية للعرض، وليست قيماً سريرية.
     Simulation settings — demo values only, not clinical values.
     ===================================================================== */
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

    projection: { window: 7, monitorZ: 3, evalOffsets: [0, 7, 14], compareWindows: [7, 10, 14] },

    sensitivity: { noise: [0.5, 1, 1.5, 2], drift: [0.5, 1, 1.5], reps: 80 }
  }
};
