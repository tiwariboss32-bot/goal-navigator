import * as checkoutService from '../services/checkoutService.js';

/**
 * Checkout Controller - handles payment checkout requests
 * Maps to: POST /api/checkout (from create-checkout Edge Function)
 */

export const create = async (req, res) => {
  try {
    // Placeholder for create-checkout Edge Function
    const { planKey } = req.body;
    const userInfo = req.user; // Assuming auth middleware
    const result = await checkoutService.createCheckoutSession(planKey, userInfo);
    res.json(result);
  } catch (error) {
    console.error('Checkout creation error:', error.message);
    res.status(501).json({ error: error.message });
  }
};