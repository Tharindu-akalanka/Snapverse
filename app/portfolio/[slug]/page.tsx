import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AlbumDetails } from "@/components/features/AlbumDetails";
import { DynamicAlbumLoader } from "@/components/features/DynamicAlbumLoader";
import { albums } from "@/data/albums";

export async function generateStaticParams() {
    return albums.map((album) => ({
        slug: album.slug,
    }));
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const album = albums.find((a) => a.slug === slug);

    if (!album) {
        // Fall back to client-side loading from Firestore
        return <DynamicAlbumLoader slug={slug} />;
    }

    return (
        <>
            <Navbar />
            <AlbumDetails album={album} />
            <Footer />
        </>
    );
}

