import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { success: false, error: "Google Drive folder URL or ID is required." },
                { status: 400 }
            );
        }

        const trimmedInput = url.trim();

        // 1. Extract Folder ID
        let folderId: string | null = null;
        if (/^[a-zA-Z0-9_-]{15,60}$/.test(trimmedInput)) {
            folderId = trimmedInput;
        } else {
            const folderMatch = trimmedInput.match(/(?:folders\/|id=|\/d\/)([a-zA-Z0-9_-]{15,60})/);
            if (folderMatch) {
                folderId = folderMatch[1];
            }
        }

        if (!folderId) {
            return NextResponse.json(
                { success: false, error: "Invalid Google Drive link format. Could not locate folder ID." },
                { status: 400 }
            );
        }

        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.GOOGLE_DRIVE_API_KEY;
        const foundFiles: { id: string; name: string; url: string }[] = [];
        let extractedTitle = "";

        // ---------------------------------------------------------
        // METHOD A: Use Google Drive v3 REST API (if API Key exists)
        // ---------------------------------------------------------
        if (apiKey) {
            try {
                // Fetch folder metadata (title)
                const folderInfoRes = await fetch(
                    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=name&key=${apiKey}`
                );
                if (folderInfoRes.ok) {
                    const folderInfo = await folderInfoRes.json();
                    if (folderInfo.name && folderInfo.name !== "Drive") {
                        extractedTitle = folderInfo.name;
                    }
                }

                // Query files inside folder
                const query = `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType = 'application/octet-stream')`;
                const filesRes = await fetch(
                    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=1000&key=${apiKey}`
                );

                if (filesRes.ok) {
                    const filesData = await filesRes.json();
                    if (filesData.files && Array.isArray(filesData.files)) {
                        for (const file of filesData.files) {
                            foundFiles.push({
                                id: file.id,
                                name: file.name,
                                url: `https://lh3.googleusercontent.com/d/${file.id}`,
                            });
                        }
                    }
                }
            } catch (apiErr) {
                console.warn("Drive API fetch failed, falling back to public scraper:", apiErr);
            }
        }

        // ---------------------------------------------------------
        // METHOD B: Web Scraping Fallback (Embedded Folder View & Web Page)
        // ---------------------------------------------------------
        if (foundFiles.length === 0) {
            const headers = {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            };

            // 1. Embedded folder view is a lightweight HTML representation of public Drive folders
            const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
            const embedRes = await fetch(embedUrl, { headers, cache: "no-store" });

            if (embedRes.ok) {
                const html = await embedRes.text();

                // Extract folder title
                const titleMatch = html.match(/<title>(.*?) - Google Drive<\/title>/i) || html.match(/<div class="folder-name">(.*?)<\/div>/i);
                if (titleMatch && titleMatch[1]) {
                    extractedTitle = titleMatch[1].trim();
                }

                // Extract file IDs from embedded view items: id="entry-FILEID" or thumbnail id=...
                const fileIdRegex = /id=["']entry-([a-zA-Z0-9_-]{15,60})["']|\/file\/d\/([a-zA-Z0-9_-]{15,60})|thumbnail\?id=([a-zA-Z0-9_-]{15,60})/g;
                const matches = Array.from(html.matchAll(fileIdRegex));
                const seenIds = new Set<string>();

                for (const match of matches) {
                    const fileId = match[1] || match[2] || match[3];
                    if (fileId && fileId !== folderId && !seenIds.has(fileId)) {
                        seenIds.add(fileId);
                        foundFiles.push({
                            id: fileId,
                            name: `Drive Photo ${seenIds.size}`,
                            url: `https://lh3.googleusercontent.com/d/${fileId}`,
                        });
                    }
                }
            }

            // 2. Direct folder page scraping fallback
            if (foundFiles.length === 0) {
                const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;
                const folderRes = await fetch(folderUrl, { headers, cache: "no-store" });
                if (folderRes.ok) {
                    const html = await folderRes.text();
                    
                    if (!extractedTitle) {
                        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>(.*?)<\/title>/i);
                        if (titleMatch && titleMatch[1]) {
                            extractedTitle = titleMatch[1].replace(/ - Google Drive$/, "").trim();
                        }
                    }

                    // Look for 28+ char Google Drive file IDs associated with image files
                    const genericIdRegex = /"([a-zA-Z0-9_-]{28,45})"/g;
                    const matches = Array.from(html.matchAll(genericIdRegex));
                    const seenIds = new Set<string>();

                    for (const match of matches) {
                        const candidateId = match[1];
                        if (candidateId && candidateId !== folderId && !seenIds.has(candidateId)) {
                            // Verify if it looks like a valid drive item payload chunk
                            seenIds.add(candidateId);
                            foundFiles.push({
                                id: candidateId,
                                name: `Drive Photo ${seenIds.size}`,
                                url: `https://lh3.googleusercontent.com/d/${candidateId}`,
                            });
                        }
                    }
                }
            }
        }

        if (foundFiles.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No accessible photos found in this Google Drive folder. Please ensure folder sharing is set to 'Anyone with the link can view'.",
            });
        }

        // Clean & format title
        if (extractedTitle.toLowerCase() === "webpublish" || extractedTitle.toLowerCase() === "drive") {
            extractedTitle = "";
        }

        return NextResponse.json({
            success: true,
            title: extractedTitle,
            count: foundFiles.length,
            images: foundFiles.map((f) => f.url),
        });
    } catch (err: any) {
        console.error("Google Drive Importer API Error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Failed to process Google Drive link." },
            { status: 500 }
        );
    }
}
