import { useEffect, useState } from "react";
import { UserContainer } from "./UserContainer";
import useChatStore from "../store/chatStore";

const UserList = ({ onTabChange }) => {
  const { users, fetchUsers } = useChatStore();
  const [search, setSearch] = useState("");
  const selectedUser = useChatStore((state) => state.selectedUser);

  const searchUser = users.filter((user) => {
    const username = user?.username || "";
    return username.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      className={`lg:w-[25%] sm:w-full w-svw h-svh bg-[#181818] ${
        selectedUser ? "hidden lg:block" : "md:block"
      }`}
    >
      <div className="flex justify-between items-center text-white text-[20px] m-4">
        <h4 className="font-bold">Chats</h4>
        <i className="ri-chat-new-line py-1 px-2 text-white border border-transparent hover:text-black hover:border-current rounded-[10px] hover:bg-[#5ad3b7ce] cursor-pointer"></i>
      </div>
      <div className="m-4">
        <div className="flex justify-between items-center border rounded-[5px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search for message"
            className="px-3 py-2 outline-none border-none text-white"
          />
          <i className="ri-search-2-line text-[20px] p-2 text-white"></i>
        </div>
      </div>
      <div className="overflow-y-auto scrollbar-hide">
        {searchUser.length > 0 ? (
          searchUser.map((user) => (
            <UserContainer
              key={user._id}
              user={user}
              onTabChange={onTabChange}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center mt-4">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserList;
