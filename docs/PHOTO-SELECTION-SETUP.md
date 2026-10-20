# SnapVerse Select — එකවර කරන setup එක

මේ update එකෙන් existing SnapVerse website එකට `/select` එකතු වෙනවා. Client කෙනාට browser එකෙන්ම JPEG previews තෝරන්න පුළුවන්. RAW files upload කරන්නේ නැහැ. Drive storage, Gmail sending සහ Firebase server credentials සම්බන්ධ කළ පසු පමණක් production workflow එක භාවිතා කරන්න.

## 1. දැනට තිබෙන Firebase project එක සම්බන්ධ කරන්න

SnapVerse දැනට භාවිතා කරන project එකම Firebase Console එකෙන් විවෘත කරන්න. Project Settings → Service accounts → Firebase Admin SDK යටතේ server credentials සකස් කරන්න. මේ credentials public repository එකකට හෝ chat එකට එවන්න එපා.

Vercel → SnapVerse project → Settings → Environment Variables තුළ server variables තුනක් එකතු කරන්න:

| නම | අගය |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Service account එකේ `project_id` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` |
| `FIREBASE_PRIVATE_KEY` | සම්පූර්ණ `private_key`; `\n` escaped newlines ද භාවිතා කළ හැකියි |
| `PROOFING_ADMIN_EMAILS` | `tharinduakalanka930@gmail.com` |

දැනට තිබෙන `NEXT_PUBLIC_FIREBASE_*` variables තියාගන්න. Firebase Authentication තුළ Google sign-in enable කර තිබිය යුතුයි. Live domain එක authorized domains තුළ තිබිය යුතුයි. Cloud Firestore database එක enable විය යුතුයි.

නව records `proofing_albums` සහ `proofing_settings` collections වලට server එකෙන් පමණක් ලියනවා. Firestore rules තුළ browser/client SDK access මේ collections දෙකට නොදෙන්න. Existing portfolio/user rules තබාගෙන පහත matches merge කරන්න. ඉහළ මට්ටමේ `allow read, write: if true` වැනි rule එකක් තිබේ නම් මේ denies පමණක් එකතු කිරීම ප්‍රමාණවත් නැහැ: Firestore rules වල ඕනෑම matching allow එකකින් access ලැබෙනවා. Production භාවිතයට පෙර මෙය තහවුරු කරන්න.

```text
match /proofing_albums/{document=**} {
  allow read, write: if false;
}
match /proofing_settings/{document=**} {
  allow read, write: if false;
}
```

## 2. ඔයාගේ Google Drive සහ Gmail authorization

මේක කරන්නේ studio owner පමණයි. Clientsට Google account එකකට sign in වීමට අවශ්‍ය නැහැ.

1. [Google Cloud Console](https://console.cloud.google.com/) එකෙන් project එකක් තෝරන්න හෝ අලුත් project එකක් හදන්න. Google Drive API සහ Gmail API enable කරන්න.
2. Google Auth Platform / OAuth consent screen එකේ app නම `SnapVerse Select` ලෙස සකස් කරන්න. Testing කරන අතරතුර `tharinduakalanka930@gmail.com` test user ලෙස එකතු කරන්න.
3. OAuth client එකක් **Web application** ලෙස හදන්න. Authorized redirect URI එකට `https://developers.google.com/oauthplayground` එකතු කරන්න.
4. [Google OAuth Playground](https://developers.google.com/oauthplayground/) විවෘත කරන්න. Settings → **Use your own OAuth credentials** තෝරා, ඔයාගේ client ID සහ secret එතැනට ඇතුළත් කරන්න. Googleගේ මේ පිටුවෙන්ම authorization කරන්න.
5. Scopes ලෙස `https://www.googleapis.com/auth/drive.file` සහ `https://www.googleapis.com/auth/gmail.send` තෝරන්න. ඔයාගේ `tharinduakalanka930@gmail.com` account එකෙන් authorize කර, authorization code එක tokens සඳහා exchange කරන්න.
6. ලැබෙන refresh token එක සහ OAuth client details Vercel server environment variables තුළට දාන්න. මේවා `NEXT_PUBLIC_` variables කරන්න එපා.

| නම | අගය |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Owner authorization එකෙන් ලැබුණු refresh token |
| `GOOGLE_GMAIL_ENABLED` | `true` |
| `GOOGLE_ACCOUNT_EMAIL` | `tharinduakalanka930@gmail.com` |
| `PROOFING_NOTIFY_EMAIL` | `tharinduakalanka930@gmail.com` |
| `PROOFING_SITE_URL` | `https://snapverse-m47a.vercel.app` |

Google OAuth app එක Testing තත්ත්වයේ තිබෙන විට මේ scopes සඳහා refresh token සාමාන්‍යයෙන් දවස් 7කින් expire වෙනවා. දිගටම භාවිතයට පෙර Googleගේ production/verification අවශ්‍යතා සම්පූර්ණ කරන්න. Publishing status වෙනස් කළ පමණින් Google verification සම්පූර්ණ වුණා කියලා අදහස් වෙන්නේ නැහැ.

Vercel variables save කළ පසු අදාළ branch එක redeploy කරන්න. `/select` විවෘත කර owner Google account එකෙන් sign in වෙන්න. Connections → **Create preview folder** ඔබන්න. App එක ownerගේ Drive තුළ `SnapVerse Client Previews` folder එක හදලා එහි ID එක server settings තුළ සුරකිනවා. `drive.file` scope එකෙන් app එක හදන files පමණක් භාවිතා කරන නිසා whole Drive එක public කරන්න අවශ්‍ය නැහැ.

Optional: කලින් මේ OAuth app එකෙන්ම නිර්මාණය කළ folder එකක් භාවිතා කරනවා නම් `GOOGLE_DRIVE_FOLDER_ID` variable එක දෙන්න. වෙනත් app එකකින් සෑදූ ඕනෑම folder ID එකක් `drive.file` scope එකෙන් access කළ හැකි බව උපකල්පනය කරන්න එපා.

Gmail වෙනුවට Resend දැනට භාවිතා කරනවා නම් `RESEND_API_KEY`, verified sender එකක් සඳහා `PROOFING_EMAIL_FROM`, සහ `PROOFING_NOTIFY_EMAIL` යොදාගත හැකියි. Gmail enable කර තිබේ නම් Gmail භාවිතා කරනවා.

## 3. Lightroom Classic — එක click එකෙන් විවෘත කිරීම

Clientට කිසිම app එකක් install කරන්න අවශ්‍ය නැහැ. Photographerගේ Windows computer එකට පමණක් මේ bridge එක සහ Lightroom plug-in එක එකවර install කළ යුතුයි.

1. `/select` → Connections → **Download plug-in**. ZIP එක permanent folder එකකට extract කරන්න.
2. Lightroom Classic → File → Plug-in Manager → Add → `SnappersSelect.lrplugin` folder එක තෝරන්න.
3. Bridge installer එක run කරන්න. Node.js 22 හෝ අලුත් version එකක් computer එකේ තිබිය යුතුයි. Package එකේ `Install-Bridge.ps1` තුළ trusted website origin එක සහ Lightroom executable path එක භාවිතා වෙනවා. Installer එක currently running Lightroom path එක මුලින් හඳුනාගන්නවා; අවශ්‍ය නම් `-LightroomPath` දෙන්න.

```powershell
./Install-Bridge.ps1 -SiteOrigin 'https://snapverse-m47a.vercel.app'
```

Installer එක current Windows user සඳහා `snappers-select://` link handler එක register කරනවා. Files `%LOCALAPPDATA%\SnappersSelect` තුළ තබනවා. Selection queue එක Documents\SnappersSelect\Inbox තුළ තියෙනවා. System execution policies වෙනස් කරන්නේ නැහැ; installer run වීම policy එකකින් නවත්වනවා නම් ඒ policy වෙනස් නොකර manual text export එක භාවිතා කරන්න හෝ installer එක සුදුසු ලෙස sign කරගන්න.

4. RAW originals Lightroom catalog එකට import කර, ඒ drive එක සම්බන්ධ කරන්න.
5. Submitted album එකේ **Open in Lightroom** ඔබන්න. Browser එකේ external-app prompt එක අවශ්‍ය නම් ඔයා විසින් accept කරන්න.
6. Bridge එක trusted website එකෙන් selection manifest එක ගෙන Lightroom විවෘත කරනවා. Plug-in එක inbox බලලා shoot එකේ RAW folder එක තෝරන්න අහනවා. ඒ folder එක යටතේ catalog RAW files ගළපලා නව collection එකක් හදනවා.

මේක client submit කළ විගස computer එක අවදි කරන unattended service එකක් නොවේ. Photographer dashboard එකේ එක click එකෙන් handoff කරන workflow එකයි. RAW folder එක shoot එකට වරක් තෝරාගන්න අවශ්‍යයි. ඇත්ත RAW catalog එකක් සමඟ plug-in runtime සහ browser protocol handoff පරීක්ෂා කිරීම තවම අවශ්‍යයි.

Automatic handoff එකට විකල්පයක් ලෙස **Export Lightroom selection** file එක download කර Lightroom → Library → Plug-in Extras → Import client selection භාවිතා කරන්න.

## 4. දිනපතා භාවිතය

1. `/select` → Create album → client name සහ photo limit දෙන්න. `0` යනු client තෝරාගන්නා photo ගණනට limit නැති බවයි.
2. JPEG/JPG previews add කරන්න. Browser එක longest edge 1,800px දක්වා resize කරනවා. Original filename සුරකිනවා. RAW files upload වෙන්නේ නැහැ.
3. Camera දෙකක එකම filename තියෙනවා නම් camera subfolders සහිත folder එක upload කරන්න. JPEG camera subfolders සහ RAW camera subfolders එකම නම් භාවිතා කරන්න.
4. Make ready to share → Copy client link → clientට යවන්න.
5. Clientට preview, select, selected-only filter, filename search, notes, Save progress සහ Send selection තියෙනවා. Selection අවසන් කළ පසු වෙනස් කරන්න photographer විසින් album එක reopen කළ යුතුයි.
6. Submission එක dashboard එකේ සුරකිනවා. Email failure එක selection එක නැති කරන්නේ නැහැ. Retry email button එක තියෙනවා.
7. Open in Lightroom → නිවැරදි RAW folder එක තෝරන්න. Missing/offline/ambiguous RAW තිබේ නම් collection එක නොහදා report එකක් පෙන්වනවා. වැරදි RAW එකක් අනුමාන කර තෝරන්නේ නැහැ.

## 5. Storage සහ සීමා

Previews ඔයාගේ Drive storage quota එක භාවිතා කරනවා. Unlimited storage යන පොරොන්දුවක් නැහැ. Selection records Firebase භාවිතා කරන නිසා එහි quota/charges ද අදාළයි. Preview එකකට server limit 3 MB, album එකකට previews 10,000, note එකකට characters 1,000. විශාල shoots අවශ්‍ය නම් albums වලට බෙදන්න. Album එකක සියලු notes සහ selected IDs එකට 700 KBට අඩු විය යුතුයි.

Client page එකේ download button එකක් නැහැ. නමුත් browser එකක photo පෙන්වන විට preview data clientගේ device එකට යන නිසා screenshot/save කිරීම සම්පූර්ණයෙන් වළක්වන්න බැහැ. RAW originals clientට ලබාදෙන්නේ නැහැ.

## 6. Live භාවිතයට පෙර අවසන් පරීක්ෂාව

Owner authorization සහ environment setup සම්පූර්ණ කළ පසු sample JPEG 3ක් සහ ඒවායේ RAW counterparts සමඟ මෙම එක් full test එක කරන්න: upload → client link එක වෙනත් browser/device එකක විවෘත කරන්න → select දෙකක් → note එකක් → submit → Gmail notification ලැබීම → Open in Lightroom → හරියට RAW දෙකම collection එකේ තිබීම තහවුරු කරන්න. Google Drive quota/access error එකකදී app එකේ error එක පැහැදිලිව පෙන්වනවාද බලන්න.

## නිල මාර්ගෝපදේශ

- [Google Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
- [Google OAuth and refresh-token expiry](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API sending](https://developers.google.com/workspace/gmail/api/guides/sending)
- [Firebase Admin setup](https://firebase.google.com/docs/admin/setup)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
