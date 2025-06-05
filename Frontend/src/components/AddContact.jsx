import { useState } from "react";
import axiosInstance from "../axios/axiosInstance";
import { Button } from "./Button";
import { toast } from "react-hot-toast";

const AddContactModal = ({ onClose, onContactAdded }) => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname.trim() || !username.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/contact/addContact", {
        fullname,
        username,
      });

      toast.success("Contact added successfully");
      onContactAdded(res.data);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add contact";
      toast.error(errorMessage);
      console.error("Failed to add contact", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 flex justify-center items-center h-svh w-svw backdrop-blur text-white z-2">
      <form onSubmit={handleSubmit} className="absolute flex flex-col gap-5 bg-[#0d0d0d] w-[80vsw] lg:w-1/3 p-5 rounded-3xl">
        <div className="flex justify-between items-center">
          <h4 className="text-[20px] font-bold">Add Contact</h4>
          <Button onClick={onClose} className="flex justify-center items-center w-10 h-10 border rounded-[10px] bg-[#5ad3b7ce] hover:bg-[#5ad3b7ce] p-0">
            <i className="ri-close-line text-[20px] text-black"></i>
          </Button>
        </div>
        <div className="flex justify-center flex-col gap-5">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-zinc-800 border-zinc-700"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-300 bg-zinc-800 border-zinc-700"
          />
          <Button
            disabled={loading}
            className="w-full bg-[#5ad3b7ce] text-black hover:bg-[#5ad3b7ce] disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddContactModal;
