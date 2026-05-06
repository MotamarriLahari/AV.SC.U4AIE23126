const getNotifications = require("../services/notificationService");

const priorityMap = {
    Placement: 3,
    Result: 2,
    Event: 1
};

const getTopNotifications = (req, res) => {

    const notifications = getNotifications();

    const unreadNotifications = notifications.filter(
        notification => notification.isRead === false
    );

    unreadNotifications.sort((a, b) => {

        const priorityDifference =
            priorityMap[b.type] - priorityMap[a.type];

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);

    });

    const topNotifications = unreadNotifications.slice(0, 10);

    res.json({
        total: topNotifications.length,
        notifications: topNotifications
    });
};

module.exports = getTopNotifications;