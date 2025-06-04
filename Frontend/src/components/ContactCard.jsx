import axiosInstance from "../axios/axiosInstance";
import { toast } from "react-hot-toast";
import useFriendRequestStore from "../store/friendRequestStore";
import { useEffect } from "react";
import getAvatarColor from "../utils/getAvatarColor";

const ContactCard = ({ contact }) => {
  const friendStatus = useFriendRequestStore((state) => state.friendStatus);
  const contactId = contact?.contactId?._id;

  const status = friendStatus[contactId] || "none";
  useEffect(() => {
    useFriendRequestStore.getState().fetchFriendStatus(contactId);
  }, [contactId]);

  async function handleSendRequest() {
    try {
      const res = await axiosInstance.post("/friend-request/send", {
        receiverUsername: contact.username,
      });
      toast.success("Friend request sent");
      useFriendRequestStore.getState().setFriendStatus(contactId, "pending");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to send friend request"
      );
      console.log(error);
    }
  }
  return (
    <div className="flex  items-center  justify-between hover:bg-zinc-800 hover:rounded-[5px] p-1 m-4 cursor-pointer">
      <div className="flex  items-center ">
        <div className="flex">
          {contact?.contactId?.profilePic ? (
            <img
              src={contact?.contactId?.profilePic}
              alt={contact.username}
              className="w-10 h-10 rounded-[10px] object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-[10px] text-white flex items-center justify-center font-semibold text-lg uppercase ${getAvatarColor(
                contact.username
              )}`}
            >
              {contact.username?.[0]}
            </div>
          )}
        </div>
        <div className="mx-2">
          <p className="text-white text-[16px] font-bold">
            {contact.fullname || contact.username}
          </p>
        </div>
      </div>
      <div>
        {(status === "none" || status === "rejected") && (
          <button onClick={handleSendRequest} className="text-white">
            <i className="ri-user-add-line text-[20px] p-2 hover:text-green-300 cursor-pointer"></i>
          </button>
        )}

        {status === "pending" && (
          <button disabled className="text-gray-400 cursor-not-allowed">
            <i className="ri-user-add-line text-[20px] p-2"></i>
          </button>
        )}

        {status === "accepted" && null}
      </div>
    </div>
  );
};

export default ContactCard;
