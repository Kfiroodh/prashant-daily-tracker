# PRASHANT — AI-Powered Productivity Tracker + Social Chat 🚀

**एक आधुनिक, बुद्धिमान दैनिक गतिविधि ट्रैकर जो आपकी उत्पादकता विश्लेषण करता है और दोस्तों के साथ शेयर करने देता है।**

---

## ✨ नई Features (Social + Chat)

### 🔐 Google Login
- Google account से सीधे login करें
- Profile auto-fill होता है
- One-click sign-in
- Secure Firebase authentication

### 💬 Live Chat
- Friends के साथ **real-time chat**
- Text messages
- Photo sharing (📸)
- File sharing (📎)
- Timestamps के साथ सभी messages

### 📤 Photo & File Upload
- Chat में तुरंत photos upload करें
- Documents share करें (PDF, Word, Text)
- Drag-and-drop support
- Cloud Storage में safe रहता है

### 📝 Notes Sharing
- Notes बनाएं और share करें
- Activities share करें friends के साथ
- Title + Description के साथ
- Multiple friends को एक साथ share करें

### 👥 Friends Management
- Email से दोस्त जोड़ें
- Friends list देखें
- Friend-specific stats देखें
- One-click chat open करें

### 📊 Shared Content Gallery
- सब कुछ एक जगह में
- Photos, files, notes
- Likes और comments (ready for future)
- Download करने की सुविधा

---

## 🎯 Original Features (Updated)

### 1. 📝 Daily Activity Tracking
- ✅ Study Sessions + Topics
- ✅ Sleep & Phone Usage
- ✅ Mood Tracking (😢😕😐🙂😄)
- ✅ Personal Notes

### 2. 🤖 AI-Powered Insights
- ✅ Productivity Score (0-100)
- ✅ Study Consistency Analysis
- ✅ Sleep Patterns
- ✅ Phone Usage Detection
- ✅ Weekly Trends
- ✅ Personalized Motivations

### 3. 📊 Advanced Analytics
- ✅ 7-day & 30-day Reports
- ✅ Subject-wise Breakdown
- ✅ Interactive Charts
- ✅ Weekly Summary

### 4. 🎯 Goal Management
- ✅ Weekly Goals
- ✅ Progress Tracking
- ✅ Goal Visualization

---

## 🚀 Getting Started

### 1️⃣ Firebase Setup (IMPORTANT!)
**यह एक बार करना है।**

