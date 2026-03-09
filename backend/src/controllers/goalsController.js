import * as goalService from '../services/goalService.js';

/**
 * Goals Controller - handles goal-related HTTP requests
 * Maps to: POST /api/goals/chat (from goal-chat Edge Function)
 */

export const chat = async (req, res) => {
  try {
    // Placeholder for goal-chat Edge Function
    const result = await goalService.processChat(req.body);
    res.json(result);
  } catch (error) {
    console.error('Goal chat error:', error.message);
    res.status(501).json({ error: error.message });
  }
};