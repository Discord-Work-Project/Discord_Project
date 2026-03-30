"use client";

import React, { useState, useRef, useEffect } from "react";
import { Hash, Volume2, ChevronDown, Settings, Mic, Headphones, Edit3, LogOut, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useVoice } from "@/context/VoiceContext";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import EditServerModal from "./EditServerModal";

interface Channel { id: string; name: string; type: "text" | "voice"; }

interface Server {
    id: string;
    name: string;
    icon: string;
    color: string;
    channels: Channel[];
    owner?: string;
}

interface ChannelSidebarProps {
    server: Server;
    activeChannelId: string;
    onChannelSelect: (id: string) => void;
    onCreateChannel: () => void;
    onUserSettings: () => void;
    onServerUpdated: (updatedServer: Server) => void;
}

export default function ChannelSidebar({
    server,
    activeChannelId,
    onChannelSelect,
    onCreateChannel,
    onUserSettings,
    onServerUpdated,
}: ChannelSidebarProps) {
    const { user } = useAuth();
    const { globalVoiceState } = useVoice();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const textChannels = server.channels.filter(c => c.type === "text");
    const voiceChannels = server.channels.filter(c => c.type === "voice");
    const isOwner = user?._id === server.owner;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleCreateInvite = async () => {
        try {
            if (!user?.token) return;
            const res = await fetch(`${api.base}/api/invite/${server.id}`, {
                method: "POST",
                headers: api.authHeaders(user.token),
            });
            const data = await res.json();
            if (res.ok && data.link) {
                // Copy to clipboard
                navigator.clipboard.writeText(data.link);
                alert(`Invite link copied to clipboard!\n\n${data.link}`);
            } else {
                alert(data.message || "Failed to create invite");
            }
        } catch (err) {
            console.error(err);
            alert("Error creating invite link");
        }
        setDropdownOpen(false);
    };

    return (
        <div className="w-60 bg-zinc-900 flex flex-col h-full border-r border-black shrink-0">
            {/* ── Server Header with Dropdown ───────────────── */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(p => !p)}
                    className="w-full h-12 px-4 flex items-center justify-between border-b border-black hover:bg-zinc-800/50 transition"
                >
                    <span className="font-bold text-white truncate">{server.name}</span>
                    <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.12 }}
                            className="absolute top-full left-2 right-2 z-50 bg-[#111214] border border-zinc-800 rounded-lg shadow-2xl p-1 mt-1"
                        >
                            <button
                                onClick={handleCreateInvite}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-indigo-400 hover:bg-indigo-500 hover:text-white transition group"
                            >
                                <UserPlus className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                                Invite People
                            </button>
                            <div className="h-px bg-zinc-800 my-1" />
                            {isOwner && (
                                <button
                                    onClick={() => { setEditModalOpen(true); setDropdownOpen(false); }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-zinc-300 hover:bg-red-600 hover:text-white transition group"
                                >
                                    <Edit3 className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                    Edit Server
                                </button>
                            )}
                            <button
                                onClick={() => { onCreateChannel(); setDropdownOpen(false); }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                            >
                                <Plus className="w-4 h-4 text-zinc-400" />
                                Create Channel
                            </button>
                            <div className="h-px bg-zinc-800 my-1" />
                            <button
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-red-400 hover:bg-red-600/20 hover:text-red-300 transition"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <LogOut className="w-4 h-4" />
                                Leave Server
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Channels List ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)] custom-scrollbar">
                {/* Text Channels */}
                <div>
                    <div className="px-2 flex items-center justify-between group cursor-pointer text-zinc-500 hover:text-zinc-200 uppercase text-[12px] font-bold mb-1">
                        <div className="flex items-center gap-1">
                            <ChevronDown className="w-3 h-3" />
                            <span>Text Channels</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onCreateChannel(); }}
                            className="transition text-zinc-400 hover:text-zinc-200"
                        >
                            <Plus className="w-4 h-4 hover:cursor-pointer" />
                        </button>
                    </div>
                    <div className="space-y-0.5">
                        {textChannels.map(channel => (
                            <ChannelItem
                                key={channel.id}
                                channel={channel}
                                isActive={activeChannelId === channel.id}
                                onClick={() => onChannelSelect(channel.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Voice Channels */}
                <div>
                    <div className="px-2 flex items-center justify-between group cursor-pointer text-zinc-500 hover:text-zinc-200 uppercase text-[12px] font-bold mb-1">
                        <div className="flex items-center gap-1">
                            <ChevronDown className="w-3 h-3" />
                            <span>Voice Channels</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onCreateChannel(); }}
                            className="transition text-zinc-400 hover:text-zinc-200"
                        >
                            <Plus className="w-4 h-4 hover:cursor-pointer" />
                        </button>
                    </div>
                    <div className="space-y-0.5">
                        {voiceChannels.map(channel => (
                            <div key={channel.id}>
                                <ChannelItem
                                    channel={channel}
                                    isActive={activeChannelId === channel.id}
                                    onClick={() => onChannelSelect(channel.id)}
                                />
                                {globalVoiceState[channel.id]?.length > 0 && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {globalVoiceState[channel.id].map((participant: any) => (
                                            <div key={participant.socketId} className="flex items-center gap-2 group cursor-pointer">
                                                {participant.avatar ? (
                                                    <img src={participant.avatar} className="w-5 h-5 rounded-full" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center text-[8px] font-bold text-white">
                                                        {participant.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition">
                                                    {participant.username}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── User Profile Section ─────────────────────── */}
            <div className="bg-[#232428] px-2 py-1.5 flex items-center gap-2">
                <div className="relative group cursor-pointer" onClick={onUserSettings}>
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-zinc-700 hover:border-zinc-500 transition" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                            {user?.username?.[0].toUpperCase() || "U"}
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#232428] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate leading-tight">
                        {user?.displayName || user?.username || "Guest"}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate leading-tight">Online </p>
                </div>
                <div className="flex items-center ">
                    <button onClick={onUserSettings} className="p-1.5 hover:bg-zinc-700 rounded transition text-zinc-400 hover:text-zinc-200">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Edit Server Modal ─────────────────────────── */}
            <AnimatePresence>
                {editModalOpen && (
                    <EditServerModal
                        server={server}
                        isOpen={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        onServerUpdated={(updated) => {
                            onServerUpdated(updated);
                            setEditModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function Plus({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    );
}

function ChannelItem({ channel, isActive, onClick }: { channel: Channel; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer group transition",
                isActive ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            )}
        >
            {channel.type === "text" ? (
                <Hash className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
            ) : (
                <Volume2 className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
            )}
            <span className="text-sm font-medium">{channel.name}</span>
        </button>
    );
}
