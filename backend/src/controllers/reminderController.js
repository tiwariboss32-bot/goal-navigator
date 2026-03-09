import * as reminderService from '../services/reminderService.js';

/**
 * Reminder Controller - handles reminder sending requests
 * Maps to: POST /api/reminders/send (from send-reminders Edge Function)
 */

export const send = async (req, res) => {
  try {
    // Placeholder for send-reminders Edge Function
    const result = await reminderService.sendReminders();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Reminder sending error:', error.message);
    res.status(501).json({ error: error.message });
  }
};