"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Menu, X, Phone, UserPlus, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ServerSidebar from "@/components/ServerSidebar";
import ChannelSidebar from "@/components/ChannelSidebar";
import ChatArea from "@/components/ChatArea";
import VoiceArea from "@/components/VoiceArea";
import VoiceVideoChat from "@/components/VoiceVideoChat";
import CreateServerModal from "@/components/CreateServerModal";
import CreateChannelModal from "@/components/CreateChannelModal";
import UserSettingsModal from "@/components/UserSettingsModal";
import StreamMeetingModal from "@/components/StreamMeetingModal";
import EditServerModal from "@/components/EditServerModal";
import MeetingArea from "@/components/MeetingArea";
import StreamingArea from "@/components/StreamingArea";
import LoginPopup from "@/components/LoginPopup";
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

const DashboardLayoutContent = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();

    const [servers, setServers] = useState<Server[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
    const [isStreamMeetingOpen, setIsStreamMeetingOpen] = useState(false);
    const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
    const [isEditServerOpen, setIsEditServerOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<Server | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("normal");
    const [loading, setLoading] = useState(true);
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    // Removed auto-redirect. Now we render a "Recommended to sign in" view instead.

    // Fetch servers on mount
    useEffect(() => {
        const fetchServers = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("https://opentl-backend-1.onrender.com/api/servers", {
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
            const res = await fetch(`https://opentl-backend-1.onrender.com/api/servers/${activeServerId}/channels`, {
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
            const res = await fetch("https://opentl-backend-1.onrender.com/api/servers", {
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

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-65px)] w-full items-center justify-center bg-[#313338]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-20 right-10 w-24 h-24 bg-pink-600/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                    <div className="absolute bottom-10 left-20 w-40 h-40 bg-blue-600/5 rounded-full blur-xl animate-pulse delay-2000"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-zinc-700/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-transparent rounded-full animate-spin-slow"></div>
                        <Menu className="w-12 h-12 text-zinc-300 relative z-10 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 animate-fade-in">Welcome to Network</h2>
                    <p className="max-w-md text-zinc-300 animate-slide-up">
                        Create or join a server using the sidebar to start your journey in the multiverse.
                    </p>
                    
                    {/* Animated Call to Action */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{animationDelay: '0.5s'}}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="relative px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-xl hover:scale-105 hover:shadow-purple-500/25 border border-white/20 backdrop-blur-sm overflow-hidden group"
                            >
                                <span className="relative z-10 font-bold">Create Server</span>
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            <button
                                onClick={() => router.push("/signin")}
                                className="relative px-8 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-xl hover:scale-105 hover:shadow-green-500/25 border border-white/20 backdrop-blur-sm overflow-hidden group"
                            >
                                <span className="relative z-10 font-bold">Sign In</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-[#313338]">
            {/* Login Popup */}
            <LoginPopup 
                isOpen={showLoginPopup}
                onClose={() => setShowLoginPopup(false)}
            />

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
                className="fixed top-6 right-4 z-[100] md:hidden group relative"
            >
                <div className="relative p-3 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl animate-pulse"></div>
                    <div className="relative flex items-center justify-center">
                        {mobileOpen ? (
                            <X size={20} className="text-white drop-shadow-lg animate-rotate-90 duration-300" />
                        ) : (
                            <Menu size={20} className="text-white drop-shadow-lg hover:rotate-12 transition-transform duration-200" />
                        )}
                    </div>
                </div>
                {/* Notification dot when closed */}
                {!mobileOpen && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-bounce shadow-lg"></div>
                )}
            </button>

            {/* Sidebars Container */}
            <div className={cn(
                "fixed md:relative top-[60px] md:top-0 bottom-0 left-0 z-50 flex transition-all duration-500 ease-out",
                "md:translate-x-0",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
            )}>
                {/* Enhanced Backdrop for mobile */}
                {mobileOpen && (
                    <div
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/60 to-black/80 md:hidden z-[-1] backdrop-blur-sm animate-fade-in"
                    />
                )}

                {/* Server Sidebar */}
                <div className="w-20 lg:w-20 bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800/50 md:border-r-0 lg:border-r overflow-hidden">
                    {/* Mobile Header */}
                    <div className="md:hidden h-16 bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700/50 flex items-center justify-center px-2">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Servers</div>
                    </div>
                    
                    {/* Enhanced Server List for Mobile */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        <div className="p-2 space-y-3">
                            {servers.map((server, index) => (
                                <div
                                    key={server.id}
                                    onClick={() => {
                                        handleServerSelect(server.id);
                                        setViewMode("normal");
                                        setMobileOpen(false); // Close mobile after selection
                                    }}
                                    className={cn(
                                        "group relative w-12 h-12 lg:w-12 lg:h-12 rounded-[16px] lg:rounded-[24px] flex items-center justify-center cursor-pointer transition-all duration-300 transform-gpu",
                                        activeServerId === server.id 
                                            ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 scale-110 ring-2 ring-purple-400/50" 
                                            : "bg-zinc-700 hover:bg-zinc-600 hover:scale-105 hover:shadow-lg"
                                    )}
                                >
                                    {/* Server Avatar */}
                                    <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-lg overflow-hidden">
                                        <img 
                                            src={server.icon} 
                                            alt={server.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    </div>
                                    
                                    {/* Active Indicator */}
                                    {activeServerId === server.id && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse ring-2 ring-green-400/50"></div>
                                    )}
                                    
                                    {/* Mobile Server Name */}
                                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-zinc-800 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none md:hidden">
                                        <div className="text-xs font-medium text-zinc-200">{server.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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
                        <p className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors duration-200">No server selected</p>
                    </div>
                )}
            </div>

            {/* Mobile Mini Sidebar - Always Visible */}
            <div className="md:hidden fixed left-0 top-[60px] bottom-0 w-16 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm border-r border-zinc-800/30 z-40 flex flex-col items-center py-4 gap-4">
                {/* Quick Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all duration-300 group relative"
                        title="Create Server"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <div className="absolute inset-0 bg-purple-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button
                        onClick={() => setIsStreamMeetingOpen(true)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 flex items-center justify-center text-green-400 hover:text-green-300 transition-all duration-300 group relative"
                        title="Start Meeting"
                    >
                        <Phone className="w-5 h-5" />
                        <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button
                        onClick={() => setIsUserSettingsOpen(true)}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all duration-300 group relative"
                        title="Settings"
                    >
                        <UserPlus className="w-5 h-5" />
                        <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>
                
                {/* Divider */}
                <div className="w-8 h-px bg-zinc-700/50"></div>
                
                {/* Server Quick Access */}
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                    {servers.slice(0, 5).map((server) => (
                        <button
                            key={server.id}
                            onClick={() => {
                                handleServerSelect(server.id);
                                setViewMode("normal");
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                // Open edit modal for mobile
                                if (server.owner === user?._id) {
                                    setEditingServer(server);
                                    setIsEditServerOpen(true);
                                }
                            }}
                            onDoubleClick={() => {
                                // Double click to edit for mobile
                                if (server.owner === user?._id) {
                                    setEditingServer(server);
                                    setIsEditServerOpen(true);
                                }
                            }}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group relative",
                                activeServerId === server.id
                                    ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50"
                                    : "bg-zinc-800/50 hover:bg-zinc-700/50"
                            )}
                            title={`${server.name} ${server.owner === user?._id ? "(Double-tap to edit)" : ""}`}
                        >
                            <img
                                src={server.icon}
                                alt={server.name}
                                className="w-6 h-6 rounded-lg object-cover"
                            />
                            {activeServerId === server.id && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-green-400/50"></div>
                            )}
                            {/* Edit indicator for owner */}
                            {server.owner === user?._id && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" title="You own this server"></div>
                            )}
                        </button>
                    ))}
                </div>
                
                {/* User Avatar */}
                {user && (
                    <div className="mt-auto pt-4 border-t border-zinc-700/50">
                        <button
                            onClick={() => setIsUserSettingsOpen(true)}
                            className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-zinc-600 hover:ring-purple-500 transition-all duration-300 group relative"
                            title="Your Profile"
                        >
                            <img
                                src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                alt={user.displayName || user.username}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden md:ml-20 p-2">
                {viewMode === "meeting" ? (
                    <MeetingArea onEnd={() => setViewMode("normal")} />
                ) : viewMode === "streaming" ? (
                    <StreamingArea onEnd={() => setViewMode("normal")} />
                ) : activeServer && activeChannel ? (
                    activeChannel.type === "text" ? (
                        <>
                            {/* Content Header (Text Only) */}
                            <div className="h-12 border-b border-black flex items-center justify-between px-4 shadow-sm shrink-0 bg-[#313338] z-10">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <span className="text-lg md:text-2xl font-light opacity-50">#</span>
                                    <span className="font-bold text-white text-base md:text-lg">
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
                                        className="hover:text-zinc-200 transition flex items-center gap-2 group relative"
                                    >
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="text-xs md:text-sm font-bold hidden sm:block">Invite</span>
                                        <UserPlus size={16} className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                                    </button>
                                    <button
                                        onClick={() => setIsVoiceChatOpen(true)}
                                        className="hover:text-zinc-200 transition flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent rounded-full animate-pulse"></div>
                                        <Phone className="w-4 h-4 relative z-10 text-white group-hover:scale-110 transition-transform duration-200" />
                                        <span className="text-xs md:text-sm font-bold hidden sm:block">Join Voice</span>
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
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                            <Menu className="w-12 h-12 text-zinc-600" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Welcome to Network</h2>
                        <p className="max-w-md">
                            Create or join a server using the sidebar to start your journey in the multiverse.
                        </p>
                    </div>
                )}
            </main>

            {/* Voice/Video Chat Modal */}
            {activeServer && activeChannel && (
                <VoiceVideoChat
                    serverId={activeServerId as string}
                    channelId={activeChannel.id}
                    isOpen={isVoiceChatOpen}
                    onClose={() => setIsVoiceChatOpen(false)}
                />
            )}

            {/* Edit Server Modal */}
            {editingServer && (
                <EditServerModal
                    server={editingServer}
                    isOpen={isEditServerOpen}
                    onClose={() => {
                        setIsEditServerOpen(false);
                        setEditingServer(null);
                    }}
                    onServerUpdated={(updatedServer) => {
                        setServers(servers.map(s => s.id === updatedServer.id ? updatedServer : s));
                        setIsEditServerOpen(false);
                        setEditingServer(null);
                    }}
                />
            )}
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-65px)] w-full items-center justify-center bg-[#313338]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        }>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    );
}
