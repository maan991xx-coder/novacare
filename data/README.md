# بيانات ناسا الحقيقية → محرك VITALX

المصدر المُتحقق منه: **NASA OSDR Environmental Data App (EDA)**
https://visualization.osdr.nasa.gov/eda/ — قياسات مقصورة محطة الفضاء الدولية (CO2، الحرارة، الرطوبة) وجرعة الإشعاع اليومية (GCR، SAA، Total، Accumulated) لكل مهمة (RR-1 … RR-28، APEX، VEG-01C). التنزيل من جدول Data Tables بصيغة CSV أو Excel.

## الخطوات
1. افتح EDA ← Data Tables ← اختر مهمة (مثلا RR-12) ← جدول Telemetry ← CSV.
2. احفظ الملف في `data/` ثم شغّل:
   ```
   node data/nasa-eda-adapter.js data/<file>.csv
   ```
3. المخرجات: خط الأساس الشخصي من أول 14 يوما، أيام إنذار CUSUM، ومقارنة بحد ناسا الثابت 3 mmHg (NASA-STD-3001 V2 6004).

المحرك نفسه (`engine.js`) لا يتغير. إذا اختلفت أسماء الأعمدة استخدم `--column CO2`.
