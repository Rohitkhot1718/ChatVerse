import FriendRequest from '../model/friendRequest.model.js';
import User from '../model/user.model.js';
import Contact from '../model/contact.model.js';


export async function handleSendFriendRequest(req, res) {
    const { receiverUsername } = req.body;
    const senderId = req.user.id;

    try {
        const receiver = await User.findOne({ username: receiverUsername });
        if (!receiver) return res.status(404).json({ message: "User not found" });

        if (receiver._id.equals(senderId)) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiver._id,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent" });
        }

        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiver._id,
        });

        await newRequest.save();

        res.status(201).json({ message: "Friend request sent", request: newRequest });
    } catch (error) {
        console.error("Friend request error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export async function handleGetRequest(req, res) {
    const currentUserId = req.user.id;

    try {
        const requests = await FriendRequest.find({ receiver: currentUserId, status: 'pending' })
            .populate("sender", "username profilePic");

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}

export async function handleAcceptFriendRequest(req, res) {
    const { requestId } = req.body;

    try {
        const request = await FriendRequest.findById(requestId).populate("sender receiver");

        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        request.status = "accepted";
        await request.save();

        const sender = request.sender;
        const receiver = request.receiver;

        const receiverContact = new Contact({
            userId: receiver._id,
            contactId: sender._id,
            fullname: sender.username,
            username: sender.username,
        });

        await receiverContact.save();

        res.status(200).json({ message: "Friend request accepted", contacts: receiverContact });

    } catch (error) {
        console.error("Accept Friend Request Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

export async function handleRejectFriendRequest(req, res) {
    const { requestId } = req.body
    try {
        const request = await FriendRequest.findById(requestId)
        if (!request) return res.status(404).json({ message: "Request not found" });
        request.status = 'rejected'
        await request.save()
        res.status(200).json({ message: "Friend request rejected", request });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}

export async function handleGetFriendStatus(req, res) {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const request = await FriendRequest.findOne({
        $or: [
            { sender: currentUserId, receiver: targetUserId },
            { sender: targetUserId, receiver: currentUserId },
        ],
    }).sort({ updatedAt: -1 });

    if (!request) {
        return res.json({ userId: targetUserId, status: "none" });
    }

    return res.json({
        userId: targetUserId,
        status: request.status,
    });
};
