import { useEffect, useState } from "react";
import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-hot-toast";
import useFriendRequestStore from "../store/friendRequestStore";
import getAvatarColor from "../utils/getAvatarColor";
import useChatStore from "../store/chatStore";


const FriendRequestList = () => {
  const [requests, setRequests] = useState([]);
  const selectedUser = useChatStore((state) => state.selectedUser);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get("/friend-request/incoming");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching friend requests", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [requests]);

  const handleAccept = async (requestId) => {
    try {
      await axiosInstance.post("/friend-request/accept", { requestId });
      toast.success("Friend request accepted");
      fetchRequests();
      useFriendRequestStore.getState().setFriendStatus(requestId, "accepted");
    } catch (err) {
      console.error("Error accepting request", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axiosInstance.post("/friend-request/reject", { requestId });
      toast.success("Friend request rejected");
      fetchRequests();
      useFriendRequestStore.getState().setFriendStatus(requestId, "rejected");
    } catch (err) {
      console.error("Error rejecting request", err);
    }
  };

  return (
    <div className={`lg:w-[25%] sm:w-full w-svw h-svh bg-[#181818]  ${
        selectedUser ? "hidden lg:block" : "md:block"
      }`}>
      <div className="flex justify-between items-center text-white text-[20px] m-4">
        <h4 className="font-bold">Friend Request</h4>
        <i className="ri-chat-new-line py-1 px-2 text-white border border-transparent hover:text-black hover:border-current rounded-[10px] hover:bg-[#5ad3b7ce] cursor-pointer"></i>
      </div>
      <div className="overflow-y-auto scrollbar-hide">
        {requests.length === 0 ? (
          <p className="text-gray-400 text-center mt-4">No incoming requests</p>
        ) : (
          requests.map((request, index) => (
            <div
              key={index}
              className="flex justify-between items-center hover:bg-zinc-800 hover:rounded-[5px] p-1 m-4 cursor-pointer"
            >
              <div className="flex items-center">
                {user.profilePic ? (
                  <img
                    src={request.sender.profilePic}
                    alt={user.username}
                    className="w-10 h-10 rounded-[10px] object-cover"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold text-lg uppercase ${getAvatarColor(
                      user.username
                    )}`}
                  >
                    {user.username?.[0]}
                  </div>
                )}
                <div className="mx-2">
                  <h6 className="text-white text-[16px] font-bold">
                    {request.sender.username}
                  </h6>
                </div>
              </div>
              <div className="flex gap-2 font-bold">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="bg-[#5ad3b7ce] px-3 py-1 rounded hover:bg-[#5ad3b7ce] cursor-pointer"
                >
                  ✓
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="bg-red-300 px-3 py-1 rounded hover:bg-red-400 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendRequestList;
