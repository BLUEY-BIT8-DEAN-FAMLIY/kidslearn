# KidsLearn – בנייה לאנדרואיד (APK) ולמחשב (אופליין)

הגרסאות האלה עובדות **לגמרי אופליין** (למטוס וכו') – כל התרגילים נוצרים במכשיר,
הנתונים נשמרים ב-localStorage, וההקראה משתמשת בקול של המכשיר. אין שרת ואין חנות אפליקציות.

## פלטים מוכנים
- `dist-apk/KidsLearn-1.2.0.apk` – התקנה על אנדרואיד (העברה למכשיר + התקנה ידנית).
- `dist-apk/KidsLearn-Offline.html` – מחשב: קובץ בודד, לחיצה כפולה פותחת בדפדפן. עובד מ-file://.

## כלים (מותקנים פעם אחת במחשב הזה)
- JDK 21: `C:\Users\97252\AppData\Local\KidsLearnBuild\jdk-21.0.11+10`
- Android SDK: `%LOCALAPPDATA%\Android\Sdk` (platform-tools, platforms;android-35, build-tools;35.0.0)
- keystore חתימה: `client/android/kidslearn-release.keystore` (סיסמה: kidslearn123, alias: kidslearn) — מקומי בלבד, לא נכנס ל-git.

## בניית APK מחדש (אחרי שינוי בקוד)
```powershell
$env:JAVA_HOME="C:\Users\97252\AppData\Local\KidsLearnBuild\jdk-21.0.11+10"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

cd C:\Users\97252\GAME3\client
npm run build:app          # בונה את ה-web ומכניס ל-android
npx cap copy android
cd android
.\gradlew.bat assembleRelease --no-daemon
# הפלט: app\build\outputs\apk\release\app-release.apk
```

## בניית גרסת המחשב האופליין מחדש
```powershell
cd C:\Users\97252\GAME3\client
npm run build:offline      # פלט: dist-offline\index.html (קובץ בודד)
```

## התקנה על אנדרואיד
1. להעביר את קובץ ה-APK לטלפון/טאבלט (כבל USB, גוגל דרייב, וכו').
2. בטלפון: לפתוח את הקובץ → לאשר "התקנה ממקורות לא ידועים" → התקנה.
3. אחרי ההתקנה הכל עובד בלי אינטרנט.
