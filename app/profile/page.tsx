"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Upload, X } from "lucide-react";
import { loadProgress, setUser } from "@/lib/progress";

const AVATAR_EMOJIS = [
  "😊", "😎", "🤓", "🧑‍💻", "👩‍💻", "👨‍💻", "🧑‍🎓", "👩‍🔬", "👨‍🔬", "🧙",
  "🦸", "🧑‍🚀", "🧑‍🏫", "🧑‍🎨", "🕵️",
  "🦊", "🦁", "🐺", "🐻", "🦝", "🐯", "🦄", "🐬", "🦋", "🐉",
  "🦅", "🦉", "🐙", "🦈", "🐼",
  "🌟", "⚡", "🔥", "💫", "🌊", "🌙", "☀️", "🌈", "🍀", "🌸",
  "🚀", "💡", "🎯", "🧠", "💎", "⚙️", "🎮", "🤖", "🔮", "🎲",
];

const MAX_SIZE_BYTES = 20 * 1024;
const AVATAR_PX = 100;

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  avatarEmoji: string | null;
  avatarImage: string | null;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_PX;
      canvas.height = AVATAR_PX;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.max(AVATAR_PX / img.width, AVATAR_PX / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const dx = (AVATAR_PX - sw) / 2;
      const dy = (AVATAR_PX - sh) / 2;
      ctx.drawImage(img, dx, dy, sw, sh);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image.")); };
    img.src = url;
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [username, setUsername] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = loadProgress();
    if (!p.user) { router.push("/"); return; }
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile(data);
          setUsername(data.name || "");
          setSelectedEmoji(data.avatarEmoji || null);
          setAvatarImage(data.avatarImage || null);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/")) { setImageError("Please select an image file (JPG, PNG, GIF, WebP)."); return; }
    try {
      const dataUrl = await resizeImage(file);
      const base64 = dataUrl.split(",")[1] ?? "";
      const bytes = Math.ceil((base64.length * 3) / 4);
      if (bytes > MAX_SIZE_BYTES) { setImageError("Image is still too large after resizing. Try a simpler image."); return; }
      setAvatarImage(dataUrl);
    } catch {
      setImageError("Could not process image. Please try another file.");
    }
  };

  const handleSave = async () => {
    if (!username.trim()) { setError("Username cannot be empty."); return; }
    if (username.trim().length < 2 || username.trim().length > 30) { setError("Username must be 2–30 characters."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username.trim(), avatarEmoji: selectedEmoji, avatarImage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        const p = loadProgress();
        if (p.user) setUser({ ...p.user, name: updated.name || p.user.name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save.");
      }
    } finally { setSaving(false); }
  };

  const displayInitials = (profile?.name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-outline-variant/20 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-label font-medium">
            <ArrowLeft size={15} />
            Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="w-7 h-7 rounded" />
            <span className="font-headline font-bold text-on-surface text-sm hidden sm:block">Profile</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="space-y-6">

          {/* Avatar preview card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
            {/* Header band */}
            <div className="h-20 bg-gradient-to-r from-primary to-primary-container" />
            <div className="px-6 pb-6 -mt-10 flex items-end gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-surface-container-lowest bg-gradient-to-br from-primary to-primary-container flex items-center justify-center overflow-hidden shadow-md flex-shrink-0">
                {avatarImage ? (
                  <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : selectedEmoji ? (
                  <span className="text-3xl">{selectedEmoji}</span>
                ) : (
                  <span className="text-xl font-headline font-black text-on-primary">{displayInitials}</span>
                )}
              </div>
              <div className="pb-1">
                <p className="font-headline font-bold text-on-surface">{profile?.name || "Your Name"}</p>
                <p className="text-on-surface-variant text-sm font-label">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Edit form */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6 space-y-6">

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-sm font-headline font-bold text-on-surface">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                placeholder="Your display name"
                className="w-full px-4 py-3 rounded-md bg-surface-container-low border-b-2 border-outline-variant focus:border-primary outline-none transition-colors text-on-surface placeholder:text-on-surface-variant/40 font-label"
              />
              <p className="text-on-surface-variant/60 text-xs font-label">Shown on forum posts · 2–30 characters</p>
            </div>

            {/* Avatar photo upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-headline font-bold text-on-surface">Profile Photo</label>
                {avatarImage && (
                  <button onClick={() => { setAvatarImage(null); setImageError(""); }}
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-error transition-colors font-label">
                    <X size={12} /> Remove photo
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all text-sm font-label">
                <Upload size={15} />
                {avatarImage ? "Replace photo" : "Upload photo"}
              </button>
              <p className="text-on-surface-variant/60 text-xs font-label">JPG, PNG, GIF, or WebP · Max 20 KB · Resized to 100×100</p>
              {imageError && <p className="text-error text-xs font-label">{imageError}</p>}
            </div>

            {/* Emoji picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-headline font-bold text-on-surface">
                  Avatar Icon <span className="font-normal text-on-surface-variant text-xs">(or pick an emoji)</span>
                </label>
                {selectedEmoji && (
                  <button onClick={() => setSelectedEmoji(null)} className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-label">
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button key={emoji} onClick={() => setSelectedEmoji(emoji === selectedEmoji ? null : emoji)}
                    className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110 ${
                      selectedEmoji === emoji
                        ? "bg-primary/10 ring-2 ring-primary scale-110"
                        : "hover:bg-surface-container"
                    }`}>
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-on-surface-variant/60 text-xs font-label">Photo takes priority · Click to select · Click again to deselect</p>
            </div>

            {error && <p className="text-error text-sm font-label">{error}</p>}

            {/* Save */}
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
               : saved ? <><Check size={16} /> Saved!</>
               : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
