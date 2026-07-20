"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { checkIsAdmin } from "@/lib/admin";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
    Trash2, Plus, UploadCloud, Check, LogOut, Eye, 
    BookOpen, Calendar, MapPin, Image as ImageIcon, AlertTriangle, Loader2, X,
    Copy, Link as LinkIcon, Lock, Globe, Folder
} from "lucide-react";
import { Album, Image as AlbumImage, albums as staticAlbums } from "@/data/albums";
import { getDbAlbums, saveDbAlbum, deleteDbAlbum, updateDbAlbumVisibility } from "@/lib/db-albums";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const categories = ["Wedding", "Engagement", "Pre-shoot", "Events", "Commercial", "Birthday", "Graduation"];

interface UploadingImage {
    id: string;
    file: File;
    progress: number;
    status: "waiting" | "uploading" | "done" | "failed";
    url?: string;
    width: number;
    height: number;
}

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            resolve({ width: 1200, height: 800 });
        };
    });
};

export default function AdminPage() {
    const { user, profile, signInWithEmail, loginWithGoogle, logout, loading: authLoading } = useAuth();
    
    // Auth Form State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [authSubmitting, setAuthSubmitting] = useState(false);

    // Dashboard State
    const [activeTab, setActiveTab] = useState<"list" | "create">("list");
    const [dbAlbums, setDbAlbums] = useState<Album[]>([]);
    const [loadingAlbums, setLoadingAlbums] = useState(true);

    // Album Creation Form State
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [category, setCategory] = useState<Album["category"]>("Wedding");
    const [location, setLocation] = useState("");
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
    
    // Copy Link Feedback
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    // Cover Image State
    const [coverType, setCoverType] = useState<"upload" | "url">("upload");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverUrl, setCoverUrl] = useState("");
    const [coverUploadProgress, setCoverUploadProgress] = useState(-1);
    
    // Gallery Images State
    const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
    const [externalUrlsText, setExternalUrlsText] = useState("");
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    // Google Drive Importer State
    const [gdriveUrl, setGdriveUrl] = useState("");
    const [gdriveLoading, setGdriveLoading] = useState(false);
    const [gdriveError, setGdriveError] = useState("");
    const [gdriveSuccess, setGdriveSuccess] = useState("");

    // Facebook Importer State
    const [fbUrl, setFbUrl] = useState("");
    const [fbLoading, setFbLoading] = useState(false);
    const [fbError, setFbError] = useState("");
    const [fbSuccess, setFbSuccess] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Toggle Shoot Visibility Handler
    const handleToggleVisibility = async (albumSlug: string, currentVisibility?: "public" | "unlisted") => {
        const newVis = currentVisibility === "unlisted" ? "public" : "unlisted";
        try {
            await updateDbAlbumVisibility(albumSlug, newVis);
            setDbAlbums(prev => prev.map(a => a.slug === albumSlug ? { ...a, visibility: newVis } : a));
        } catch (err) {
            console.error("Failed to toggle visibility:", err);
            alert("Failed to update visibility.");
        }
    };

    // Handle Google Drive Folder Extraction
    const handleFetchGDriveFolder = async () => {
        if (!gdriveUrl.trim()) {
            setGdriveError("Please enter a Google Drive folder URL or ID.");
            return;
        }
        setGdriveError("");
        setGdriveSuccess("");
        setGdriveLoading(true);

        try {
            const response = await fetch("/api/fetch-gdrive-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: gdriveUrl.trim() }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to extract photos from Google Drive folder.");
            }

            // Auto-fill title if currently empty
            if (!title && data.title) {
                setTitle(data.title);
            }

            // Auto-set cover image if coverUrl is currently empty
            if (!coverUrl && data.images.length > 0) {
                setCoverType("url");
                setCoverUrl(data.images[0]);
            }

            // Append photos to externalUrlsText
            const newUrls = data.images.join("\n");
            setExternalUrlsText((prev) => (prev ? prev + "\n" + newUrls : newUrls));

            setGdriveSuccess(`Extracted ${data.count} high-resolution photo(s) from Google Drive folder!`);
        } catch (err: any) {
            console.error("Google Drive import error:", err);
            setGdriveError(err.message || "Could not fetch photos from Google Drive folder.");
        } finally {
            setGdriveLoading(false);
        }
    };

    // Copy direct shoot link to clipboard
    const handleCopyDirectLink = (albumSlug: string) => {
        const fullUrl = `${window.location.origin}/portfolio/${albumSlug}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedSlug(albumSlug);
        setTimeout(() => setCopiedSlug(null), 2500);
    };

    // Handle Facebook Post Extraction
    const handleFetchFacebookPost = async () => {
        if (!fbUrl.trim()) {
            setFbError("Please enter a Facebook post or album URL.");
            return;
        }
        setFbError("");
        setFbSuccess("");
        setFbLoading(true);

        try {
            const response = await fetch("/api/fetch-fb-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: fbUrl.trim() }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to extract photos from Facebook link.");
            }

            // Clean URLs
            const cleanImages = data.images.map((img: string) => 
                img.replaceAll("&amp;", "&").replaceAll("\\u0026", "&").trim()
            );

            // Auto-fill title if currently empty
            if (!title && data.title) {
                setTitle(data.title);
            }

            // Auto-set cover image if coverUrl is currently empty
            if (!coverUrl && cleanImages.length > 0) {
                setCoverType("url");
                setCoverUrl(cleanImages[0]);
            }

            // Append photos to externalUrlsText
            const newUrls = cleanImages.join("\n");
            setExternalUrlsText((prev) => (prev ? prev + "\n" + newUrls : newUrls));

            setFbSuccess(`Extracted ${data.count} high-resolution photo(s) from Facebook!`);
        } catch (err: any) {
            console.error("Facebook import error:", err);
            setFbError(err.message || "Could not fetch photos from Facebook link.");
        } finally {
            setFbLoading(false);
        }
    };


    // Fetch Custom Albums
    const loadAlbums = async () => {
        setLoadingAlbums(true);
        try {
            const albums = await getDbAlbums();
            setDbAlbums(albums);
        } catch (err) {
            console.error("Error loading custom albums:", err);
        } finally {
            setLoadingAlbums(false);
        }
    };

    useEffect(() => {
        if (user && checkIsAdmin(user, profile)) {
            loadAlbums();
        }
    }, [user, profile]);

    // Auto-generate slug from Title
    useEffect(() => {
        if (title) {
            const generatedSlug = title
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            setSlug(generatedSlug);
        }
    }, [title]);

    // Handle Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        setAuthSubmitting(true);
        try {
            await signInWithEmail(loginEmail, loginPassword);
        } catch (err: any) {
            console.error("Login failed:", err);
            setAuthError(err.message || "Invalid credentials.");
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setAuthError("");
        setAuthSubmitting(true);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Google sign in failed:", err);
            setAuthError(err.message || "Failed to log in with Google.");
        } finally {
            setAuthSubmitting(false);
        }
    };

    // Handle File Selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const filesArray = Array.from(e.target.files);
        
        const newImages: UploadingImage[] = [];
        for (const file of filesArray) {
            const dims = await getImageDimensions(file);
            newImages.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                progress: 0,
                status: "waiting",
                width: dims.width,
                height: dims.height,
            });
        }
        
        setUploadingImages(prev => [...prev, ...newImages]);
    };

    // Remove file from list
    const removeUploadingImage = (id: string) => {
        setUploadingImages(prev => prev.filter(img => img.id !== id));
    };

    // Trigger Upload for single file
    const uploadSingleImage = (
        img: UploadingImage,
        albumSlug: string
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!storage) {
                reject(new Error("Storage not configured"));
                return;
            }

            // Mark status as uploading
            setUploadingImages(prev =>
                prev.map(item =>
                    item.id === img.id
                        ? { ...item, status: "uploading", progress: 0 }
                        : item
                )
            );

            const storageRef = ref(storage, `albums/${albumSlug}/${Date.now()}_${img.file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, img.file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setUploadingImages(prev =>
                        prev.map(item =>
                            item.id === img.id ? { ...item, progress } : item
                        )
                    );
                },
                (error) => {
                    console.error("File upload error:", error);
                    setUploadingImages(prev =>
                        prev.map(item =>
                            item.id === img.id ? { ...item, status: "failed" } : item
                        )
                    );
                    reject(error);
                },
                async () => {
                    try {
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploadingImages(prev =>
                            prev.map(item =>
                                item.id === img.id
                                    ? { ...item, status: "done", url: downloadUrl }
                                    : item
                            )
                        );
                        resolve(downloadUrl);
                    } catch (err) {
                        reject(err);
                    }
                }
            );
        });
    };

    // Delete Album Handler
    const handleDeleteAlbum = async (albumSlug: string) => {
        if (!confirm(`Are you sure you want to delete the shoot "${albumSlug}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteDbAlbum(albumSlug);
            setDbAlbums(prev => prev.filter(a => a.slug !== albumSlug));
        } catch (err) {
            console.error("Failed to delete album:", err);
            alert("Failed to delete album. Check console for details.");
        }
    };

    // Save Album Handler
    const handleSaveAlbum = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormSuccess("");
        
        if (!title.trim() || !slug.trim()) {
            setFormError("Title and Slug are required.");
            return;
        }

        // Validate slug unique among static and dynamic
        const isStaticSlug = staticAlbums.some(a => a.slug === slug);
        const isDbSlug = dbAlbums.some(a => a.slug === slug);
        if (isStaticSlug || isDbSlug) {
            setFormError("A shoot with this slug/url already exists. Please choose a different title or slug.");
            return;
        }

        setSaving(true);

        try {
            let finalCoverUrl = coverUrl.replaceAll("&amp;", "&").replaceAll("\\u0026", "&").trim();

            // 1. Upload Cover Image if type is upload and cover file is selected
            if (coverType === "upload" && coverFile) {
                if (!storage) throw new Error("Firebase Storage is not initialized.");
                setCoverUploadProgress(10);
                
                const coverStorageRef = ref(storage, `albums/${slug}/cover_${Date.now()}_${coverFile.name}`);
                const uploadTask = uploadBytesResumable(coverStorageRef, coverFile);

                const uploadPromise = new Promise<string>((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = Math.round(
                                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                            );
                            setCoverUploadProgress(progress);
                        },
                        (err) => reject(err),
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(url);
                        }
                    );
                });
                finalCoverUrl = await uploadPromise;
            }

            if (!finalCoverUrl) {
                throw new Error("Cover image is required. Please upload an image or paste a cover URL.");
            }

            // 2. Upload Gallery Files
            const uploadedUrls: { url: string; width: number; height: number; filename: string }[] = [];
            const filesToUpload = uploadingImages.filter(img => img.status !== "done");

            for (const img of filesToUpload) {
                const url = await uploadSingleImage(img, slug);
                uploadedUrls.push({
                    url,
                    width: img.width,
                    height: img.height,
                    filename: img.file.name
                });
            }

            // Map already uploaded files to image format
            const existingUploaded = uploadingImages
                .filter(img => img.status === "done" && img.url)
                .map(img => ({
                    url: img.url!,
                    width: img.width,
                    height: img.height,
                    filename: img.file.name
                }));

            const allUploadedImages = [...existingUploaded, ...uploadedUrls];

            // 3. Process External URLs Text (with auto line-wrap stitching & sanitization)
            const rawLines = externalUrlsText.split("\n");
            const cleanedUrls: string[] = [];
            let currentUrl = "";

            for (let line of rawLines) {
                line = line.trim();
                if (!line) continue;
                if (line.startsWith("http://") || line.startsWith("https://")) {
                    if (currentUrl) cleanedUrls.push(currentUrl);
                    currentUrl = line;
                } else if (currentUrl) {
                    // Append line-wrapped URL fragment
                    currentUrl += line;
                }
            }
            if (currentUrl) cleanedUrls.push(currentUrl);

            const pastedUrls = cleanedUrls
                .map(u => u.replaceAll("&amp;", "&").replaceAll("\\u0026", "&").trim())
                .filter(u => u.startsWith("http://") || u.startsWith("https://"))
                .map((url, idx) => ({
                    id: `ext-${idx + 1}-${Date.now()}`,
                    src: url,
                    alt: `${title} - external photo ${idx + 1}`,
                    width: 1200, // fallback dimensions
                    height: 800,
                }));

            // 4. Combine all images
            const imagesList: AlbumImage[] = [
                ...allUploadedImages.map((img, idx) => ({
                    id: `uploaded-${idx + 1}-${Date.now()}`,
                    src: img.url,
                    alt: `${title} - photo ${idx + 1}`,
                    width: img.width,
                    height: img.height
                })),
                ...pastedUrls
            ];

            if (imagesList.length === 0) {
                throw new Error("At least one image must be uploaded or pasted.");
            }

            // 5. Construct Album Object
            const newAlbum: Album = {
                slug,
                title: title.trim(),
                category,
                location: location.trim() || "Sri Lanka",
                year: year.trim() || new Date().getFullYear().toString(),
                coverImage: finalCoverUrl,
                description: description.trim() || `Visual stories captured from the ${title} shoot.`,
                images: imagesList,
                visibility: visibility,
            };

            // 6. Save to Firestore
            await saveDbAlbum(newAlbum);

            setFormSuccess(`Shoot "${title}" has been posted successfully!`);
            
            // Clear Form
            setTitle("");
            setSlug("");
            setCategory("Wedding");
            setLocation("");
            setYear(new Date().getFullYear().toString());
            setDescription("");
            setVisibility("public");
            setCoverFile(null);
            setCoverUrl("");
            setCoverUploadProgress(-1);
            setUploadingImages([]);
            setExternalUrlsText("");
            setGdriveUrl("");
            setGdriveSuccess("");
            setFbUrl("");
            setFbSuccess("");
            
            if (coverInputRef.current) coverInputRef.current.value = "";
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Refresh list & redirect to list
            loadAlbums();
            setActiveTab("list");
        } catch (err: any) {
            console.error("Failed to save shoot:", err);
            setFormError(err.message || "Failed to save shoot. Check Firestore configurations.");
        } finally {
            setSaving(false);
            setCoverUploadProgress(-1);
        }
    };

    const isAdmin = checkIsAdmin(user, profile);

    // LOADING AUTH STATE
    if (authLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0B] text-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C] mb-4" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                    Verifying Authentication...
                </span>
            </div>
        );
    }

    // LOGIN SCREEN
    if (!user) {
        return (
            <>
                <Navbar />
                <main className="flex-1 bg-[#0B0B0B] text-white py-32 flex items-center justify-center min-h-[85vh]">
                    <Container>
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <h1 className="font-sans text-3xl font-bold uppercase tracking-widest text-white mb-2">
                                    Admin Portal
                                </h1>
                                <p className="text-xs text-[#A1A1A1] tracking-wide uppercase">
                                    SnapVerse Manager Login
                                </p>
                            </div>

                            <Card className="bg-[#141414] border-white/5 shadow-2xl p-6">
                                <form onSubmit={handleLogin} className="space-y-6">
                                    {authError && (
                                        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <span>{authError}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                            Admin Email Address
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="admin@snapverse.com"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                            Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            required
                                            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 py-6"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={authSubmitting}
                                        className="w-full bg-[#C9A84C] hover:bg-[#e2c47a] text-black font-bold uppercase tracking-[0.2em] py-6 text-xs transition-colors duration-300 disabled:opacity-50"
                                    >
                                        {authSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                        ) : (
                                            "Log In to Dashboard"
                                        )}
                                    </Button>
                                </form>

                                <div className="relative my-8 text-center">
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                                    <span className="relative bg-[#141414] px-4 text-[9px] uppercase font-bold tracking-widest text-[#A1A1A1]">
                                        Or Connect With
                                    </span>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={authSubmitting}
                                    className="w-full flex items-center justify-center gap-3 border border-white/15 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-[0.2em] py-4 text-xs transition-colors duration-300 disabled:opacity-50 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white"
                                >
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                    </svg>
                                    Google Account
                                </button>
                            </Card>
                        </div>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    // UNAUTHORIZED ROLE
    if (!isAdmin) {
        return (
            <>
                <Navbar />
                <main className="flex-1 bg-[#0B0B0B] text-white py-32 flex items-center justify-center min-h-[85vh]">
                    <Container>
                        <div className="max-w-md mx-auto text-center">
                            <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-6" />
                            <h1 className="font-sans text-2xl font-bold uppercase tracking-widest text-white mb-4">
                                Access Denied
                            </h1>
                            <p className="text-sm text-[#A1A1A1] leading-relaxed mb-8">
                                Account <strong>{user.email}</strong> is not configured as an administrator. Please log out and sign in with an administrator account.
                            </p>
                            <Button
                                onClick={() => logout()}
                                className="bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest px-8 py-4 text-xs rounded-full"
                            >
                                <LogOut className="h-4 w-4 mr-2 inline" />
                                Sign Out
                            </Button>
                        </div>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    // ADMIN DASHBOARD
    return (
        <>
            <Navbar />
            <main className="flex-1 bg-[#0B0B0B] text-white pt-32 pb-24">
                <Container>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="font-sans text-4xl font-bold uppercase tracking-tight text-white">
                                    Dashboard
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shadow-sm animate-pulse">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                    Drive Auto-Sync Active
                                </span>
                            </div>
                            <p className="mt-2 text-xs text-[#A1A1A1] tracking-wider uppercase">
                                Logged in as: <span className="text-white font-semibold">{user.email}</span>
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => logout()}
                            className="bg-[#1A1A1A] text-white border border-white/10 hover:bg-white hover:text-black flex items-center gap-2 py-4 h-auto text-xs font-bold uppercase tracking-widest"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Card className="bg-[#141414] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1]">Total Albums</CardTitle>
                                <BookOpen className="h-4 w-4 text-[#C9A84C]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold uppercase">{staticAlbums.length + dbAlbums.length}</div>
                                <p className="text-[10px] text-[#A1A1A1] mt-1 uppercase">
                                    {staticAlbums.length} static • {dbAlbums.length} dynamic
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#141414] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1]">Custom Shoots</CardTitle>
                                <ImageIcon className="h-4 w-4 text-[#C9A84C]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold uppercase">{dbAlbums.length}</div>
                                <p className="text-[10px] text-[#A1A1A1] mt-1 uppercase">Uploaded via Admin Portal</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#141414] border-white/5">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#A1A1A1]">Total Custom Images</CardTitle>
                                <UploadCloud className="h-4 w-4 text-[#C9A84C]" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold uppercase">
                                    {dbAlbums.reduce((acc, a) => acc + (a.images?.length || 0), 0)}
                                </div>
                                <p className="text-[10px] text-[#A1A1A1] mt-1 uppercase">Hosted in Firestore / Storage</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/5 mb-8 gap-6">
                        <button
                            onClick={() => setActiveTab("list")}
                            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                                activeTab === "list"
                                    ? "border-[#C9A84C] text-[#C9A84C]"
                                    : "border-transparent text-[#A1A1A1] hover:text-white"
                            }`}
                        >
                            Shoots List ({dbAlbums.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("create")}
                            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                                activeTab === "create"
                                    ? "border-[#C9A84C] text-[#C9A84C]"
                                    : "border-transparent text-[#A1A1A1] hover:text-white"
                            }`}
                        >
                            + Post New Shoot
                        </button>
                    </div>

                    {/* Tab: LIST DYNAMIC SHOOTS */}
                    {activeTab === "list" && (
                        <div>
                            {loadingAlbums ? (
                                <div className="py-24 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-[#C9A84C] mx-auto mb-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#A1A1A1]">
                                        Loading custom shoots...
                                    </span>
                                </div>
                            ) : dbAlbums.length === 0 ? (
                                <Card className="bg-[#141414] border-white/5 border-dashed py-16 text-center">
                                    <ImageIcon className="h-12 w-12 text-[#A1A1A1]/30 mx-auto mb-4" />
                                    <h3 className="font-sans text-lg font-bold uppercase text-white mb-2">No Custom Shoots Posted</h3>
                                    <p className="text-xs text-[#A1A1A1] mb-6 max-w-sm mx-auto">
                                        All your default portfolio items are pre-loaded. Any shoots you post through this admin dashboard will appear here.
                                    </p>
                                    <Button
                                        onClick={() => setActiveTab("create")}
                                        className="bg-[#C9A84C] hover:bg-[#e2c47a] text-black font-bold uppercase tracking-widest py-4 text-xs"
                                    >
                                        Post Your First Shoot
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {dbAlbums.map((album) => (
                                        <Card key={album.slug} className="bg-[#141414] border-white/5 overflow-hidden flex flex-col group">
                                            {/* Image container */}
                                            <div className="relative aspect-[3/2] overflow-hidden bg-black/40 border-b border-white/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={album.coverImage} 
                                                    alt={album.title} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    <span className="bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C9A84C]">
                                                        {album.category}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleVisibility(album.slug, album.visibility)}
                                                        className="outline-none focus:ring-1 focus:ring-white rounded cursor-pointer transition-transform active:scale-95"
                                                        title="Click to toggle Public / Link Only (Unlisted)"
                                                    >
                                                        {album.visibility === "unlisted" ? (
                                                            <span className="bg-purple-950/80 hover:bg-purple-900/90 backdrop-blur-md border border-purple-500/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                                                                <Lock className="h-3 w-3" />
                                                                Link Only
                                                            </span>
                                                        ) : (
                                                            <span className="bg-emerald-950/80 hover:bg-emerald-900/90 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                                                                <Globe className="h-3 w-3" />
                                                                Public
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-sans text-lg font-bold uppercase tracking-wide text-white line-clamp-1 mb-2">
                                                        {album.title}
                                                    </h3>
                                                    
                                                    <div className="space-y-2 mb-4 text-[10px] uppercase font-semibold text-[#A1A1A1]">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C9A84C]" />
                                                            <span>{album.location}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#C9A84C]" />
                                                            <span>Year {album.year}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[#C9A84C]" />
                                                            <span>{album.images?.length || 0} Photos</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-[10px] font-bold uppercase tracking-widest">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyDirectLink(album.slug)}
                                                        className="text-[#A1A1A1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                                                        title="Copy Direct Shoot Link"
                                                    >
                                                        {copiedSlug === album.slug ? (
                                                            <>
                                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                                <span className="text-emerald-400">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3.5 w-3.5" />
                                                                <span>Copy Link</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <a 
                                                        href={`/portfolio/${album.slug}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="text-[#C9A84C] hover:text-[#e2c47a] transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        View
                                                    </a>
                                                    
                                                    <button
                                                        onClick={() => handleDeleteAlbum(album.slug)}
                                                        className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: POST NEW SHOOT */}
                    {activeTab === "create" && (
                        <Card className="bg-[#141414] border-white/5 p-6 lg:p-8 max-w-4xl mx-auto">
                            <CardHeader className="p-0 mb-8 border-b border-white/5 pb-4">
                                <CardTitle className="font-sans text-2xl font-bold uppercase tracking-wider text-white">Post a New Shoot</CardTitle>
                                <CardDescription className="text-xs text-[#A1A1A1] uppercase tracking-wider mt-1">
                                    Fill in details and upload images to post instantly to the portfolio
                                </CardDescription>
                            </CardHeader>

                            <form onSubmit={handleSaveAlbum} className="space-y-8">
                                {formError && (
                                    <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider rounded uppercase flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>{formError}</span>
                                    </div>
                                )}
                                {formSuccess && (
                                    <div className="p-4 bg-green-950/40 border border-green-500/20 text-green-400 text-xs font-semibold tracking-wider rounded uppercase flex items-center gap-2">
                                        <Check className="h-4 w-4 shrink-0" />
                                        <span>{formSuccess}</span>
                                    </div>
                                )}

                                {/* Google Drive Importer Quick Tool */}
                                <div className="bg-[#1C1C1C] border border-[#C9A84C]/40 rounded-xl p-6 mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Folder className="h-5 w-5 text-[#C9A84C]" />
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-white">Import Photos from Google Drive Folder</h3>
                                    </div>
                                    <p className="text-xs text-[#A1A1A1] leading-relaxed mb-4">
                                        Paste any public Google Drive folder URL (e.g., <code className="text-[#C9A84C] font-mono">Google Drive/Snapverse/[ShootName]/WebPublish</code>) to instantly import all high-resolution photos into your shoot!
                                    </p>

                                    {gdriveError && (
                                        <div className="p-3 mb-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold rounded uppercase flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <span>{gdriveError}</span>
                                        </div>
                                    )}
                                    {gdriveSuccess && (
                                        <div className="p-3 mb-4 bg-green-950/40 border border-green-500/20 text-green-400 text-xs font-semibold rounded uppercase flex items-center gap-2">
                                            <Check className="h-4 w-4 shrink-0" />
                                            <span>{gdriveSuccess}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Input
                                            type="url"
                                            placeholder="https://drive.google.com/drive/folders/1A2B3C... or folder link"
                                            value={gdriveUrl}
                                            onChange={(e) => setGdriveUrl(e.target.value)}
                                            disabled={gdriveLoading || saving}
                                            className="border-white/10 bg-black/40 text-white focus-visible:ring-[#C9A84C] placeholder:text-[#A1A1A1]/40 flex-1 font-mono text-xs"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleFetchGDriveFolder}
                                            disabled={gdriveLoading || saving}
                                            className="bg-[#C9A84C] hover:bg-[#e2c47a] text-black font-bold uppercase tracking-wider text-xs py-3 px-6 shrink-0 transition-colors"
                                        >
                                            {gdriveLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Fetching Drive Photos...
                                                </span>
                                            ) : (
                                                "Extract Drive Photos"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Facebook Importer Quick Tool */}
                                <div className="bg-[#1C1C1C] border border-[#C9A84C]/30 rounded-xl p-6 mb-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl">📘</span>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-white">Import Photos from Facebook Post</h3>
                                    </div>
                                    <p className="text-xs text-[#A1A1A1] leading-relaxed mb-4">
                                        Paste any public Facebook post URL to automatically extract all high-resolution photos and auto-fill your shoot gallery!
                                    </p>

                                    {fbError && (
                                        <div className="p-3 mb-4 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-semibold rounded uppercase flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 shrink-0" />
                                            <span>{fbError}</span>
                                        </div>
                                    )}
                                    {fbSuccess && (
                                        <div className="p-3 mb-4 bg-green-950/40 border border-green-500/20 text-green-400 text-xs font-semibold rounded uppercase flex items-center gap-2">
                                            <Check className="h-4 w-4 shrink-0" />
                                            <span>{fbSuccess}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Input
                                            type="url"
                                            placeholder="https://www.facebook.com/permalink.php?story_fbid=... or post link"
                                            value={fbUrl}
                                            onChange={(e) => setFbUrl(e.target.value)}
                                            disabled={fbLoading || saving}
                                            className="border-white/10 bg-black/40 text-white focus-visible:ring-[#C9A84C] placeholder:text-[#A1A1A1]/40 flex-1 font-mono text-xs"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleFetchFacebookPost}
                                            disabled={fbLoading || saving}
                                            className="bg-[#C9A84C] hover:bg-[#e2c47a] text-black font-bold uppercase tracking-wider text-xs py-3 px-6 shrink-0 transition-colors"
                                        >
                                            {fbLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Fetching Photos...
                                                </span>
                                            ) : (
                                                "Extract Photos"
                                            )}
                                        </Button>
                                    </div>
                                </div>


                                {/* Main details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                            Shoot Title *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="E.g., Nuwan & Dulmi Wedding"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                            disabled={saving}
                                            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                            URL Slug (Auto-generated) *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="nuwan-dulmi-wedding"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                            required
                                            disabled={saving}
                                            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 font-mono text-xs"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as Album["category"])}
                                            disabled={saving}
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                                Location
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="Sri Lanka"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                disabled={saving}
                                                className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                                Year
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="2026"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                disabled={saving}
                                                className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shoot Visibility Control */}
                                <div className="bg-[#181818] border border-white/10 rounded-xl p-5">
                                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] mb-3">
                                        Shoot Visibility & Access Setting *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setVisibility("public")}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                visibility === "public"
                                                    ? "bg-white/10 border-white text-white shadow-lg"
                                                    : "bg-black/30 border-white/5 text-[#A1A1A1] hover:border-white/20"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Globe className="h-4 w-4 text-[#C9A84C]" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-white">Public</span>
                                            </div>
                                            <p className="text-[10px] text-[#A1A1A1] leading-relaxed">
                                                Appears on the main Our Works portfolio page grid and category listings for everyone.
                                            </p>
                                        </div>

                                        <div 
                                            onClick={() => setVisibility("unlisted")}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                visibility === "unlisted"
                                                    ? "bg-purple-950/40 border-purple-500 text-white shadow-lg"
                                                    : "bg-black/30 border-white/5 text-[#A1A1A1] hover:border-white/20"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Lock className="h-4 w-4 text-purple-400" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-white">Only Visible via Link (Unlisted)</span>
                                            </div>
                                            <p className="text-[10px] text-[#A1A1A1] leading-relaxed">
                                                Hidden from the website listing. Accessible ONLY to clients who have the direct shoot link!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1] mb-2">
                                        Shoot Description
                                    </label>
                                    <Textarea
                                        placeholder="Add a detailed description about the couple, location details, visual theme, or special elements..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={saving}
                                        className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 min-h-[100px]"
                                    />
                                </div>

                                {/* Cover Image Segment */}
                                <div className="border-t border-white/5 pt-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">Cover Image *</h3>
                                    <div className="flex gap-4 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setCoverType("upload")}
                                            className={`px-4 py-2 text-[9px] font-bold uppercase tracking-wider border rounded-full transition-colors ${
                                                coverType === "upload" 
                                                    ? "bg-white text-black border-white" 
                                                    : "bg-transparent text-[#A1A1A1] border-white/10 hover:text-white"
                                            }`}
                                        >
                                            Upload Cover
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCoverType("url")}
                                            className={`px-4 py-2 text-[9px] font-bold uppercase tracking-wider border rounded-full transition-colors ${
                                                coverType === "url" 
                                                    ? "bg-white text-black border-white" 
                                                    : "bg-transparent text-[#A1A1A1] border-white/10 hover:text-white"
                                            }`}
                                        >
                                            Paste Cover URL
                                        </button>
                                    </div>

                                    {coverType === "upload" ? (
                                        <div>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                ref={coverInputRef}
                                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                                disabled={saving}
                                                className="hidden"
                                            />
                                            <div 
                                                onClick={() => !saving && coverInputRef.current?.click()}
                                                className="border border-dashed border-white/10 rounded-lg p-6 hover:bg-white/5 transition-colors cursor-pointer text-center flex flex-col items-center justify-center min-h-[140px]"
                                            >
                                                {coverFile ? (
                                                    <div className="flex flex-col items-center">
                                                        <ImageIcon className="h-8 w-8 text-[#C9A84C] mb-2" />
                                                        <span className="text-xs text-white line-clamp-1">{coverFile.name}</span>
                                                        <span className="text-[10px] text-[#A1A1A1] mt-1 uppercase">Click to change file</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <UploadCloud className="h-8 w-8 text-[#A1A1A1]/40 mb-2" />
                                                        <span className="text-xs font-semibold text-white">Click to upload cover photo</span>
                                                        <span className="text-[10px] text-[#A1A1A1] mt-1 uppercase">WebP or JPEG recommended</span>
                                                    </div>
                                                )}
                                            </div>
                                            {coverUploadProgress >= 0 && (
                                                <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#C9A84C] transition-all" style={{ width: `${coverUploadProgress}%` }}></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Input
                                            type="url"
                                            placeholder="https://facebook.com/.../cover.jpg"
                                            value={coverUrl}
                                            onChange={(e) => setCoverUrl(e.target.value)}
                                            disabled={saving}
                                            className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30"
                                        />
                                    )}
                                </div>

                                {/* Gallery Images Segment */}
                                <div className="border-t border-white/5 pt-6">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">Gallery Images *</h3>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Option A: Upload files */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1]">Option A: Upload Local Files</h4>
                                            <input 
                                                type="file" 
                                                multiple
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                disabled={saving}
                                                className="hidden"
                                            />
                                            <div 
                                                onClick={() => !saving && fileInputRef.current?.click()}
                                                className="border border-dashed border-white/10 rounded-lg p-6 hover:bg-white/5 transition-colors cursor-pointer text-center flex flex-col items-center justify-center min-h-[160px]"
                                            >
                                                <UploadCloud className="h-10 w-10 text-[#A1A1A1]/40 mb-2" />
                                                <span className="text-xs font-semibold text-white">Select multiple images</span>
                                                <span className="text-[10px] text-[#A1A1A1] mt-1 uppercase">Drag and drop supported</span>
                                            </div>

                                            {/* File upload list with progress */}
                                            {uploadingImages.length > 0 && (
                                                <div className="border border-white/5 rounded-lg max-h-[300px] overflow-y-auto divide-y divide-white/5">
                                                    {uploadingImages.map((img) => (
                                                        <div key={img.id} className="p-3 flex items-center justify-between text-xs gap-3">
                                                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                                <ImageIcon className="h-4 w-4 shrink-0 text-[#C9A84C]" />
                                                                <span className="truncate text-white max-w-[200px]">{img.file.name}</span>
                                                                <span className="text-[9px] text-[#A1A1A1] shrink-0 font-mono">({img.width}x{img.height})</span>
                                                            </div>

                                                            <div className="flex items-center gap-3 shrink-0">
                                                                {img.status === "uploading" && (
                                                                    <div className="text-[#C9A84C] font-semibold font-mono text-[10px]">{img.progress}%</div>
                                                                )}
                                                                {img.status === "done" && (
                                                                    <Check className="h-4 w-4 text-green-500" />
                                                                )}
                                                                {img.status === "failed" && (
                                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                                )}
                                                                {img.status === "waiting" && (
                                                                    <span className="text-[9px] bg-white/5 text-[#A1A1A1] px-1.5 py-0.5 uppercase tracking-wider rounded">Waiting</span>
                                                                )}
                                                                
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeUploadingImage(img.id)}
                                                                    disabled={saving}
                                                                    className="text-[#A1A1A1] hover:text-red-500 transition-colors"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Option B: External URLs */}
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1A1]">Option B: Paste External URLs</h4>
                                            <label className="block text-[9px] uppercase font-semibold text-[#A1A1A1]">
                                                Enter one image URL per line (from Facebook, Instagram, or direct links)
                                            </label>
                                            <Textarea
                                                placeholder="https://facebook.com/.../photo1.jpg&#10;https://facebook.com/.../photo2.jpg"
                                                value={externalUrlsText}
                                                onChange={(e) => setExternalUrlsText(e.target.value)}
                                                disabled={saving}
                                                className="border-white/10 bg-transparent text-white focus-visible:ring-white placeholder:text-[#A1A1A1]/30 font-mono text-xs leading-relaxed min-h-[160px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Panel */}
                                <div className="border-t border-white/5 pt-8 flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={saving}
                                        onClick={() => {
                                            if (confirm("Discard all changes?")) {
                                                setActiveTab("list");
                                            }
                                        }}
                                        className="border border-white/10 bg-transparent hover:bg-white/5 text-white font-bold uppercase tracking-widest py-6 h-auto text-xs px-8"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-[#C9A84C] hover:bg-[#e2c47a] text-black font-bold uppercase tracking-widest py-6 h-auto text-xs px-12"
                                    >
                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Uploading & Posting...
                                            </span>
                                        ) : (
                                            "Post Shoot to Web"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}
                </Container>
            </main>
            <Footer />
        </>
    );
}
