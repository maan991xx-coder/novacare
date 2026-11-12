# VITALX watch app (Android)

Turns an old Android phone (Android 4.4+, e.g. Galaxy A3) into a VITALX "watch":
full screen, screen always on, clock + battery on top, and it can be the phone's home screen.
The page shown is `../vitalx-watch-old-android.html` (copied to `assets/index.html` at build time).

- Back button does nothing; **long-press Back** opens Settings (to leave or change the home app).
- Uninstalling the app returns the phone to normal.

Build (Ubuntu: `apt install aapt apksigner dalvik-exchange android-sdk-platform-23 zipalign`):

```
AJ=/usr/lib/android-sdk/platforms/android-23/android.jar
mkdir -p assets gen obj bin && cp ../vitalx-watch-old-android.html assets/index.html
aapt package -f -m -J gen -M AndroidManifest.xml -S res -A assets -I $AJ -F bin/unsigned.apk
javac --release 8 -classpath $AJ -d obj gen/com/novacore/vitalx/R.java src/com/novacore/vitalx/MainActivity.java
dalvik-exchange --dex --min-sdk-version=19 --output=bin/classes.dex obj
(cd bin && aapt add unsigned.apk classes.dex)
zipalign -f 4 bin/unsigned.apk bin/aligned.apk
apksigner sign --ks <keystore> --out bin/VITALX-watch.apk bin/aligned.apk
```
