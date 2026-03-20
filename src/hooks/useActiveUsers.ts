"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface ActiveUsersData {
  activeUsers: number;
  timestamp: string;
}

export function useActiveUsers() {
  const [activeUsers, setActiveUsers] = useState<number>(2500);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial count
    const fetchActiveUsers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/users/active");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ActiveUsersData = await response.json();
        setActiveUsers(data.activeUsers);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch active users:", error);
        setError("Failed to connect to server");
        // Keep the default value (2500) when fetch fails
      }
    };

    fetchActiveUsers();

    // Set up socket connection for real-time updates
    const newSocket = io("http://127.0.0.1:5000", {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      setError(null);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Connection error");
    });

    newSocket.on("user-count-updated", (count: number) => {
      setActiveUsers(count);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return { activeUsers, error };
}
