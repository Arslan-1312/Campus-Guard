const Notification = require('../models/Notification');
const { emitToUser } = require('./socketHandler');

const createNotification = async (io, { recipient, title, message, type, complaint, link }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      complaint,
      link,
    });

    // Emit real-time notification
    if (io) {
      emitToUser(io, recipient.toString(), 'new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
};

module.exports = { createNotification };
