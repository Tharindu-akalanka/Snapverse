# SnapVerse Select — validation report

Date: 20 October 2026

## Passed

- Production Next.js compilation and TypeScript checks for the existing SnapVerse project with `/select` and `/api/proofing/[...path]`.
- Six unit tests: original JPEG filename preservation, path traversal rejection, selection membership/duplicates/limits/notes, selected-only export, and desktop protocol validation/trusted-origin enforcement.
- 35 application handler checks using mocked Firebase Auth, Firestore and Drive: server admin enforcement, cross-origin rejection, draft/private album access, upload deduplication, required storage configuration, share/reopen transitions, notes and selections surviving reads, final submission lock, export, and Gmail MIME notification generation. No live email was sent.
- 18 checks of the actual Drive storage adapter with mocked HTTP: refresh-token exchange, concurrent token refresh coalescing and caching, private parent folder metadata, upload/read/delete requests, quota errors and revoked token errors. No Google account was accessed.
- Three Lightroom plug-in files parsed successfully as Lua 5.1.
- Ten scenarios executed against the actual Lightroom import script using a Lua runtime and an SDK test double: exact RAW match, ambiguous duplicate names, camera-relative path resolution, JPEG exclusion, offline files, shoot-root boundaries, missing files preventing a partial collection, two selections mapping to the same RAW, invalid manifests and traversal paths.
- Windows bridge installer parsed successfully without execution. Bridge URL parsing unit tests reject insecure site origins and malformed album credentials.
- An independent local D1/R2 harness passed 36 HTTP assertions for upload, validation, persistence, authorization, submit/reopen and export. This is a separate storage adapter, not a live Firebase integration test.
- Browser checks with synthetic JPEGs in that local harness: gallery and preview render, photo limit prevents an extra selection, note editing, draft save, confirmation, submitted-state lock. Screenshot is provided with the handoff. The production-integrated `/select` route also returned HTTP 200 and displayed its missing-server-configuration state correctly.

Run project regression checks with `npm run test:proofing`. Run `npm run build` for the production build.

## Still required before production use

1. Configure the actual Firebase Admin credentials and inspect deployed Firestore rules for the private proofing collections.
2. Authorize the owner's Google OAuth app, configure server credentials, and create the app-owned Drive folder from Connections.
3. Verify an actual JPEG upload/read through the owner's Drive and an actual Gmail notification to the designated owner.
4. Install the desktop protocol bridge and Lightroom plug-in. Verify browser handoff and RAW collection creation inside the installed Lightroom Classic with a small real shoot.
5. Verify the client link on a separate phone/browser, using the Vercel deployment and actual Firebase/Drive services.

The automated tests do not establish that these live account and desktop integrations have been completed. The code is prepared for review and account setup; it is not a fully commissioned production service yet.

## Practical limits

Preview uploads are resized to a longest edge of 1,800 pixels. The Vercel server accepts previews up to 3 MB each, up to 10,000 photos per album. Notes are capped at 1,000 characters per selected photo and the total selection document is bounded to 700 KB. Google Drive and Firebase quotas still apply. Original RAW files remain on the photographer's computer.

The desktop handoff begins when the photographer clicks Open in Lightroom. It does not wake an offline computer or act as an unattended notification listener. The photographer chooses the shoot's RAW root before matching. Browser photo viewing cannot prevent screenshots or saving preview data.
