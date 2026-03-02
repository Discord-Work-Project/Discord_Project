"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Hash, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface Channel {
    _id: string;
    name: string;
    type: "text" | "voice";
}

export default function ChannelList({ serverId }: { serverId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [serverName, setServerName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServerDetails = async () => {
            if (!user?.token || !serverId) return;
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/servers/${serverId}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setServerName(data.name);
                    setChannels(data.channels);
                }
            } catch (error) {
                console.error("Failed to fetch server details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServerDetails();
    }, [user?.token, serverId]);

    if (loading) {
        return (
            <div className="hidden md:flex w-60 bg-zinc-900 h-full flex-col border-r border-black items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="hidden md:flex w-60 bg-zinc-900 h-full flex-col border-r border-black overflow-hidden min-w-[240px]">
            <div className="h-12 flex items-center px-4 border-b border-black font-bold text-zinc-200 truncate">
                {serverName || serverId.replace(/-/g, ' ').toUpperCase()}
            </div>

            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {channels.map((channel) => {
                    const isActive = pathname?.includes(channel._id) || pathname?.includes(channel.name);

                    return (
                        <div
                            key={channel._id}
                            onClick={() => {
                                router.push(
                                    `/server/${serverId}/channel/${channel.name}`
                                );
                            }}
                            className={cn(
                                "px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer group transition",
                                isActive
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                            )}
                        >
                            {channel.type === "text" ? (
                                <Hash className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
                            ) : (
                                <Volume2 className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200" />
                            )}
                            <span className="text-sm font-medium truncate">{channel.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}