import * as subscriptionService from '../services/subscriptionService.js';

/**
 * Subscription Controller - handles subscription checking requests
 * Maps to: GET /api/subscription (from check-subscription Edge Function)
 */

export const check = async (req, res) => {
  try {
    // Placeholder for check-subscription Edge Function
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const result = await subscriptionService.checkUserSubscription(userId, userEmail);
    res.json(result);
  } catch (error) {
    console.error('Subscription check error:', error.message);
    res.status(501).json({ error: error.message });
  }
};