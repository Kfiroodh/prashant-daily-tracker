# 🔥 Firebase Setup Guide for PRASHANT

PRASHANT अब **Google Login**, **Live Chat**, **Photo Upload**, और **Sharing** सपोर्ट करता है! यह सब Firebase से होता है।

## 📋 Step-by-Step Setup

### Step 1: Firebase Project बनाएं
1. [Firebase Console](https://console.firebase.google.com) खोलें
2. "Create Project" पर क्लिक करें
3. Project का नाम दें: `prashant-app`
4. Continue → Create project → Wait for setup

### Step 2: Firebase Config क्या आपको मिलेगा?
Project बनने के बाद, आपको ये मिलेगा:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

### Step 3: Config को App में डालें
1. `firebase-config.js` file खोलें
2. ऊपर दिए Config को अपने Firebase credentials से बदलें
3. Save करें

### Step 4: Authentication Setup करें
1. Firebase Console → Authentication → Get Started
2. **Google** provider को Enable करें
3. Email support भी Enable करें
4. Save

### Step 5: Firestore Database Setup करें
1. Firebase Console → Firestore Database
2. "Create Database" पर क्लिक करें
3. Production mode चुनें
4. Location: भारत (asia-south1)
5. Enable Database

**Firestore Security Rules** (Production के लिए):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Chats collection
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Shared items
    match /shared/{itemId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### Step 6: Cloud Storage Setup करें
1. Firebase Console → Storage
2. "Get Started" पर क्लिक करें
3. Security rules अपने आप set हो जाएंगे
4. Done!

**Storage Security Rules**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images and files
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 7: App में Google Login Setup करें
1. Firebase Console → Settings → Project settings
2. Authorized domains में अपना domain डालें
3. Local testing के लिए: `localhost` add करें

### Step 8: Test करें!
1. App खोलें
2. "🔐 Google से लॉगिन करें" पर क्लिक करें
3. Google account से login करें
4. बस!

---

## 🚀 Features जो अब काम करते हैं

### ✅ Google Login
- Google account से sign-in
- Profile auto-fill होता है
- Secure authentication

### ✅ Live Chat
- Friends के साथ real-time chat
- Photos भेजें
- Files share करें
- Timestamps के साथ messages

### ✅ Photo Upload
- Chat में photos भेजें
- Gallery में save करें
- Drag-and-drop support

### ✅ File Sharing
- PDF, Doc, Text files share करें
- Download करें
- File tracking

### ✅ Notes & Activity Sharing
- Productivity data share करें
- Friends के साथ notes भेजें

---

## 🔐 Important Security

यह app **local storage + Firebase** use करता है:

- **Local Storage**: Daily entries (device-specific)
- **Firestore**: User profiles, chats, shared items
- **Cloud Storage**: Photos and files

**Data Privacy**:
- सिर्फ authenticated users देख सकते हैं
- आपके data आपके ही हैं
- Firebase encryption बनी रहती है

---

## 🐛 Troubleshooting

### Error: "Permission denied"
→ Firestore rules check करें (ऊपर दिए rules को use करें)

### Error: "Storage not initialized"
→ Cloud Storage एक बार enable करें

### Google Login काम नहीं कर रहा
→ Firebase Console → Auth → Google provider enable है?

### Firebase not initialized
→ इंतज़ार करें 2-3 seconds, फिर try करें

---

## 📱 Mobile APK बनाएं

GitHub Actions से APK अपने-आप बनता है।

यह सब features mobile में perfect काम करेंगे 🎉

---

## 💡 Tips

1. **Testing**: localhost:8000 पर test करें
2. **Firebase**: Free tier पर 50K reads/day unlimited
3. **Storage**: 5GB free storage
4. **Backup**: अपना data regularly export करें

---

## 🎯 Next Steps

1. ✅ Firebase setup करो
2. ✅ Config file update करो
3. ✅ App खोलो
4. ✅ Google से login करो
5. ✅ Chat करो, photos share करो
6. ✅ APK बनाओ, phone में install करो

**Enjoy PRASHANT! 🚀**
