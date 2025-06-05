import { useEffect, useState } from "react";
import ContactCard from "./ContactCard";
import axiosInstance from "../axios/axiosInstance";
import AddContactModal from "./AddContact";
import useFriendRequestStore from "../store/friendRequestStore";
import useChatStore from "../store/chatStore";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const { fetchFriendStatus } = useFriendRequestStore();
  const selectedUser = useChatStore((state) => state.selectedUser);

  const searchContact = contacts.filter((contact) => {
    const username = contact?.contactId?.username || '';
    return username.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => {
    const updateFriendStatuses = async () => {
        for (const contact of contacts) {
            if (contact?.contactId?._id) {
                await fetchFriendStatus(contact.contactId._id);
            }
        }
    };

    if (contacts.length > 0) {
        updateFriendStatuses();
    }
}, [contacts]);

  const fetchContacts = async () => {
    try {
      const response = await axiosInstance.get("/contact/displayContact");
      setContacts(response.data);
    } catch (error) {
      console.error("Failed to load contacts", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = (newContact) => {
    setContacts((prev) => [...prev, newContact]);
    fetchContacts();
  };

  return (
    <div
      className={`lg:w-[25%] sm:w-full w-svw h-svh bg-[#181818] ${
        selectedUser ? "hidden lg:block" : "md:block"
      }`}
    >
      <div className="flex justify-between items-center text-white text-[20px] m-4">
        <h4 className="font-bold">Contacts</h4>
        <i
          onClick={() => setShowModal(true)}
          className="ri-add-line py-1 px-2 text-white border border-transparent hover:text-black hover:border-current rounded-[10px] hover:bg-[#5ad3b7ce] cursor-pointer"
        ></i>
      </div>
      <div className="m-4">
        <div className="flex justify-between items-center border rounded-[5px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search for message"
            className="px-3 py-2 outline-none border-none text-white bg-transparent"
          />
          <i className="ri-search-2-line text-[20px] p-2 text-white"></i>
        </div>
      </div>

      {showModal && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onContactAdded={handleAddContact}
        />
      )}

      <div className="overflow-y-auto scrollbar-hide">
        {searchContact.length > 0 ? (
          searchContact.map((contact) => (
            <ContactCard key={contact._id} contact={contact} />
          ))
        ) : (
          <p className="text-gray-400 text-center mt-4">No contacts found</p>
        )}
      </div>
    </div>
  );
};

export default ContactList;