1. [Firebase Console](https://console.firebase.google.com) खोलें
2. New Project बनाएं (free tier)
3. Google Auth enable करें
4. Firestore Database create करें
5. Cloud Storage enable करें
6. अपना **Firebase Config** `firebase-config.js` में डालें

👉 **Detailed Guide**: [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

### 2️⃣ Browser में उपयोग करें
```bash
# Start local server
npx http-server -p 8000

# Browser खोलें
localhost:8000
```

### 3️⃣ Google से Login करें
1. "🔐 Google से लॉगिन करें" बटन पर क्लिक करें
2. Google account चुनें
3. **Boom! 🎉 आप अंदर हे**

### 4️⃣ Features Explore करें
- **📊 Tracker**: अपनी activity record करें
- **💬 Chat**: Friends को message करें और files share करें
- **📤 Share**: Photos और notes share करें
- **👥 Friends**: Dost add करें

---

## 📱 Android Phone में Install करें

### Option 1: GitHub Actions (Automatic) ⭐
```bash
# अपना changes push करें
git push origin main

# 10-15 minutes का wait करें
# GitHub → Actions → Download APK artifact

# APK को phone में transfer करें
# Tap करके install करें
# Allow unknown sources अगर पूछे
```

### Option 2: Local Build
```bash
# Prerequisites: Java 17, Android SDK, Node.js

npm install
npm run prepare-www
npx cap sync android
cd android && gradlew assembleDebug
```

---

## 📊 App Architecture

```
PRASHANT/
├── firebase-config.js      # Firebase setup
├── auth.js                 # (Legacy - अब prashant-app.js में)
├── prashant-app.js         # Main app logic
├── simple-chat.js          # Chat functionality
├── share.js                # Sharing/upload
├── ai-engine.js            # AI insights
├── app.js                  # Tracker logic
├── index.html              # UI template
├── style.css               # Styling (1000+ lines)
└── FIREBASE_SETUP.md       # Firebase guide
```

---

## 🔥 Firebase Integration

### Data Structure

**Users Collection**
```javascript
{
  uid: "user123",
  email: "user@gmail.com",
  displayName: "Prashant",
  photoURL: "...",
  friends: ["user456", "user789"],
  createdAt: timestamp
}
```

**Chats Collection**
```javascript
chats/{chatId}/messages/{messageId} {
  senderId: "user123",
  senderName: "Prashant",
  type: "text|image|file",
  text: "Hello!",
  fileUrl: "gs://...",
  fileName: "photo.jpg",
  timestamp: serverTimestamp()
}
```

**Shared Collection**
```javascript
{
  title: "My Notes",
  description: "Study notes for Math",
  fileUrl: "gs://...",
  isImage: true,
  sharedBy: "user123",
  sharedByName: "Prashant",
  timestamp: serverTimestamp(),
  likes: 10
}
```

---

## 🎨 UI/UX Highlights

- 🌈 **Modern Design**: Card-based layout
- ✨ **Animations**: Smooth transitions
- 📱 **Responsive**: Mobile-first approach
- 🌙 **Dark-friendly**: Easy on eyes
- 🎯 **Intuitive**: Simple navigation
- 🔔 **Real-time**: Live updates

---

## 🔐 Security & Privacy

✅ **Authentication**: Firebase Google Auth
✅ **Database**: Firestore with security rules
✅ **Storage**: Cloud Storage with encryption
✅ **Data Ownership**: आपके data आपके हैं
✅ **No Tracking**: No analytics/ads
✅ **Open Source**: Code देख सकते हो

---

## 📊 Sample Chat Flow

```
1. Login करो →  Google से
     ↓
2. Friends जोड़ो → Email से
     ↓
3. Chat खोलो → 1 click में
     ↓
4. Message भेजो → Type + Send
     ↓
5. Photo share करो → Upload button
     ↓
6. Notes share करो → Create & Share
     ↓
7. History देखो → सब messages saved
```

---

## 🌟 Advanced Features

### Sharing Activity Data
```javascript
// अपनी productivity data share करो
{
  date: "2026-02-09",
  sessions: [{subject: "Math", hours: 2}],
  sleepHours: 7,
  phoneHours: 2,
  mood: 4
}
```

### Real-time Sync
- Messages instantly deliver होते हैं
- Photos upload होते हैं
- Files accessible होती हैं तुरंत

### Offline Support (Coming)
- Local data अभी localStorage में
- Future में offline sync करेंगे

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Firestore not initialized" | Firebase_config.js में credentials डालो |
| "Permission denied" | Firestore security rules check करो |
| "Google login fail" | Google provider enable है Firebase में? |
| "Chat not loading" | Internet connection check करो |
| "Photo upload fail" | Cloud Storage enable है? Size < 5MB? |

---

## 🚀 Future Roadmap

- [ ] Video calling (WebRTC)
- [ ] Group chats
- [ ] Notification system
- [ ] Offline sync
- [ ] Dark mode toggle
- [ ] Subject recommendations
- [ ] Time-based reminders
- [ ] iOS app (Capacitor)
- [ ] Desktop app (Electron)

---

## 📝 File Breakdown

| File | Purpose | Size |
|------|---------|------|
| index.html | UI structure | 15KB |
| style.css | Complete styling | 35KB |
| prashant-app.js | Main integration | 10KB |
| simple-chat.js | Chat logic | 8KB |
| share.js | Sharing logic | 7KB |
| ai-engine.js | Analytics | 12KB |
| app.js | Tracker logic | 6KB |
| firebase-config.js | Firebase setup | 2KB |

**Total Size**: ~100KB (gzipped: ~25KB)

---

## 💡 Tips for Better Experience

1. **Use Good Internet**: Chat needs live connection
2. **Enable Notifications**: (Coming soon)
3. **Clear Cache**: Regularly clear browser cache
4. **Backup Data**: Download entries regularly
5. **Invite Friends**: Solo tracker → Social network 🎉

---

## 🤝 Contributing

- Found a bug? → Report it!
- Have an idea? → Suggest it!
- Want to improve code? → Pull request!

---

## 📜 License

MIT License - Use freely!

---

## 🎯 Made with ❤️

**By**: Prashant (यह एक नाम है, सिर्फ एक app नहीं 😄)

**For**: Students, family, friends जो अपनी productivity track करना चाहते हैं

**Powered by**: Firebase, Capacitor, AI

---

## 📞 Support

- 📧 Email: Check GitHub profile
- 🐛 Issues: GitHub issues
- 💬 Discussion: GitHub discussions

---

## 🎉 Ready to start?

1. ✅ Firebase setup करो
2. ✅ Code clone करो
3. ✅ Config file update करो
4. ✅ localhost:8000 खोलो
5. ✅ Google से login करो
6. ✅ Friends को invite करो
7. ✅ Share करो! 📤

**Here we go! 🚀**
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