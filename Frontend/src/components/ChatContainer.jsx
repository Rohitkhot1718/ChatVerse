import { useState, useEffect, useRef } from "react";
import axiosInstance from "../axios/axiosInstance";
import { connectSocket } from "../socket/socket";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { toast } from "react-hot-toast";
import getAvatarColor from "../utils/getAvatarColor";
import ChatVerseLogo from "../assets/chat.svg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const ChatContainer = ({ setShowChat, isLargeScreen }) => {
  const userId = useAuthStore((state) => state.user._id);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);
  const menuRef = useRef(null);
  const isUserOnline = selectedUser && onlineUsers.includes(selectedUser._id);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    socketRef.current = connectSocket(userId);
    socketRef.current.on("newMessage", (newMsg) => {
      if (
        selectedUser &&
        (selectedUser._id === newMsg.senderId ||
          selectedUser._id === newMsg.receiverId)
      ) {
        setMessages((prev) => [...prev, newMsg]);
        axiosInstance.put(`messages/read/${newMsg._id}`);
      } else if (newMsg.senderId !== userId) {
        useChatStore.getState().setUnreadMessages(newMsg.senderId);
      }

      const friendId =
        newMsg.senderId === userId ? newMsg.receiverId : newMsg.senderId;
      useChatStore.getState().updateLastMessage(friendId, newMsg);
    });

    socketRef.current.on("online", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketRef.current?.off("newMessage");
      socketRef.current?.off("online");
    };
  }, [userId, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      axiosInstance
        .get(`messages/${selectedUser._id}`)
        .then((res) => setMessages(res.data))
        .catch(console.error);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;

    if (el.scrollHeight > 160) {
      el.style.overflowY = "auto";
    } else {
      el.style.overflowY = "hidden";
    }
  }, [message]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClosePreview = () => {
    setImagePreview(null);
    document.getElementById("fileInput").value = "";
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  function handleSend() {
    if (!selectedUser) return;

    const fileInput = document.getElementById("fileInput");
    const hasImage = fileInput.files[0];
    const hasText = message.trim();

    if (!hasImage && !hasText) return;

    const tempMessage = {
      _id: Date.now(),
      senderId: userId,
      receiverId: selectedUser._id,
      text: hasText ? message : null,
      image: hasImage ? URL.createObjectURL(fileInput.files[0]) : null,
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);

    const formData = new FormData();
    if (hasImage) {
      formData.append("image", fileInput.files[0]);
      if (hasText) {
        formData.append("text", message);
      }
    } else {
      formData.append("text", message);
    }

    setShowEmojiPicker(false);
    setMessage("");
    if (hasImage) {
      setImagePreview(null);
      fileInput.value = "";
    }

    try {
      axiosInstance
        .post(`messages/${selectedUser._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempMessage._id ? res.data : msg))
          );

          if (socketRef.current) {
            socketRef.current.emit("newMessage", res.data);
          }
          useChatStore.getState().updateLastMessage(selectedUser._id, res.data);
        })
        .catch((error) => {
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== tempMessage._id)
          );
          console.error("Failed to send message:", error);
          toast.error("Failed to send message");
        });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }

  function handleKeySend(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setShowEmojiPicker(false);
    }
  }

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    if (value.endsWith("@")) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  const handleMentionClick = () => {
    const newText = message.replace(/@$/, "@Silvi ");
    setMessage(newText);
    setShowPopup(false);
    inputRef.current.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!inputRef.current?.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClearChatConfirm = () => {
    setShowClearChatConfirm(true);
    setOpen(false);
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;

    try {
      if (messages.length > 0) {
        await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
        setMessages([]);
        useChatStore.getState().updateLastMessage(selectedUser._id, null);
        setShowClearChatConfirm(false);
        toast.success("Chat cleared successfully");
      } else {
        setShowClearChatConfirm(false);
        toast.error("No messages to clear");
      }
    } catch (error) {
      console.error("Failed to clear chat:", error);
      toast.error("Failed to clear chat");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`w-[100vw] lg:w-[72%] max-w-full sm:w-[100vw] flex flex-col h-svh ${
        showInfo && "pr-[300px]"
      }
      ${selectedUser ? "block" : "hidden lg:block md:hidden"}
      `}
    >
      {selectedUser ? (
        <>
          <div className="flex justify-between items-center bg-[#0d0d0d] p-3 cursor-pointer relative">
            <div className="flex items-center">
              {!isLargeScreen && (
                <i
                  className="ri-arrow-left-s-line -ml-3 mr-1 text-3xl text-white hover:text-green-300"
                  onClick={() => setSelectedUser(null)}
                ></i>
              )}
              {selectedUser.profilePic ? (
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.username}
                  className="w-12 h-12 rounded-[10px] object-cover"
                  onClick={() => setIsOpen(true)}
                />
              ) : (
                <div
                  onClick={() => setIsOpen(true)}
                  className={`w-12 h-12 rounded-[10px] text-white flex items-center justify-center font-semibold text-lg uppercase ${getAvatarColor(
                    selectedUser.username
                  )}`}
                >
                  {selectedUser.username?.[0]}
                </div>
              )}
              <div className="mx-2">
                <h6 className="text-white text-[16px] font-bold">
                  {selectedUser.username}
                </h6>
                <p className="text-gray-400 text-sm">
                  {isUserOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="flex gap-2" ref={menuRef}>
                <button onClick={toggleMenu}>
                  <i className="ri-more-2-line text-[15px] text-white hover:text-green-300"></i>
                </button>
              </div>
            </div>
          </div>
          {open && (
            <div className="absolute right-4 top-10 mt-2 w-44 text-white bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <ul>
                {isLargeScreen && (
                  <li
                    onClick={() => {
                      setSelectedUser(null);
                      setOpen(false);
                    }}
                    className="px-4 py-2 hover:text-green-300 cursor-pointer"
                  >
                    <i className="ri-close-line"> Close Chat</i>
                  </li>
                )}
                <li
                  onClick={handleClearChatConfirm}
                  className="px-4 py-2 hover:text-green-300 cursor-pointer"
                >
                  <i className="ri-delete-bin-line"> Clear Chat</i>
                </li>
                <li
                  onClick={() => {
                    setShowInfo(true);
                    setOpen(false);
                  }}
                  className="px-4 py-2 hover:text-green-300 cursor-pointer"
                >
                  <i className="ri-information-line"> View Info</i>
                </li>
              </ul>
            </div>
          )}
          {isOpen && (
            <div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                {selectedUser.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.username}
                    className="`w-[90vw] h-[90vw] max-w-[400px] max-h-[400px] rounded-xl shadow-xl object-cover"
                    onClick={() => setIsOpen(true)}
                  />
                ) : (
                  <div
                    className={`w-[90vw] h-[90vw] max-w-[300px] max-h-[300px] rounded-xl  text-white flex 
                      items-center justify-center font-semibold text-9xl uppercase
                      lg:text-9xl
                      ${getAvatarColor(selectedUser.username)}`}
                  >
                    {selectedUser.username?.[0]}
                  </div>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 text-white text-2xl font-bold"
                >
                  <i className="ri-close-line text-xl p-1 rounded-3xl hover:text-green-300 hover:bg-zinc-800 cursor-pointer"></i>
                </button>
              </div>
            </div>
          )}
          {showInfo && selectedUser && (
            <div className="lg:w-[302px] w-full h-screen bg-[#0d0d0d] border-l border-zinc-800 absolute right-0 top-0 z-40">
              <div className="flex justify-between items-center p-4">
                <h2 className="text-white font-semibold">Profile Info</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="p-6 flex flex-col items-center">
                {selectedUser.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt={selectedUser.username}
                    className="w-32 h-32 rounded-[10px] object-cover"
                  />
                ) : (
                  <div
                    className={`w-32 h-32 rounded-[10px] flex items-center justify-center text-4xl font-semibold text-white uppercase ${getAvatarColor(
                      selectedUser.username
                    )}`}
                  >
                    {selectedUser.username[0]}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedUser.username}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {isUserOnline ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                        Offline
                      </span>
                    )}
                  </p>
                </div>

                <div className="w-full mt-6">
                  <div className="bg-zinc-800/50 p-4 rounded-lg">
                    <h4 className="text-gray-400 text-xs uppercase mb-2">
                      Bio
                    </h4>
                    <p className="text-white text-sm">
                      {selectedUser.bio || "Hey there! I am using ChatVerse"}
                    </p>
                  </div>

                  <div className="bg-zinc-800/50 p-4 rounded-lg mt-4">
                    <h4 className="text-gray-400 text-xs uppercase mb-2">
                      Joined
                    </h4>
                    <p className="text-white text-sm">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col overflow-y-auto scrollbar-hide p-4 bg-[131313ee]"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[70%] m-2 px-4 py-2 rounded-xl rounded-bl-none shadow
              ${
                msg.senderId === userId
                  ? "self-end bg-[#5ad3b7ce] text-black"
                  : "self-start bg-[#363131] text-white"
              }
              ${msg.pending ? "opacity-70" : ""}`}
              >
                <div className="relative">
                  {msg.image && (
                    <>
                      <img
                        src={msg.image}
                        alt="message"
                        className="max-w-40 rounded-lg mb-2"
                        loading="lazy"
                        onClick={() => setSelectedMsg(msg)}
                      />
                      <p className="text-[8px] ml-30 mt-3">
                        {!msg.text && formatTime(msg.createdAt)}
                      </p>
                    </>
                  )}
                  {msg.isSilvi && (
                    <p className="text-xs font-semibold text-green-400 m-1">
                      Silvi
                    </p>
                  )}
                  {msg.text && (
                    <div className="flex items-center gap-2 m-1">
                      {msg.isSilvi ? (
                        <div className="markdown-body text-sm pr-12">
                          <ReactMarkdown
                            children={msg.text}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          />
                        </div>
                      ) : (
                        <p className="text-sm pr-12">{msg.text}</p>
                      )}

                      <p className="flex text-[9px] mt-3 absolute -bottom-1 right-0">
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  )}
                </div>
                {selectedMsg && (
                  <div
                    className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setSelectedMsg(null)}
                  >
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <img
                        src={selectedMsg.image}
                        alt="Preview"
                        className="w-[90vw] h-[90vw] max-w-[400px] max-h-[400px] rounded-xl shadow-xl object-cover"
                      />
                      <button
                        onClick={() => setSelectedMsg(null)}
                        className="absolute top-2 right-2 text-white text-2xl font-bold"
                        aria-label="Close"
                      >
                        <i className="ri-close-line text-xl p-1 rounded-3xl hover:text-green-300 hover:bg-zinc-800 cursor-pointer"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {imagePreview && (
            <div className="relative w-32 h-32 mb-2 mx-2">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={handleClosePreview}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          )}
          <div className="bg-[#0d0d0d] p-2" ref={emojiRef}>
            <div className="bg-zinc-800 p-2 flex items-center gap-2 border rounded-[5px]">
              <div className="flex items-center flex-1 gap-2 relative">
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="fileInput">
                  <i className="ri-attachment-line text-[15px] text-white hover:text-green-300 cursor-pointer"></i>
                </label>
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="w-full max-h-40 text-white outline-none resize-none scrollbar-hide"
                  placeholder="Type a Message..."
                  value={message}
                  onChange={handleChange}
                  onKeyDown={handleKeySend}
                  onClick={handleInputClick}
                />

                {showPopup && (
                  <div className="absolute bottom-13 left-0 bg-[#363131]  hover:bg-zinc-900 rounded shadow-lg  z-50 p-2">
                    <button
                      onClick={handleMentionClick}
                      className="w-full text-white text-left"
                    >
                      Silvi
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <i
                  className="ri-emoji-sticker-line text-[20px] text-white hover:text-green-300 cursor-pointer"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                ></i>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 -right-15 scale-75 \ sm:scale-80 lg:scale-90">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="dark"
                        previewPosition="none"
                        skinTonePosition="none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleSend}
                className="flex justify-center items-center w-10 h-10 border rounded-[10px] bg-[#5ad3b7ce] hover:bg-[#5ad3b7ce]"
              >
                <i className="ri-send-plane-line text-[20px] text-black"></i>
              </button>
            </div>
          </div>
          {showClearChatConfirm && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#0d0d0d] p-6 rounded-lg shadow-xl border border-zinc-800 w-[90%] max-w-[320px]">
                <h3 className="text-white text-lg font-semibold mb-4">
                  Clear Chat
                </h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to clear this chat? This action cannot
                  be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowClearChatConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <img
            src={ChatVerseLogo}
            alt="ChatVerse Logo"
            className="w-15 h-15 logo-jump"
          />
          <p>Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
