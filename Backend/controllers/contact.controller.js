import Contact from '../model/contact.model.js'
import User from '../model/user.model.js'

export async function handleAddContact(req, res) {

    const { fullname, username } = req.body
    const currentUserId = req.user.id

    try {
        const user = await User.findOne({ username })
        if (!user) return res.status(404).json({ message: "User not found" })

        if (user._id.equals(currentUserId)) return res.status(400).json({ message: "You cannot add yourself." });

        const existingContact = await Contact.findOne({
            userId: currentUserId,
            contactId: user._id,
        });

        if (existingContact) return res.status(400).json({ message: "Contact already added." });

        const contact = new Contact({
            userId: currentUserId,
            contactId: user._id,
            fullname,
            username
        });
        await contact.save();
        res.status(201).json({ message: "Contact added successfully", contact });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}

export async function handleGetContacts(req, res) {
    try {
        const currentUserId = req.user.id;

        const contacts = await Contact.find({ userId: currentUserId }).populate(
            "contactId",
            "profilePic"
        );

        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
