import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            // Get token from localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            if (token) {
                const newSocket = io('http://localhost:5000', {
                    auth: { token }
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected:', newSocket.id);
                });

                newSocket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err.message);
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
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
