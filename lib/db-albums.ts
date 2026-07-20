import { db } from "./firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Album } from "@/data/albums";

export async function getDbAlbums(): Promise<Album[]> {
    if (!db) return [];
    try {
        const albumsQuery = query(collection(db, "albums"), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(albumsQuery);
        const albums: Album[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            albums.push({
                slug: data.slug,
                title: data.title,
                category: data.category,
                location: data.location,
                year: data.year,
                coverImage: data.coverImage,
                description: data.description,
                images: data.images || [],
                visibility: data.visibility || "public",
                createdAt: data.createdAt,
            } as Album);
        });
        return albums;
    } catch (error) {
        console.error("Error fetching db albums:", error);
        return [];
    }
}

export async function saveDbAlbum(album: Album & { createdAt?: string }): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized");
    const albumRef = doc(db, "albums", album.slug);
    await setDoc(albumRef, {
        ...album,
        visibility: album.visibility || "public",
        createdAt: album.createdAt || new Date().toISOString(),
    });
}

export async function deleteDbAlbum(slug: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized");
    const albumRef = doc(db, "albums", slug);
    await deleteDoc(albumRef);
}

export async function updateDbAlbumVisibility(slug: string, visibility: "public" | "unlisted"): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized");
    const albumRef = doc(db, "albums", slug);
    await setDoc(albumRef, { visibility }, { merge: true });
}

export function getMergedAlbums(staticAlbums: Album[], dbAlbums: Album[]): Album[] {
    const dbSlugs = new Set(dbAlbums.map(a => a.slug));
    const filteredStatic = staticAlbums.filter(a => !dbSlugs.has(a.slug));
    return [...filteredStatic, ...dbAlbums];
}
