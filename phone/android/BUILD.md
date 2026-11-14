# VITALX phone app (Android 4.4+, e.g. Galaxy A3)

Start screen with two choices: **Astronaut watch** (portrait, one full-screen view) and **Ground dashboard** (landscape).
Design follows the site console: spacecraft background, glass panels with glowing corners, astronaut on a holo pad.

**Locked (kiosk) mode**
- The app becomes the phone's Home screen (on first Home press choose VITALX → *Always*). Home, Recents and pulling the status bar bring you straight back to it.
- Short **Back**: returns to the start screen. Back on the start screen does nothing.
- **Long-press Back** → exit code pad → **12345** → *Exit app*. Exiting also removes VITALX as Home; opening the app again locks again.
- Optional full lock (no system way out at all, status bar disabled on Android 6+): on a phone with no Google/Samsung accounts, run
  `adb shell dpm set-device-owner com.novacare.vitalx/.AdminReceiver`. To undo, use the code pad → *Exit and remove full lock*. Do this before uninstalling.

Build (Ubuntu: `apt install aapt apksigner dalvik-exchange android-sdk-platform-23 zipalign`, plus `npm i @babel/standalone` somewhere):

```
cd phone
node build-html.js <path>/node_modules/@babel/standalone android/assets/index.html
cp ../media/ship-bg.jpg ../media/astronaut.png android/assets/
cd android
AJ=/usr/lib/android-sdk/platforms/android-23/android.jar
mkdir -p gen obj bin
aapt package -f -m -J gen -M AndroidManifest.xml -S res -A assets -I $AJ -F bin/unsigned.apk
javac --release 8 -classpath $AJ -d obj gen/com/novacare/vitalx/R.java src/com/novacare/vitalx/*.java
dalvik-exchange --dex --min-sdk-version=19 --output=bin/classes.dex obj
(cd bin && aapt add unsigned.apk classes.dex)
zipalign -f 4 bin/unsigned.apk bin/aligned.apk
apksigner sign --ks <keystore> --out bin/VITALX-phone.apk bin/aligned.apk
```

`android/assets/` is generated; open `android/assets/index.html` in a browser to preview (Esc = back, hold Esc = exit code pad).

## Cloud log (Firebase / Firestore)
Every event is saved on the phone first, then uploaded in batches to Firestore when there is internet (collection `vitalx_events`):
`session_start` (device model, Android version), `screen`, `select_crew`, `lang`, `day_snapshot` (all crew readings every 5 sim days), `alert`, `exit_code` (ok/wrong), `exit`.
Daily upload cap: 15,000 documents (Firestore free tier is 20,000 writes/day).

Setup:
1. console.firebase.google.com → Add project.
2. Build → Authentication → Get started → Sign-in method → enable **Anonymous**.
3. Build → Firestore Database → Create database. In the **Rules** tab, paste `phone/firestore.rules` and publish.
4. Project settings → General → Your apps → add a **Web** app → copy `apiKey` and `projectId` into `phone/cloud-config.js`, then rebuild.
