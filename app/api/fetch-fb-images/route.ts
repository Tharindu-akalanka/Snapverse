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

        // If user directly pasted an image URL (e.g., scontent...fbcdn.net or .jpg/.png)
        if (
            formattedUrl.includes("fbcdn.net") ||
            formattedUrl.includes("fbsbx.com") ||
            /\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i.test(formattedUrl)
        ) {
            const cleanImgUrl = formattedUrl
                .replaceAll("\\/", "/")
                .replaceAll("&amp;", "&")
                .replaceAll("\\u0026", "&")
                .replaceAll("\\u003d", "=")
                .replaceAll("\\u003f", "?")
                .split(/["'\s<>\\]/)[0];

            return NextResponse.json({
                success: true,
                title: "Direct Image Link",
                count: 1,
                images: [cleanImgUrl],
            });
        }

        // Prepare headers: Mobile Safari user-agent avoids FB login redirects on public pages
        const headers = {
            "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            "Accept":
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        };

        // Try primary fetch
        let response = await fetch(formattedUrl, { headers, cache: "no-store", redirect: "follow" });

        // If failed or redirected to login, try m.facebook.com variant
        if (!response.ok || response.url.includes("login.php")) {
            let mobileUrl = formattedUrl.replace("www.facebook.com", "m.facebook.com");
            if (!mobileUrl.includes("m.facebook.com") && mobileUrl.includes("facebook.com")) {
                mobileUrl = mobileUrl.replace("facebook.com", "m.facebook.com");
            }
            response = await fetch(mobileUrl, { headers, cache: "no-store", redirect: "follow" });
        }

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

        // Decode escaped slashes & character codes in JSON payloads (Facebook embeds JSON strings)
        const unescapedHtml = rawHtml
            .replaceAll("\\/", "/")
            .replaceAll("&amp;", "&")
            .replaceAll("\\u0026", "&")
            .replaceAll("\\u003d", "=")
            .replaceAll("\\u003f", "?");

        // Extract Title / OG Title
        let ogTitle = "";
        const titleMatch =
            unescapedHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
            unescapedHtml.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            ogTitle = titleMatch[1].replace(/ - Facebook$/, "").trim();
        }

        // Regex for extracting high-res Facebook CDN image URLs
        const fbcdnRegex = /https?:\/\/[a-zA-Z0-9.-]*fbcdn\.net\/[^\s"'\<\>\\]+|https?:\/\/[a-zA-Z0-9.-]*fbsbx\.com\/[^\s"'\<\>\\]+/gi;

        const matches = unescapedHtml.match(fbcdnRegex) || [];

        // Check og:image meta tags explicitly
        const ogImageMatches = Array.from(
            unescapedHtml.matchAll(/<meta\s+property="og:image"\s+content="([^"]+)"/gi)
        ).map((m) => m[1]);

        const rawUrls = [...ogImageMatches, ...matches];

        // Clean & Filter extracted URLs
        const validUrls: string[] = [];
        const seenIds = new Set<string>();

        for (let imgUrl of rawUrls) {
            // Clean trailing quotes, JSON brackets, backslashes
            imgUrl = imgUrl
                .replaceAll("\\/", "/")
                .replaceAll("&amp;", "&")
                .replaceAll("\\u0026", "&")
                .split(/["'\s<>\\]/)[0];

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
                imgUrl.includes(".png?")
            ) {
                continue;
            }

            // Extract a unique identifier from Facebook URL
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
                error: "No high-resolution images found on the provided Facebook link. Ensure the post is public and contains photos, or paste image URLs directly in Option B.",
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
