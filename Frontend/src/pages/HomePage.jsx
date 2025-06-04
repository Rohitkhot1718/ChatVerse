import { useState, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import ContactList from "../components/ContactList";
import SideBar from "../components/SideBar";
import UserList from "../components/UserList";
import FriendRequestList from "../components/FriendRequest";
import Profile from "../components/Profile";
import ChatBotContainer from "../components/ChatBotContainer";

const useScreenSize = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isLargeScreen;
};

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const isLargeScreen = useScreenSize();
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="flex">
      {(!showChat || isLargeScreen) && (
        <SideBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLargeScreen={isLargeScreen}
          setShowChat={setShowChat}
        />
      )}

      {activeTab === "messages" && <UserList onTabChange={setActiveTab} />}
      {activeTab === "contacts" && <ContactList />}
      {activeTab === "request" && <FriendRequestList />}
      {activeTab === "profile" && <Profile />}
      {activeTab === "bot" && (
        <>
          {isLargeScreen && <UserList onTabChange={setActiveTab} />}
          <ChatBotContainer
            setShowChat={setShowChat}
            isLargeScreen={isLargeScreen}
            onTabChange={setActiveTab}
          />
        </>
      )}
      {(activeTab === "messages" ||
        activeTab === "contacts" ||
        activeTab === "request" ||
        activeTab === "profile") && (
        <ChatContainer
          setShowChat={setShowChat}
          isLargeScreen={isLargeScreen}
        />
      )}
    </div>
  );
};
