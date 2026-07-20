import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== "string") {
            return NextResponse.json(
                { success: false, error: "Facebook post URL is required." },
                { status: 400 }
            );
        }

        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = "https://" + formattedUrl;
        }

        // Fetch HTML content of the Facebook post
        const response = await fetch(formattedUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Upgrade-Insecure-Requests": "1",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to fetch Facebook URL (HTTP ${response.status}). Ensure the post is public.`,
                },
                { status: 400 }
            );
        }

        const rawHtml = await response.text();

        // 1. Decode escaped slashes in JSON payloads (Facebook encodes https:\/\/scontent...)
        const unescapedHtml = rawHtml.replaceAll("\\/", "/").replaceAll("&amp;", "&");

        // 2. Extract OpenGraph Title
        let ogTitle = "";
        const titleMatch = unescapedHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                           unescapedHtml.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            ogTitle = titleMatch[1].replace(/ - Facebook$/, "").trim();
        }

        // 3. Regex for extracting high-res Facebook CDN image URLs
        // Facebook photo URLs usually match: scontent*.fbcdn.net or external*.fbcdn.net or fbsbx.com
        const fbcdnRegex = /https?:\/\/[a-zA-Z0-9.-]*fbcdn\.net\/[^\s"'\<\>]+|https?:\/\/[a-zA-Z0-9.-]*fbsbx\.com\/[^\s"'\<\>]+/gi;

        const matches = unescapedHtml.match(fbcdnRegex) || [];

        // Also check og:image meta tags explicitly
        const ogImageMatches = Array.from(
            unescapedHtml.matchAll(/<meta\s+property="og:image"\s+content="([^"]+)"/gi)
        ).map((m) => m[1]);

        const rawUrls = [...ogImageMatches, ...matches];

        // 4. Clean & Filter URLs
        const validUrls: string[] = [];
        const seenIds = new Set<string>();

        for (let imgUrl of rawUrls) {
            // Clean up trailing characters or quotes
            imgUrl = imgUrl.split(/["'\s<>\\]/)[0];

            // Filter out small thumbnails, icons, profile pics, and static JS assets
            if (
                imgUrl.includes("emoji.php") ||
                imgUrl.includes("rsrc.php") ||
                imgUrl.includes("static.xx") ||
                imgUrl.includes("/p50x50/") ||
                imgUrl.includes("/p100x100/") ||
                imgUrl.includes("/p160x160/") ||
                imgUrl.includes("/p200x200/") ||
                imgUrl.includes("/s50x50/") ||
                imgUrl.includes("/s100x100/") ||
                imgUrl.includes("cp0_") ||
                imgUrl.includes(".png?") // usually UI icons
            ) {
                continue;
            }

            // Extract a unique identifier from Facebook URL (e.g. 482057382_677508974847198)
            const idMatch = imgUrl.match(/(\d+_\d+_\d+_n|\d+_\d+_n|[a-f0-9]{32})/i);
            const imageId = idMatch ? idMatch[1] : imgUrl.split("?")[0];

            if (!seenIds.has(imageId)) {
                seenIds.add(imageId);
                validUrls.push(imgUrl);
            }
        }

        if (validUrls.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No high-resolution images found on the provided Facebook link. Ensure the post is public and contains photos.",
            });
        }

        return NextResponse.json({
            success: true,
            title: ogTitle,
            count: validUrls.length,
            images: validUrls,
        });
    } catch (err: any) {
        console.error("Facebook Importer API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || "An unexpected error occurred while parsing Facebook link." },
            { status: 500 }
        );
    }
}
