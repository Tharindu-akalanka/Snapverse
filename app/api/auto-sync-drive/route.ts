import { NextResponse } from "next/server";
import { getDbAlbums, saveDbAlbum } from "@/lib/db-albums";
import { Album } from "@/data/albums";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function parseCategoryFolderName(name: string): Album["category"] | null {
    const lower = name.trim().toLowerCase();
    if (lower.includes("wedding")) return "Wedding";
    if (lower.includes("engagement")) return "Engagement";
    if (lower.includes("preshoot") || lower.includes("pre-shoot")) return "Pre-shoot";
    if (lower.includes("birthday")) return "Birthday";
    if (lower.includes("graduation")) return "Graduation";
    if (lower.includes("event")) return "Events";
    if (lower.includes("commercial")) return "Commercial";
    return null;
}

function detectCategoryFromTitle(title: string): Album["category"] {
    return parseCategoryFolderName(title) || "Wedding";
}

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
};

async function getSubfolders(parentFolderId: string, apiKey?: string): Promise<{ id: string; name: string }[]> {
    const folders: { id: string; name: string }[] = [];

    if (apiKey) {
        try {
            const query = `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
            const res = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1000&key=${apiKey}`
            );
            if (res.ok) {
                const data = await res.json();
                if (data.files) {
                    return data.files;
                }
            }
        } catch (err) {
            console.warn(`Drive API subfolders fetch error for ${parentFolderId}:`, err);
        }
    }

    // Fallback scraper if API key didn't return folders
    try {
        const embedUrl = `https://drive.google.com/embeddedfolderview?id=${parentFolderId}#list`;
        const embedRes = await fetch(embedUrl, { headers, cache: "no-store" });
        if (embedRes.ok) {
            const html = await embedRes.text();
            const folderIdRegex = /id=["']entry-([a-zA-Z0-9_-]{15,60})["'][\s\S]*?class=["']filename["'][^>]*>(.*?)<\/div>/g;
            const matches = Array.from(html.matchAll(folderIdRegex));
            for (const m of matches) {
                if (m[1] && m[2]) {
                    folders.push({ id: m[1], name: m[2].trim() });
                }
            }
        }
    } catch (err) {
        console.warn(`Web scraper subfolders error for ${parentFolderId}:`, err);
    }

    return folders;
}

async function getPhotosFromFolder(folderId: string, apiKey?: string): Promise<string[]> {
    const photoUrls: string[] = [];

    if (apiKey) {
        try {
            const imgQuery = `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType = 'application/octet-stream')`;
            const imgRes = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(imgQuery)}&fields=files(id,name)&pageSize=1000&key=${apiKey}`
            );
            if (imgRes.ok) {
                const imgData = await imgRes.json();
                if (imgData.files) {
                    for (const file of imgData.files) {
                        photoUrls.push(`https://lh3.googleusercontent.com/d/${file.id}`);
                    }
                }
            }
        } catch (imgErr) {
            console.warn(`Error fetching images for ${folderId}:`, imgErr);
        }
    }

    // Fallback scraping for photos in WebPublish folder
    if (photoUrls.length === 0) {
        try {
            const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
            const embedRes = await fetch(embedUrl, { headers, cache: "no-store" });
            if (embedRes.ok) {
                const html = await embedRes.text();
                const fileIdRegex = /id=["']entry-([a-zA-Z0-9_-]{15,60})["']|\/file\/d\/([a-zA-Z0-9_-]{15,60})|thumbnail\?id=([a-zA-Z0-9_-]{15,60})/g;
                const matches = Array.from(html.matchAll(fileIdRegex));
                const seen = new Set<string>();
                for (const match of matches) {
                    const fileId = match[1] || match[2] || match[3];
                    if (fileId && fileId !== folderId && !seen.has(fileId)) {
                        seen.add(fileId);
                        photoUrls.push(`https://lh3.googleusercontent.com/d/${fileId}`);
                    }
                }
            }
        } catch (err) {
            console.warn(`Error scraping images for ${folderId}:`, err);
        }
    }

    return photoUrls;
}

