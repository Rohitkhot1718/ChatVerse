import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io("https://chatverse-g8zt.onrender.com", {
      query: { userId },
    });
  }
  return socket;
};

export const getSocket = () => socket;
