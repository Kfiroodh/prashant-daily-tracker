# PRASHANT — AI-Powered Productivity Tracker 🚀

**एक आधुनिक, बुद्धिमान दैनिक गतिविधि ट्रैकर जो आपकी उत्पादकता विश्लेषण और सुधार में मदद करता है।**

---

## ✨ मुख्य Features

### 1. 📝 Daily Activity Tracking
- **Study Sessions**: विषय और घंटे रिकॉर्ड करें
- **Sleep & Phone Usage**: नींद और फोन के घंटे ट्रैक करें  
- **Mood Tracking**: अपना दैनिक मूड 😢😕😐🙂😄 रिकॉर्ड करें
- **Notes**: अतिरिक्त नोट्स जोड़ें

### 2. 🤖 AI-Powered Insights
- **Productivity Score**: 0-100 स्कोर आपकी productivity का
- **AI Insights**: 
  - Study consistency analysis
  - Sleep regularity patterns
  - Phone usage detection
  - Weekly trend analysis
- **Motivational Messages**: आपके प्रदर्शन पर आधारित व्यक्तिगत प्रेरणा
- **Smart Recommendations**: अनुकूलित सुझाव जैसे:
  - "कम फोन, ज्यादा किताब"
  - "निश्चित समय पर पढ़ाई करें"
  - "रात 11 बजे तक सो जाएं"

### 3. 📊 Advanced Analytics
- **Weekly Summary**: 
  - कुल पढ़ाई घंटे
  - औसत प्रति दिन
  - निरंतरता स्कोर
  - प्रवृत्ति विश्लेषण (↑ सुधार / ↓ गिरावट)
- **7-day & 30-day Reports**: Interactive bar charts
- **Subject-wise Breakdown**: Pie/Doughnut charts
- **Best/Worst Day Analysis**: आपके पैटर्न को समझें

### 4. 🎯 Goal Management  
- **Weekly Goals**: साप्ताहिक study लक्ष्य सेट करें
- **Progress Tracking**: वास्तविक समय प्रगति प्रतिशत
- **Goal Visualization**: किसी भी समय अपने लक्ष्य की स्थिति देखें

### 5. 🎨 Modern UI/UX
- **Beautiful Dashboard**: Productivity score visualization
- **Smooth Animations**: Fade-in, slide effects
- **Dark-friendly**: आरामदायक रंग पैलेट
- **Fully Responsive**: Mobile, tablet, desktop पर perfect
- **Mood Emojis**: Visual engagement

### 6. 💾 Data Persistence
- **Browser Storage**: सभी data `localStorage` में सुरक्षित
- **Offline Support**: Internet के बिना भी काम करता है
- **No Login**: सेटअप के बिना तुरंत उपयोग करें

---

## 📱 कैसे शुरू करें

### Web Version (Browser में)
1. `index.html` को ब्राउज़र में खोलें
2. आज की तारीख चुनें
3. Study sessions जोड़ें (विषय + घंटे)
4. मूड सेलेक्ट करें 😊
5. Sleep + Phone hours भरें
6. "Save Entry" दबाएं ✅

**तुरंत शुरू करें - कोई साइनअप नहीं!**

### Android APK (Mobile App)
**GitHub Actions से automatic build होता है!** नीचे देखें।

---

## 🔧 Technical Details

### आर्किटेक्चर
```
├── index.html          → UI template (HTML5)
├── style.css           → Responsive design + animations
├── app.js              → Core logic & state management (163 lines)
├── ai-engine.js        → AI insights & analytics (350+ lines)
└── package.json        → Capacitor + Dependencies
```

### Data Structure
```javascript
{
  id: 1707500000000,
  date: "2026-02-09",
  sessions: [
    { subject: "Maths", hours: 2.5 },
    { subject: "Physics", hours: 1.5 }
  ],
  sleepHours: 7,
  phoneHours: 2,
  mood: 4,  // 1-5 scale
  notes: "Good study session",
  timestamp: "2026-02-09T10:00:00Z"
}
```

