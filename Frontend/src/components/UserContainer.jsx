import useChatStore from "../store/chatStore";
import getAvatarColor from "../utils/getAvatarColor";
import { useEffect } from "react";

export const UserContainer = ({ user, onTabChange }) => {
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const lastMessages = useChatStore((state) => state.lastMessages);
  const unreadMessages = useChatStore((state) => state.unreadMessages);

  const handleSelectUser = () => {
    setSelectedUser(user);
    if (typeof onTabChange === "function") {
      onTabChange("messages");
    } else {
      console.warn("onTabChange is not a function!");
    }
    useChatStore.getState().clearUnreadMessages(user._id);
  };

  useEffect(() => {
    useChatStore.getState().fetchUsers();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      onClick={handleSelectUser}
      className="flex justify-between hover:bg-zinc-800 hover:rounded-[5px] p-1 m-4 cursor-pointer"
    >
      <div className="flex items-center">
        {user.profilePic ? (
          <img
            src={user.profilePic}
            alt={user.username}
            className="w-10 h-10 rounded-[10px] object-cover"
          />
        ) : (
          <div
            className={`w-10 h-10 rounded-[10px] text-white flex items-center justify-center font-semibold text-lg uppercase ${getAvatarColor(
              user.username
            )}`}
          >
            {user.username?.[0]}
          </div>
        )}
        <div className="mx-2">
          <h6 className="text-white text-[16px] font-bold">{user.username}</h6>
          <p className="text-gray-400 text-sm truncate max-w-[150px] flex items-center gap-1">
            {lastMessages[user._id]?.image ? (
              <>
                <i className="ri-image-line"> </i>
                {lastMessages[user._id]?.text
                  ? lastMessages[user._id].text
                  : "Image"}
              </>
            ) : lastMessages[user._id]?.text ? (
              lastMessages[user._id].text
            ) : (
              "No messages yet"
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {unreadMessages[user._id] > 0 && (
          <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadMessages[user._id]}
          </div>
        )}
        {lastMessages[user._id] && (
          <p className="text-sm text-gray-400">
            {formatTime(lastMessages[user._id].createdAt)}
          </p>
        )}
      </div>
    </div>
  );
};
