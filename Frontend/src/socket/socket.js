import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io("https://t2dh4c5x-3001.inc1.devtunnels.ms", {
      query: { userId },
    });
  }
  return socket;
};

export const getSocket = () => socket;
