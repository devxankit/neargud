# Firebase Keys Guide - Konsi Keys Chahiye?

Firebase configure karne ke liye aapko **2 types ki keys** chahiye hongi:

## 1. Backend Ke Liye (Private Server Key)
Ye key sabse important hai. Isse backend server Firebase ko control karta hai.

*   **Key Name:** Service Account Key (JSON file)
*   **Kahan milegi:**
    1.  [Firebase Console](https://console.firebase.google.com/) par jao.
    2.  Left menu mein **Project Overview** ke bagal mein ⚙️ (Gear icon) par click karo -> **Project settings**.
    3.  **Service accounts** tab par jao.
    4.  Niche **Generate new private key** button par click karo.
    5.  Ek `.json` file download hogi.

*   **Kahan dalein:**
    1.  `backend/.env` file mein ek nayi line add karein:
        ```env
        FIREBASE_SERVICE_ACCOUNT_KEY=paste_entire_json_content_here
        ```
    *   **Note:** Pura JSON content ek hi line mein hona chahiye. Agar space ya new lines hain to unhe hata kar ek single line string bana lein.

---

## 2. Frontend Ke Liye (Public Keys)
Ye keys browser/app ke liye hoti hain taki user notifications receive kar sake.

*   **Key Names:**
    *   `apiKey`
    *   `authDomain`
    *   `projectId`
    *   `storageBucket`
    *   `messagingSenderId`
    *   `appId`

*   **Kahan milegi:**
    1.  **Project settings** mein **General** tab par jao.
    2.  Niche scroll karo "Your apps" section tak.
    3.  `</>` (Web) icon par click karke nayi app register karo (agar nahi ki hai).
    4.  Wahan aapko `firebaseConfig` object dikhega jisme ye saari keys hongi.

*   **Ek aur Key (Web Push ke liye):**
    *   **Cloud Messaging** tab par jao.
    *   Niche **Web configuration** section mein **Web Push certificates** dekho.
    *   Key pair generate karo. Jo "Key pair" dikhega wo **VAPID Key** hai.

*   **Kahan dalein:**
    *   Frontend code mein `frontend/src/config/firebase.js` file mein (maine ye file bana di hai, aap bas values paste kar dena).

---

## Summary (Short Mein)

1.  **Backend:** Service Account JSON -> `.env` file mein.
2.  **Frontend:** ApiKey, ProjectId, etc. -> `firebase.js` file mein.
3.  **Browser:** VAPID Key -> Frontend notification logic mein.
