"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ServerSidebar from "@/components/ServerSidebar";
import ChannelSidebar from "@/components/ChannelSidebar";
import ChatArea from "@/components/ChatArea";
import VoiceArea from "@/components/VoiceArea";
import CreateServerModal from "@/components/CreateServerModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import UserSettingsModal from "@/components/UserSettingsModal";
import StreamMeetingModal from "@/components/StreamMeetingModal";
import MeetingArea from "@/components/MeetingArea";
import StreamingArea from "@/components/StreamingArea";
import { useAuth } from "@/context/AuthContext";

type ViewMode = "normal" | "streaming" | "meeting";

interface Channel {
    _id?: string;
    id: string;
    name: string;
    type: "text" | "voice";
}

interface Server {
    _id?: string;
    id: string;
    name: string;
    icon: string;
    color: string;
    channels: Channel[];
    owner?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { user } = useAuth();

    const [servers, setServers] = useState<Server[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
    const [isStreamMeetingOpen, setIsStreamMeetingOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("normal");
    const [loading, setLoading] = useState(true);

    // Fetch servers on mount
    useEffect(() => {
        const fetchServers = async () => {
            if (!user?.token) return;

            try {
                const res = await fetch("http://127.0.0.1:5000/api/servers", {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    // Transform MongoDB _id to id for frontend compatibility if needed, 
                    // though ServerSidebar uses server.id
                    const transformedData = data.map((s: any) => ({
                        ...s,
                        id: s._id,
                        owner: s.owner,
                        channels: s.channels.map((c: any) => ({ ...c, id: c._id }))
                    }));
                    setServers(transformedData);
                }
            } catch (error) {
                console.error("Failed to fetch servers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServers();
    }, [user?.token]);

    // Get active IDs from URL or fall back to defaults
    const activeServerId = searchParams.get("s");
    const activeChannelId = searchParams.get("c");

    const activeServer = servers.find(s => s.id === activeServerId) || servers[0];
    const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId) || activeServer?.channels[0];

    useEffect(() => {
        if (!activeServerId && servers.length > 0) {
            router.push(`${pathname}?s=${servers[0].id}&c=${servers[0].channels[0].id}`);
        }
    }, [servers, activeServerId, pathname, router]);

    const handleServerSelect = (id: string) => {
        const server = servers.find(s => s.id === id);
        if (server) {
            router.push(`${pathname}?s=${id}&c=${server.channels[0].id}`);
        }
    };

    const handleChannelSelect = (channelId: string) => {
        router.push(`${pathname}?s=${activeServerId}&c=${channelId}`);
        setMobileOpen(false);
    };

    const handleCreateChannel = async (name: string, type: "text" | "voice") => {
        if (!user?.token || !activeServerId) return;

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/servers/${activeServerId}/channels`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ name, type }),
            });

            if (res.ok) {
                const newChannelData = await res.json();
                const transformedChannel = { ...newChannelData, id: newChannelData._id };

                const updatedServers = servers.map(server => {
                    if (server.id === activeServerId) {
                        return {
                            ...server,
                            channels: [...server.channels, transformedChannel]
                        };
                    }
                    return server;
                });

                setServers(updatedServers);
                router.push(`${pathname}?s=${activeServerId}&c=${transformedChannel.id}`);
                setIsChannelModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create channel:", error);
        }
    };

    const handleCreateServer = async (name: string, topic: string, audience: string, logo: string) => {
        if (!user?.token) return;

        try {
            const res = await fetch("http://127.0.0.1:5000/api/servers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    name,
                    icon: logo || name[0].toUpperCase(),
                    color: "bg-red-600",
                }),
            });

            if (res.ok) {
                const newServerData = await res.json();
                const transformedServer = {
                    ...newServerData,
                    id: newServerData._id,
                    channels: newServerData.channels.map((c: any) => ({ ...c, id: c._id }))
                };

                setServers([...servers, transformedServer]);
                router.push(`${pathname}?s=${transformedServer.id}&c=${transformedServer.channels[0].id}`);
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create server:", error);
        }
    };

    const handleServerUpdated = (updatedServer: Server) => {
        setServers(prev => prev.map(s => s.id === updatedServer.id ? { ...s, ...updatedServer } : s));
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-65px)] w-full items-center justify-center bg-[#313338]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-[#313338]">
            {/* Modals */}
            <CreateServerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateServer}
            />
            <CreateChannelModal
                isOpen={isChannelModalOpen}
                onClose={() => setIsChannelModalOpen(false)}
                onCreate={handleCreateChannel}
            />
            <UserSettingsModal
                isOpen={isUserSettingsOpen}
                onClose={() => setIsUserSettingsOpen(false)}
            />
            <StreamMeetingModal
                isOpen={isStreamMeetingOpen}
                onClose={() => setIsStreamMeetingOpen(false)}
                onSelect={(mode) => {
                    setViewMode(mode);
                    setIsStreamMeetingOpen(false);
                }}
            />

            {/* Mobile Toggle Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed bottom-6 right-6 z-[100] md:hidden p-4 bg-red-600 text-white rounded-full shadow-2xl transition-transform active:scale-95"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebars Container */}
            <div className={cn(
                "fixed md:relative top-[65px] md:top-0 bottom-0 left-0 z-50 flex transition-transform duration-300",
                "md:translate-x-0",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Backdrop for mobile */}
                {mobileOpen && (
                    <div
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/60 md:hidden z-[-1]"
                    />
                )}

                {/* Server Sidebar */}
                <ServerSidebar
                    servers={servers.map(({ id, name, icon, color }) => ({ id, name, icon, color }))}
                    activeServerId={activeServerId || ""}
                    onServerSelect={(id) => {
                        handleServerSelect(id);
                        setViewMode("normal");
                    }}
                    onAddServer={() => setIsCreateModalOpen(true)}
                    onMeet={() => setIsStreamMeetingOpen(true)}
                />

                {/* Channel Sidebar */}
                {activeServer ? (
                    <ChannelSidebar
                        server={activeServer as any}
                        activeChannelId={activeChannelId || ""}
                        onChannelSelect={handleChannelSelect}
                        onCreateChannel={() => setIsChannelModalOpen(true)}
                        onUserSettings={() => setIsUserSettingsOpen(true)}
                        onServerUpdated={handleServerUpdated}
                    />
                ) : (
                    <div className="w-60 bg-[#2b2d31] flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-sm text-zinc-500">No server selected</p>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {viewMode === "meeting" ? (
                    <MeetingArea onEnd={() => setViewMode("normal")} />
                ) : viewMode === "streaming" ? (
                    <StreamingArea onEnd={() => setViewMode("normal")} />
                ) : activeServer && activeChannel ? (
                    <>
                        {activeChannel.type === "text" ? (
                            <>
                                {/* Content Header (Text Only) */}
                                <div className="h-12 border-b border-black flex items-center justify-between px-4 shadow-sm shrink-0 bg-[#313338] z-10">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <span className="text-2xl font-light opacity-50">#</span>
                                        <span className="font-bold text-white">
                                            {activeChannel.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-zinc-400">
                                        <button
                                            onClick={() => {
                                                const inviteUrl = `${window.location.origin}/invite?s=${activeServerId}`;
                                                navigator.clipboard.writeText(inviteUrl);
                                                alert("Invite link copied to clipboard!");
                                            }}
                                            className="hover:text-zinc-200 transition flex items-center gap-2"
                                        >
                                            <span className="text-xs font-bold hidden sm:block">Invite</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 overflow-hidden relative">
                                    <ChatArea
                                        serverId={activeServerId as string}
                                        channelId={activeChannel.id}
                                        channelName={activeChannel.name}
                                    />
                                </div>
                            </>
                        ) : (
                            /* Voice Area */
                            <VoiceArea channelName={activeChannel.name} roomId={activeChannel.id} />
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                            <Menu className="w-12 h-12 text-zinc-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Network</h2>
                        <p className="max-w-md">
                            Create or join a server using the sidebar to start your journey in the multiverse.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
