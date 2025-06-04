import { useState } from "react";
import useAuthStore from "../store/authStore";
import axiosInstance from "../axios/axiosInstance";
import toast from "react-hot-toast";
import getAvatarColor from "../utils/getAvatarColor";
import useChatStore from "../store/chatStore";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editBio, setEditBio] = useState(
    user?.bio || "Hey there! I am using ChatVerse"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(URL.createObjectURL(file));
    setPreviewProfile(URL.createObjectURL(file));
    setRemoveProfilePic(false);
    setIsEditing(true);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleRemoveProfilePic = () => {
    setRemoveProfilePic(true);
    setSelectedFile(null);
    setPreviewProfile(null);
  };

  const handleSignOut = () => {
    useAuthStore.getState().signOut();
    localStorage.clear();
  };

  const handleSaveChanges = async () => {
    const formData = new FormData();
    setIsLoading(true);
    if (selectedFile) {
      const file = await fetch(selectedFile).then((r) => r.blob());
      formData.append("profilePic", file);
    }

    if (removeProfilePic) formData.append("removeProfilePic", true);
    formData.append("username", editUsername);
    formData.append("bio", editBio);

    try {
      const response = await axiosInstance.put(
        "/auth/updateProfile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUser({
        ...user,
        username: response.data.username,
        bio: response.data.bio,
        profilePic: response.data.profilePic,
      });

      setIsEditing(false);
      setSelectedFile(null);
      setPreviewProfile(null);
      setRemoveProfilePic(false);
      toast.success("Profile is updated");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`lg:w-[25%] sm:w-full w-svw h-svh bg-[#181818] ${
        selectedUser ? "hidden lg:block" : "md:block"
      }`}
    >
      <div
        className={`relative ${
          isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex justify-between items-center text-white text-[20px] m-4">
          <h4 className="font-bold">Profile</h4>
          <button onClick={handleEditToggle} className="hover:text-green-300">
            <i className={`ri-${isEditing ? "close" : "edit"}-line`}></i>
          </button>
        </div>

        <div className="flex flex-col items-center p-4">
          <div className="relative">
            {!removeProfilePic && (previewProfile || user.profilePic) ? (
              <img
                src={previewProfile || user.profilePic}
                alt={user.username}
                className="w-32 h-32 rounded-full object-cover cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            ) : (
              <div
                onClick={() => setIsOpen(true)}
                className={`w-32 h-32 rounded-full text-white flex items-center justify-center font-semibold 
                  text-7xl uppercase cursor-pointer ${getAvatarColor(
                    user.username
                  )}`}
              >
                {user.username?.[0]}
              </div>
            )}
            {isEditing && (
              <>
                <label className="absolute bottom-0 right-0 bg-[#5ad3b7ce] p-2 rounded-[20px] cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <i className="ri-camera-line text-black"></i>
                </label>
                {(previewProfile || user.profilePic) && !removeProfilePic && (
                  <button
                    onClick={handleRemoveProfilePic}
                    className="absolute top-0 right-0 bg-red-500 p-1 rounded-full text-white hover:bg-red-600"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </>
            )}

            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-full bg-transparent bg-opacity-50 flex items-center justify-center z-50">
                <div className="loader"></div>
              </div>
            )}
          </div>
          {isOpen && (
            <div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="`w-[90vw] h-[90vw] max-w-[400px] max-h-[400px] rounded-xl shadow-xl object-cover"
                    onClick={() => setIsOpen(true)}
                  />
                ) : (
                  <div
                    className={`w-[90vw] h-[90vw] max-w-[300px] max-h-[300px] rounded-xl  text-white flex 
                    items-center justify-center font-semibold text-9xl uppercase lg:text-9xl
                    ${getAvatarColor(user.username)}`}
                  >
                    {user.username?.[0]}
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

          <div className="text-white mt-4 w-full space-y-4">
            <div className="bg-zinc-800 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Username</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full outline-none"
                />
              ) : (
                <p className="font-semibold">{user?.username}</p>
              )}
            </div>

            <div className="bg-zinc-800 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Email</p>
              <p
                className={`font-semibold ${
                  isEditing ? "text-gray-500" : "text-white"
                }`}
              >
                {user?.email}
              </p>
            </div>

            <div className="bg-zinc-800 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Bio</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full outline-none"
                />
              ) : (
                <p className="font-semibold">
                  {user?.bio ? user.bio : "Hey there! I am using ChatVerse"}
                </p>
              )}
            </div>

            <div className="bg-zinc-800 p-3 rounded-lg">
              <p className="text-gray-400 text-sm">Joined</p>
              <p
                className={`font-semibold ${
                  isEditing ? "text-gray-500" : "text-white"
                }`}
              >
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            disabled={isLoading}
            onClick={isEditing ? handleSaveChanges : handleSignOut}
            className={`mt-8 w-full py-2 rounded-lg transition-colors cursor-pointer ${
              isEditing
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            } text-white`}
          >
            {isEditing
              ? isLoading
                ? "Updating..."
                : "Save Changes"
              : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
