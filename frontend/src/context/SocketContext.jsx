import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connection established');
      setIsConnected(true);
      
      // Subscribe to global market ticks
      socketInstance.emit('subscribeMarket');

      // Authenticate with user's room if logged in
      const token = localStorage.getItem('token');
      if (token) {
        socketInstance.emit('joinUserRoom', token);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Sync socket user room authentication on user changes
  useEffect(() => {
    if (socket && isConnected) {
      const token = localStorage.getItem('token');
      if (token) {
        socket.emit('joinUserRoom', token);
      }
    }
  }, [user, socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
