"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Trash2, Hash, Volume2, Check, AlertTriangle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

interface Channel {
    id: string;
    name: string;
    type: "text" | "voice";
}

interface Server {
    id: string;
    name: string;
    icon: string;
    color: string;
    channels: Channel[];
    owner?: string;
}

interface EditServerModalProps {
    server: Server;
    isOpen: boolean;
    onClose: () => void;
    onServerUpdated: (updatedServer: Server) => void;
}

const COLOR_OPTIONS = [
    { label: "red", value: "bg-red-600", hex: "#dc2626" },
    { label: "blue", value: "bg-blue-600", hex: "#2563eb" },
    { label: "green", value: "bg-green-600", hex: "#16a34a" },
    { label: "purple", value: "bg-purple-600", hex: "#9333ea" },
    { label: "orange", value: "bg-orange-500", hex: "#f97316" },
    { label: "pink", value: "bg-pink-600", hex: "#db2777" },
    { label: "yellow", value: "bg-yellow-500", hex: "#eab308" },
    { label: "teal", value: "bg-teal-600", hex: "#0d9488" },
    { label: "indigo", value: "bg-indigo-600", hex: "#4f46e5" },
    { label: "zinc", value: "bg-zinc-600", hex: "#52525b" },
];

export default function EditServerModal({
    server,
    isOpen,
    onClose,
    onServerUpdated,
}: EditServerModalProps) {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<"overview" | "channels">("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [name, setName] = useState(server.name);
    const [icon, setIcon] = useState(server.icon);
    const [color, setColor] = useState(server.color);
    const [channels, setChannels] = useState<Channel[]>(server.channels);

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");
    const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    /* Sync when server changes */
    useEffect(() => {
        setName(server.name);
        setIcon(server.icon);
        setColor(server.color);
        setChannels(server.channels);
        setError("");
        setSaveSuccess(false);
        setSidebarOpen(false);
    }, [server, isOpen]);

    /* Auto focus name input */
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const hasChanges =
        name !== server.name || icon !== server.icon || color !== server.color;

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => setIcon(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleSaveOverview = async () => {
        if (!name.trim()) return setError("Server name cannot be empty.");

        setSaving(true);
        setError("");

        try {
            const res = await fetch(
                `https://opentl-backend.onrender.com/api/servers/${server.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user!.token}`,
                    },
                    body: JSON.stringify({ name: name.trim(), icon, color }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to save changes.");
                return;
            }

            onServerUpdated({
                ...server,
                name: data.name,
                icon: data.icon,
                color: data.color,
                channels,
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteChannel = async (channelId: string) => {
        setDeletingChannelId(null);

        try {
            const res = await fetch(
                `https://opentl-backend.onrender.com/api/servers/${server.id}/channels/${channelId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${user!.token}` },
                }
            );

            if (res.ok) {
                const updated = channels.filter((c) => c.id !== channelId);
                setChannels(updated);
                onServerUpdated({ ...server, name, icon, color, channels: updated });
            }
        } catch {
            console.error("Failed to delete channel");
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-[#313338] w-full max-w-3xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Mobile Header */}
                <div className="sm:hidden bg-[#2b2d31] p-4 border-b border-zinc-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-zinc-400 uppercase">
                            {server.name}
                        </p>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {["overview", "channels"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "flex-1 px-3 py-2 rounded-md text-sm transition capitalize",
                                    activeTab === tab
                                        ? "bg-zinc-700 text-white"
                                        : "text-zinc-400 hover:bg-zinc-700/60 hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar (Desktop) */}
                <div className="hidden sm:flex w-56 bg-[#2b2d31] p-4 flex-col gap-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2">
                        {server.name}
                    </p>

                    {["overview", "channels"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "text-left px-3 py-2 rounded-md text-sm transition capitalize",
                                activeTab === tab
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:bg-zinc-700/60 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}

                    <div className="mt-auto pt-4 border-t border-zinc-700/50">
                        <button
                            onClick={onClose}
                            className="w-full text-left px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md transition"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto relative">
                    {/* OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="p-6 space-y-6">
                            <h2 className="text-xl font-bold text-white">
                                Server Overview
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                                {/* Avatar */}
                                <div className="relative">
                                    <div
                                        className={cn(
                                            "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl overflow-hidden cursor-pointer active:scale-95 transition",
                                            icon.startsWith("http") ||
                                                icon.startsWith("data:")
                                                ? ""
                                                : color
                                        )}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {icon.startsWith("http") ||
                                            icon.startsWith("data:") ? (
                                            <img
                                                src={icon}
                                                alt="server"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{icon}</span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-0 right-0 bg-black/70 p-1 rounded-full">
                                        <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleIconUpload}
                                    />
                                </div>

                                {/* Name */}
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase">
                                        Server Name
                                    </label>
                                    <input
                                        ref={nameInputRef}
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        maxLength={100}
                                        className="w-full bg-[#1e1f22] text-white rounded-md px-3 py-2 text-sm outline-none border border-zinc-700 focus:border-red-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c.value}
                                        onClick={() => setColor(c.value)}
                                        style={{ background: c.hex }}
                                        className={cn(
                                            "w-7 h-7 sm:w-8 sm:h-8 rounded-full transition",
                                            color === c.value
                                                ? "ring-2 ring-white scale-110"
                                                : "hover:scale-110"
                                        )}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Sticky Save */}
                            <div className="sticky bottom-0 bg-[#313338] pt-4">
                                <button
                                    onClick={handleSaveOverview}
                                    disabled={!hasChanges || saving}
                                    className={cn(
                                        "w-full py-2 rounded-md font-semibold transition",
                                        hasChanges
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                    )}
                                >
                                    {saving
                                        ? "Saving..."
                                        : saveSuccess
                                            ? "Saved!"
                                            : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CHANNELS */}
                    {activeTab === "channels" && (
                        <div className="p-6 space-y-4">
                            <h2 className="text-xl font-bold text-white">Channels</h2>

                            {channels.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="flex items-center justify-between bg-[#2b2d31] rounded-lg px-4 py-3"
                                >
                                    <div className="flex items-center gap-2 text-zinc-300">
                                        {channel.type === "text" ? (
                                            <Hash className="w-4 h-4" />
                                        ) : (
                                            <Volume2 className="w-4 h-4" />
                                        )}
                                        <span>{channel.name}</span>
                                    </div>

                                    <button
                                        onClick={() => setDeletingChannelId(channel.id)}
                                        className="p-2 hover:bg-red-600/20 rounded-md text-zinc-400 hover:text-red-400 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <AnimatePresence>
                                {deletingChannelId && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
                                        onClick={() => setDeletingChannelId(null)}
                                    >
                                        <div
                                            className="bg-[#313338] rounded-xl p-6 w-full max-w-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <h3 className="text-white font-bold mb-4">
                                                Delete Channel?
                                            </h3>
                                            <button
                                                onClick={() =>
                                                    handleDeleteChannel(deletingChannelId)
                                                }
                                                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-md text-white font-semibold"
                                            >
                                                Confirm Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}