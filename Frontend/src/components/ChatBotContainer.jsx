import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import Silvi from "../assets/Silvi.webp";
import axiosInstance from "../axios/axiosInstance";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import CustomMarkdown from "./CustomMarkdown";
import useChatStore from "../store/chatStore";

const ChatBotContainer = ({ setShowChat, isLargeScreen, onTabChange }) => {
  const scrollRef = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const [isTyping, setIsTyping] = useState(false);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get("/chatbot/messages");
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
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

  async function handleSend() {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      isBot: false,
      _id: Date.now(),
      pending: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setShowEmojiPicker(false);

    try {
      setIsTyping(true);
      const res = await axiosInstance.post("/chatbot/message", {
        text: message,
      });

      setMessages((prev) => [
        ...prev.filter((msg) => msg._id !== userMessage._id),
        res.data.userMessage,
        res.data.botMessage,
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== userMessage._id));
      setIsTyping(false);
    }
  }

  const handleKeySend = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setShowEmojiPicker(false);
    }
  };

  const handleClearChatConfirm = () => {
    setShowClearChatConfirm(true);
  };

  const handleClearChat = async () => {
    try {
      if (messages.length > 0) {
        await axiosInstance.delete("/chatbot/clear");
        setMessages([]);
        toast.success("Chat cleared successfully");
        setShowClearChatConfirm(false);
      } else {
        setShowClearChatConfirm(false);
        toast.error("No messages to clear");
      }
    } catch (error) {
      toast.error("Failed to clear chat");
      console.error("Failed to clear chat:", error);
    }
  };

  return (
    <div className="w-[100vw] lg:w-[72%] max-w-svw sm:w-[100vw] flex flex-col h-svh">
      {!selectedUser && (
        <>
          <div className="flex justify-between items-center bg-[#0d0d0d] p-3 cursor-pointer relative">
            <div className="flex items-center">
              {!isLargeScreen && (
                <i
                  className="ri-arrow-left-s-line -ml-3 mr-1 text-3xl text-white hover:text-green-300"
                  onClick={() => {
                    setShowChat(false);
                    onTabChange("messages");
                  }}
                ></i>
              )}
              <img src={Silvi} alt="" className="w-12 h-12 rounded-[10px]" />
              <div className="mx-2">
                <h6 className="text-white text-[16px] font-bold">Silvi</h6>
                <p className="text-gray-400 text-sm">Always here to help</p>
              </div>
            </div>
            <div onClick={handleClearChatConfirm}>
              <i className="ri-delete-bin-line text-white ml-2 hover:text-red-500"></i>
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
                    className="px-4 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearChat}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col overflow-y-auto scrollbar-hide py-2 bg-[131313ee]"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[90%] m-2 px-4 py-2 rounded-xl rounded-bl-none shadow
    ${
      msg.isBot
        ? "self-start bg-[#131313] text-white"
        : "self-end bg-[#5ad3b7ce] text-black"
    } ${msg.pending ? "opacity-70" : ""}`}
              >
                {msg.isBot ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <CustomMarkdown
                      text={msg.text}
                      msg={msg}
                      messages={messages}
                      isTyping={isTyping}
                      setIsTyping={setIsTyping}
                    />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#0d0d0d] p-2" ref={emojiRef}>
            <div className="bg-zinc-800 p-2 flex items-center gap-2 border rounded-[5px] ">
              <div className="flex items-center flex-1 gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  className="w-full max-h-40 text-white outline-none resize-none scrollbar-hide"
                  placeholder="Type a Message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeySend}
                  onClick={handleInputClick}
                />
              </div>
              <div className="relative">
                <i
                  className="ri-emoji-sticker-line text-[20px] text-white hover:text-green-300 cursor-pointer"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                ></i>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 -right-15 scale-75 sm:scale-80 lg:scale-90">
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
                className="flex justify-center items-center w-10 h-10 border rounded-[10px] bg-[#5ad3b7ce] hover:bg-[#5ad3b7ce] transition-colors"
              >
                <i className="ri-send-plane-line text-[20px] text-black"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBotContainer;
