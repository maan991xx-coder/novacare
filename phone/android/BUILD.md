# VITALX phone app (Android 4.4+, e.g. Galaxy A3)

Start screen with two choices: **Astronaut watch** (portrait, one full-screen view) and **Ground dashboard** (landscape).
Full screen: no status bar and no system buttons. **Back** returns to the start screen; Back on the start screen closes the app.

Build (Ubuntu: `apt install aapt apksigner dalvik-exchange android-sdk-platform-23 zipalign`, plus `npm i @babel/standalone` somewhere):

```
cd phone
node build-html.js <path>/node_modules/@babel/standalone android/assets/index.html
cp ../media/ship-bg.jpg android/assets/
cd android
AJ=/usr/lib/android-sdk/platforms/android-23/android.jar
mkdir -p gen obj bin
aapt package -f -m -J gen -M AndroidManifest.xml -S res -A assets -I $AJ -F bin/unsigned.apk
javac --release 8 -classpath $AJ -d obj gen/com/novacare/vitalx/R.java src/com/novacare/vitalx/MainActivity.java
dalvik-exchange --dex --min-sdk-version=19 --output=bin/classes.dex obj
(cd bin && aapt add unsigned.apk classes.dex)
zipalign -f 4 bin/unsigned.apk bin/aligned.apk
apksigner sign --ks <keystore> --out bin/VITALX-phone.apk bin/aligned.apk
```

`android/assets/` is generated; open `android/assets/index.html` in a browser to preview (Esc = back).
