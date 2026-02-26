import { MetadataRoute } from "next";
import { albums } from "@/data/albums";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://snapverse.com"; // Replace with actual domain

    const albumUrls = albums.map((album) => ({
        url: `${baseUrl}/portfolio/${album.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 1,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.8,
        },
        ...albumUrls,
    ];
}
