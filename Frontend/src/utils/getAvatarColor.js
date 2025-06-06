export default function getAvatarColor(username = "") {
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-orange-500",
        "bg-indigo-500",
        "bg-teal-500"
    ];

    if (!username) return colors[0];

    const index = username.toLowerCase().charCodeAt(0) % colors.length;
    return colors[index];
}
