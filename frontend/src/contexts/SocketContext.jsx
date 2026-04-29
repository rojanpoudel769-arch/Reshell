import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(() => {
        return localStorage.getItem('hasUnreadMessages') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('hasUnreadMessages', hasUnreadMessages);
    }, [hasUnreadMessages]);

    const location = useLocation();

    useEffect(() => {
        if (user) {
            // Get token from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            if (token) {
                const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const newSocket = io(socketUrl, {
                    auth: { token }
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected:', newSocket.id);
                });

                newSocket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err.message);
                });

                newSocket.on('message_notification', () => {
                    // Only set unread if NOT on messages page
                    if (window.location.pathname !== '/messages') {
                        setHasUnreadMessages(true);
                    }
                });

                setSocket(newSocket);

                return () => {
                    newSocket.disconnect();
                };
            }
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, hasUnreadMessages, setHasUnreadMessages }}>
            {children}
        </SocketContext.Provider>
    );
};
