# Preview retention

Final submission schedules cleanup 14 x 24 hours later. The daily production Vercel cron runs at 02:00 UTC (07:30 Sri Lanka); cleanup happens on the next run, not exactly at the deadline. CRON_SECRET must be configured on the production deployment. Vercel does not run cron on Preview deployments. Drive OAuth must be working. This is not enabled merely by committing this file.

The job queries only due album records and rechecks submission and state in a transaction. Reopening before cleanup starts cancels the deadline; resubmission schedules a fresh 14 days. Once cleanup starts, reopening and new uploads are blocked. Per-photo progress allows retries after partial failures or the execution time budget; large albums may need multiple daily runs.

Only Drive file IDs recorded in that album are considered. Each file must have exactly the app-owned `snappersKey=albumId/photoId` tag; untagged files, mismatched files, other albums and folders are never modified. Cleanup permanently deletes each verified file ID, never deletes folders or empties Drive Trash. Metadata, chosen filenames and notes remain for Lightroom export. Missing files are idempotent. Previews return HTTP 410 once cleared.

Permanent cleanup cannot be undone; keep RAW originals and backups locally. Existing submissions without cleanupAt are not retroactively scheduled. Failed ownership checks require operator investigation; the job does not fall back to filename search or broad deletion.

Validation: unit HTTP adapter cases cover exact ownership, other-shoot and untagged rejection, failed reads, missing-file retries and the 14-day boundary. Backend cases cover scheduler authentication, future albums, submitted cleanup, repeated runs, expired images, blocked reopening and retained export. External Google services are mocked; no real user files were removed during testing.
