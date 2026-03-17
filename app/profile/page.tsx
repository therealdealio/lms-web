"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, Loader2, User, Upload, X } from "lucide-react";
import { loadProgress, setUser } from "@/lib/progress";

const AVATAR_EMOJIS = [
  // People & roles
  "😊", "😎", "🤓", "🧑‍💻", "👩‍💻", "👨‍💻", "🧑‍🎓", "👩‍🔬", "👨‍🔬", "🧙",
  "🦸", "🧑‍🚀", "🧑‍🏫", "🧑‍🎨", "🕵️",
  // Animals
  "🦊", "🦁", "🐺", "🐻", "🦝", "🐯", "🦄", "🐬", "🦋", "🐉",
  "🦅", "🦉", "🐙", "🦈", "🐼",
  // Nature & elements
  "🌟", "⚡", "🔥", "💫", "🌊", "🌙", "☀️", "🌈", "🍀", "🌸",
  // Tech & abstract
  "🚀", "💡", "🎯", "🧠", "💎", "⚙️", "🎮", "🤖", "🔮", "🎲",
];

const MAX_SIZE_BYTES = 20 * 1024; // 20 KB
const AVATAR_PX = 100;

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  avatarEmoji: string | null;
  avatarImage: string | null;
}

/** Resize and center-crop an image file to AVATAR_PX × AVATAR_PX JPEG data URL. */
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

      // Cover crop: scale so the shorter side fills the canvas, then center
      const scale = Math.max(AVATAR_PX / img.width, AVATAR_PX / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const dx = (AVATAR_PX - sw) / 2;
      const dy = (AVATAR_PX - sh) / 2;
      ctx.drawImage(img, dx, dy, sw, sh);

      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    img.src = url;
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
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
    if (!p.user) {
      router.push("/");
      return;
    }

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

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file (JPG, PNG, GIF, WebP).");
      return;
    }

    try {
      const dataUrl = await resizeImage(file);
      // Check final encoded size
      const base64 = dataUrl.split(",")[1] ?? "";
      const bytes = Math.ceil((base64.length * 3) / 4);
      if (bytes > MAX_SIZE_BYTES) {
        setImageError("Image is still too large after resizing. Try a simpler image.");
        return;
      }
      setAvatarImage(dataUrl);
    } catch {
      setImageError("Could not process image. Please try another file.");
    }
  };

  const handleRemoveImage = () => {
    setAvatarImage(null);
    setImageError("");
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (username.trim().length < 2 || username.trim().length > 30) {
      setError("Username must be 2–30 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username.trim(),
          avatarEmoji: selectedEmoji,
          avatarImage: avatarImage,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        const p = loadProgress();
        if (p.user) {
          setUser({ ...p.user, name: updated.name || p.user.name });
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const displayInitials = (profile?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-dark-400 hover:text-dark-100 transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <User className="text-brand-600" size={28} />
          <h1 className="text-2xl font-bold text-dark-50">Edit Profile</h1>
        </div>

        <div className="bg-white border border-dark-700 rounded-2xl p-6 space-y-8">
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md overflow-hidden">
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : selectedEmoji ? (
                <span className="text-4xl">{selectedEmoji}</span>
              ) : (
                <span className="text-2xl font-bold text-white">{displayInitials}</span>
              )}
            </div>
            <p className="text-dark-400 text-sm">{profile?.email}</p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-dark-100">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              placeholder="Your display name"
              className="w-full px-4 py-3 rounded-xl border border-dark-700 bg-dark-950 text-dark-50 text-sm placeholder-dark-500 focus:outline-none focus:border-brand-400"
            />
            <p className="text-dark-500 text-xs">
              Shown on forum posts and replies. 2–30 characters.
            </p>
          </div>

          {/* Avatar photo upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-dark-100">
                Avatar Photo
              </label>
              {avatarImage && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1 text-xs text-dark-400 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                  Remove photo
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-dark-600 text-dark-400 hover:border-brand-400 hover:text-brand-400 transition-all text-sm"
            >
              <Upload size={15} />
              {avatarImage ? "Replace photo" : "Upload photo"}
            </button>

            <p className="text-dark-500 text-xs">
              JPG, PNG, GIF, or WebP · Max 20 KB · Resized to 100×100 px
            </p>

            {imageError && (
              <p className="text-red-500 text-xs">{imageError}</p>
            )}
          </div>

          {/* Avatar emoji picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-dark-100">
                Avatar Icon <span className="font-normal text-dark-400 text-xs">(or pick an emoji instead)</span>
              </label>
              {selectedEmoji && (
                <button
                  onClick={() => setSelectedEmoji(null)}
                  className="text-xs text-dark-400 hover:text-dark-100 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji === selectedEmoji ? null : emoji)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110 ${
                    selectedEmoji === emoji
                      ? "bg-brand-100 ring-2 ring-brand-500 scale-110"
                      : "hover:bg-dark-800"
                  }`}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-dark-500 text-xs">
              Photo takes priority over emoji · Click to select · Click again to deselect
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={16} /> Saved!</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
