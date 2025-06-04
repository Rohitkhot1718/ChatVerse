import ChatLogo from "../assets/chat.svg";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import getAvatarColor from "../utils/getAvatarColor";

const SideBar = ({ activeTab, onTabChange, isLargeScreen, setShowChat }) => {
  const user = useAuthStore((state) => state.user);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const unreadMessages = useChatStore((state) => state.unreadMessages);

  const handleTabClick = (tab) => {
    onTabChange(tab);

    if (
      !isLargeScreen &&
      (tab === "contacts" || tab === "request" || tab === "bot")
    ) {
      setSelectedUser(null);
    }
  };

  return (
    <div className="bg-[#0d0d0d] w-15 h-svh flex flex-col items-center">
      <div className="lg:m-2 mt-2">
        <img src={ChatLogo} alt="ChatVerse Logo" className="w-12 h-12" />
      </div>
      <div className="h-full flex flex-col justify-between items-center mt-2">
        <ul className="flex flex-col gap-3 list-none p-0">
          <li className="relative">
            <i
              onClick={() => {
                handleTabClick("messages");
              }}
              className={`ri-message-2-line text-2xl p-2 border border-transparent rounded-[10px] cursor-pointer ${
                activeTab === "messages"
                  ? "bg-[#5ad3b7ce] text-black border-current"
                  : "text-white hover:text-black hover:border-current hover:bg-[#5ad3b7ce]"
              }`}
            ></i>
            {Object.values(unreadMessages).reduce((a, b) => a + b, 0) > 0 && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
              </div>
            )}
          </li>
          <li>
            <i
              onClick={() => handleTabClick("contacts")}
              className={`ri-contacts-line text-2xl p-2 border border-transparent rounded-[10px] cursor-pointer ${
                activeTab === "contacts"
                  ? "bg-[#5ad3b7ce] text-black border-current"
                  : "text-white hover:text-black hover:border-current hover:bg-[#5ad3b7ce]"
              }`}
            ></i>
          </li>
          <li>
            <i
              onClick={() => handleTabClick("request")}
              className={`ri-user-add-line text-2xl p-2 border border-transparent rounded-[10px] cursor-pointer ${
                activeTab === "request"
                  ? "bg-[#5ad3b7ce] text-black border-current"
                  : "text-white hover:text-black hover:border-current hover:bg-[#5ad3b7ce]"
              }`}
            ></i>
          </li>
          <li>
            <i
              onClick={() => {
                handleTabClick("bot");
                setShowChat(true);
                setSelectedUser(null);
              }}
              className={`ri-robot-2-line text-2xl p-2 border border-transparent rounded-[10px] cursor-pointer ${
                activeTab === "bot"
                  ? "bg-[#5ad3b7ce] text-black border-current"
                  : "text-white hover:text-black hover:border-current hover:bg-[#5ad3b7ce]"
              }`}
            ></i>
          </li>
        </ul>

        <ul className="flex flex-col gap-3 mb-2 list-none cursor-pointer">
          <div onClick={() => handleTabClick("profile")}>
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
          </div>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
