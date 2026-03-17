"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Check, Loader2, User } from "lucide-react";
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

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  avatarEmoji: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [username, setUsername] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
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
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

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
        body: JSON.stringify({ name: username.trim(), avatarEmoji: selectedEmoji }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        // Sync localStorage so dashboard shows updated name
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

  const displayEmoji = selectedEmoji;
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              {displayEmoji ? (
                <span className="text-4xl">{displayEmoji}</span>
              ) : (
                <span className="text-2xl font-bold text-white">{displayInitials}</span>
              )}
            </div>
            <p className="text-dark-400 text-sm">
              {profile?.email}
            </p>
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

          {/* Avatar emoji picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-dark-100">
                Avatar Icon
              </label>
              {selectedEmoji && (
                <button
                  onClick={() => setSelectedEmoji(null)}
                  className="text-xs text-dark-400 hover:text-dark-100 transition-colors"
                >
                  Use initials instead
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
              Click to select · Click again to deselect (shows initials)
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
