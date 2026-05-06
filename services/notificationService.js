const notifications = [
    {
        id: 1,
        type: "Placement",
        message: "Amazon hiring drive announced",
        isRead: false,
        createdAt: "2026-05-01T10:00:00Z"
    },
    {
        id: 2,
        type: "Event",
        message: "Hackathon this weekend",
        isRead: false,
        createdAt: "2026-05-02T08:00:00Z"
    },
    {
        id: 3,
        type: "Result",
        message: "Semester results published",
        isRead: true,
        createdAt: "2026-05-03T09:00:00Z"
    },
    {
        id: 4,
        type: "Placement",
        message: "Microsoft internship opportunity",
        isRead: false,
        createdAt: "2026-05-04T07:00:00Z"
    }
];

const getNotifications = () => {
    return notifications;
};

module.exports = getNotifications;