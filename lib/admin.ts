import { User } from "firebase/auth";
import { ClientProfile } from "./contexts/AuthContext";

const adminEmailsStr = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@snapverse.com,snapverse.info@gmail.com,tharinduakalanka930@gmail.com,tharindu.akalanka@example.com";
const adminEmails = adminEmailsStr.split(",").map(e => e.trim().toLowerCase());

export function checkIsAdmin(user: User | null, profile: ClientProfile | null): boolean {
    if (!user) return false;
    
    // Check if user's email is in the admin list
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        return true;
    }
    
    // Check if the user profile role is set to admin in Firestore
    if (profile && (profile as any).role === "admin") {
        return true;
    }
    
    return false;
}