async function runAutoSync(requestRootId?: string) {
    const rootFolderId =
        requestRootId ||
        process.env.NEXT_PUBLIC_GDRIVE_ROOT_FOLDER_ID ||
        process.env.GDRIVE_ROOT_FOLDER_ID ||
        process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!rootFolderId) {
        return {
            success: false,
            error: "Google Drive Root Folder ID is not configured. Set GDRIVE_ROOT_FOLDER_ID in environment variables.",
            syncedCount: 0,
            newlySynced: [],
        };
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.GOOGLE_DRIVE_API_KEY;
    const existingAlbums = await getDbAlbums();
    const existingSlugs = new Set(existingAlbums.map((a) => a.slug));

    const newlySynced: string[] = [];

    // 1. Fetch top-level items inside Root Folder
    const topFolders = await getSubfolders(rootFolderId, apiKey);

    // List of shoots to process: { shootFolderId, shootTitle, category }
    const pendingShoots: { shootFolderId: string; shootTitle: string; category: Album["category"] }[] = [];

    for (const folder of topFolders) {
        const categoryName = parseCategoryFolderName(folder.name);

        if (categoryName) {
            // This top-level folder is a Category folder (e.g. Wedding, Pre-shoot, Birthday, etc.)
            const categoryShoots = await getSubfolders(folder.id, apiKey);
            for (const cShoot of categoryShoots) {
                if (cShoot.name.trim().toLowerCase() === "webpublish") continue;
                pendingShoots.push({
                    shootFolderId: cShoot.id,
                    shootTitle: cShoot.name.trim(),
                    category: categoryName,
                });
            }
        } else {
            // This top-level folder is directly a Shoot folder (e.g. "Nuwan & Dulmi Wedding")
            if (folder.name.trim().toLowerCase() === "webpublish") continue;
            pendingShoots.push({
                shootFolderId: folder.id,
                shootTitle: folder.name.trim(),
                category: detectCategoryFromTitle(folder.name),
            });
        }
    }

    // 2. Process each shoot folder
    for (const shoot of pendingShoots) {
        const shootSlug = slugify(shoot.shootTitle);

        // Skip if already synced in Firestore
        if (existingSlugs.has(shootSlug)) {
            continue;
        }

        // Search for 'WebPublish' subfolder inside Shoot folder
        const shootSubfolders = await getSubfolders(shoot.shootFolderId, apiKey);
        const webPublishFolder = shootSubfolders.find(
            (sf) => sf.name.trim().toLowerCase() === "webpublish"
        );

        const targetFolderId = webPublishFolder ? webPublishFolder.id : shoot.shootFolderId;

        // Fetch photos from target folder
        const photoUrls = await getPhotosFromFolder(targetFolderId, apiKey);
        if (photoUrls.length === 0) continue;

        // Create New Album
        const newAlbum: Album = {
            slug: shootSlug,
            title: shoot.shootTitle,
            category: shoot.category,
            location: "Sri Lanka",
            year: new Date().getFullYear().toString(),
            coverImage: photoUrls[0],
            description: `Visual stories captured from the ${shoot.shootTitle} shoot.`,
            images: photoUrls.map((url, idx) => ({
                id: `gdrive-auto-${idx + 1}-${Date.now()}`,
                src: url,
                alt: `${shoot.shootTitle} - photo ${idx + 1}`,
                width: 1200,
                height: 800,
            })),
            visibility: "public",
        };

        await saveDbAlbum(newAlbum);
        existingSlugs.add(shootSlug);
        newlySynced.push(shoot.shootTitle);
    }

    return {
        success: true,
        syncedCount: newlySynced.length,
        newlySynced,
    };
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const result = await runAutoSync(body?.rootFolderId);
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Auto Drive Sync Engine Error (POST):", err);
        return NextResponse.json(
            { success: false, error: err.message || "Auto sync failed." },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const result = await runAutoSync();
        return NextResponse.json(result);
    } catch (err: any) {
        console.error("Auto Drive Sync Engine Error (GET):", err);
        return NextResponse.json(
            { success: false, error: err.message || "Auto sync failed." },
            { status: 500 }
        );
    }
}
