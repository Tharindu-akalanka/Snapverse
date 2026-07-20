"use client";

import { useEffect, useRef } from "react";

export function DriveAutoSyncListener() {
    const isSyncingRef = useRef(false);

    const triggerSync = async () => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;

        try {
            const res = await fetch("/api/auto-sync-drive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success && data.syncedCount > 0) {
                console.log(`[DriveAutoSync] Auto-synced ${data.syncedCount} new shoot(s):`, data.newlySynced);
                if (typeof window !== "undefined") {
                    window.dispatchEvent(
                        new CustomEvent("snapverse:auto-synced", {
                            detail: data,
                        })
                    );
                }
            }
        } catch (err) {
            console.warn("[DriveAutoSync] Background check error:", err);
        } finally {
            isSyncingRef.current = false;
        }
    };

    useEffect(() => {
        // Initial sync scan on app load
        triggerSync();

        // Background interval check every 60 seconds
        const intervalId = setInterval(triggerSync, 60000);

        return () => clearInterval(intervalId);
    }, []);

    return null;
}
