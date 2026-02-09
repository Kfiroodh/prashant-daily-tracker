PRASHANT — Daily Activity Tracker

कैसे चलाएं:
1. `index.html` को किसी ब्राउज़र में खोलें (डबल-क्लिक या ब्राउज़र में ड्रैग करके)।
2. तारीख चुनें, study session जोड़ें (विषय और घंटे), फोन और नींद के घंटे भरें, फिर "Save Entry" पर क्लिक करें।
3. Entries ब्राउज़ करने के लिए नीचे History देखें। डेटा आपके ब्राउज़र की `localStorage` में सुरक्षित रहता है।

नए फीचर अब शामिल हैं:
- Goal setting: आप Weekly study goal सेट कर सकते हैं और प्रोग्रेस देख सकते हैं।
- Analytics: Last 7 days और Last 30 days के लिए study-hours बार चार्ट जो summary में दिखता है।
 - Analytics: Last 7 days और Last 30 days के लिए study-hours बार चार्ट जो summary में दिखता है।
 - Subject-wise charts: किसी period (7 या 30 days) के लिए subject-wise breakdown (pie chart) भी summary में दिखता है।


अभी क्या कर सकते हैं:
- ब्राउज़र में `index.html` खोलें और entries जोड़ें।
- summary में `Weekly study goal` सेट करें और `Last 7 days`/`Last 30 days` बटन से analytics देखें।

आगे क्या जोड़ना चाहेंगे:
- CSV export/import
- Monthly aggregate report और subject-wise charts
- PWA/mobiles सुधार

बताइए मैं कौन-सा आगे जोड़ूँ।

---

## Android APK Build - Easy Way! 🚀

### Prerequisites (one-time setup):
1. **Node.js:** https://nodejs.org/ (download LTS and install)
2. **Android Studio:** https://developer.android.com/studio (install and let it download SDKs)
3. **Java 17:** Usually comes with Android Studio, but if needed: https://www.oracle.com/java/

### Build APK - Single Click:
Simply **double-click `build-apk.bat`** in the project folder. The script will automatically:
- Install npm dependencies
- Prepare project files
- Initialize Capacitor
- Add Android platform
- Build APK (no Android Studio needed)
- Open APK folder when done

**That's it!** APK will be ready at: `android/app/build/outputs/apk/debug/app-debug.apk`

**First build takes 10-15 minutes** (Gradle downloads dependencies), but subsequent builds are faster.

### Or use PowerShell:
```powershell
cd "C:\Users\skris\Desktop\prashant"
powershell -ExecutionPolicy Bypass -File .\build-apk.ps1
```

### Send APK to Your Phone:
1. Copy `app-debug.apk` to your phone (USB, Google Drive, Bluetooth, etc.)
2. Tap the APK in your phone's file manager to install
3. If prompted, allow installation from unknown sources in Settings → Security

### Troubleshooting:

**"gradle not found" or "JAVA_HOME error"**
- Ensure Android Studio is fully installed (SDKs downloaded)
- Restart PowerShell and try again

**"npm not found"**
- Restart PowerShell (Node.js needs path reload)
- Verify Node.js installed from https://nodejs.org/

**"Build takes very long"**
- Normal on first run — Gradle is downloading and caching
- Subsequent builds are much faster

### GitHub Actions - Automatic APK Build (Optional):
I've already prepared a GitHub Actions workflow. If you push this repo to GitHub, APK will build automatically on every push and be available as an artifact (no local build needed).

### Release APK (for Play Store):
Ask if you need signing configuration for a release APK.