### AI Engine Features
- **Pattern Detection**: Study consistency calculation
- **Trend Analysis**: Weekly improvement/decline tracking
- **Insight Generation**: Context-aware feedback in Hindi & English
- **Score Calculation**: Weighted productivity metrics
  - Study (35%), Sleep (25%), Consistency (25%), Phone Usage (15%)

---

## 📦 APK Build & Installation

### Automated Build (via GitHub Actions) ⭐ Recommended
Your code automatically builds APK when pushed to GitHub:

1. **Make changes** locally
2. **Push to GitHub**: `git push origin main`
3. **Wait 5-15 minutes** for automatic build
4. **Download APK** from:
   - GitHub → Actions → Latest run → Artifacts → `prashant-app-debug`
5. **Transfer to phone** via USB/Cloud
6. **Tap to install** on Android (allow unknown sources)

### Manual Local Build (Windows)
**Prerequisites:**
- Node.js 18+
- Java 17 (Temurin)
- Android SDK

**Step-by-step:**
```bash
cd "C:\Users\skris\Desktop\prashant"
npm install
npm run prepare-www
npx cap sync android
cd android && gradlew assembleDebug
```

APK location: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 📊 Sample AI Insights Output

```
🤖 AI INSIGHTS:

⭐ Excellent Consistency!
"आप पिछले 7 दिनों में बहुत नियमित हैं। औसतन 4.2 घंटे पढ़ाई प्रति दिन।"

✅ Perfect Sleep
"बेहतरीन! 7.5 घंटे की नींद आपके लिए आदर्श है।"

📱 Good Digital Balance
"प्रति दिन 2.1 घंटे फोन। अच्छा संतुलन रखें।"

📈 Improving Trend
"बधाई! आपकी पढ़ाई में 23.5% की बढ़ोतरी हुई है।"

PRODUCTIVITY SCORE: 78/100
```

---

## 🚀 Build Workflow

### GitHub Actions CI/CD
**File**: `.github/workflows/android-build.yml`

Steps:
1. ✅ Checkout code
2. ✅ Setup Node.js 18
3. ✅ Setup Java 17 (Temurin)
4. ✅ Setup Android SDK
5. ✅ Install dependencies (npm ci)
6. ✅ Prepare www folder
7. ✅ Sync Capacitor Android
8. ✅ Build APK (./gradlew assembleDebug)
9. ✅ Upload artifact

**Status**: Last build successful ✓

---

## 💡 Future Enhancements

- [ ] Cloud backup (Firebase)
- [ ] Multi-device sync
- [ ] Dark mode toggle
- [ ] CSV export/import
- [ ] Study timer (Pomodoro)
- [ ] Notification reminders
- [ ] iOS app (via Capacitor)
- [ ] More AI features (study recommendations)

---

## 📝 File Structure

```
prashant/
├── index.html              # Main UI
├── style.css               # Styling (600+ lines)
├── app.js                  # Logic & rendering
├── ai-engine.js            # AI & analytics
├── package.json            # Dependencies
├── capacitor.config.json   # Mobile config
├── prepare-www.js          # Build script
├── .github/workflows/
│   └── android-build.yml   # CI/CD pipeline
├── android/                # Capacitor Android
└── README.md              # This file
```

---

## 🎯 Usage Tips

1. **Set Weekly Goal**: Summary में goal set करें, progress automatic calculate होगी
2. **View Trends**: "Last 7 days" vs "Last 30 days" compare करें
3. **Check Insights**: 5+ entries के बाद AI insights दिखने लगते हैं
4. **Track Mood**: Mood tracking से आपकी productivity-mood relationship दिखती है
5. **Export Data**: Browser DevTools से localStorage export कर सकते हैं

---

## 🔐 Privacy & Security

- ✅ **No server**: सब data locally stored है
- ✅ **No tracking**: कोई analytics नहीं
- ✅ **Open source**: Code देख सकते हैं
- ✅ **No login**: Personal use के लिए सुरक्षित

---

## 📱 Device Requirements

- **Android**: 5.0+ (API 21+)
- **Browser**: Chrome, Firefox, Safari, Edge (latest)
- **Storage**: ~5MB
- **RAM**: 50MB+

---

## 💬 More Questions?

Check the code or open an issue on GitHub!

**Made with ❤️ for students**
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