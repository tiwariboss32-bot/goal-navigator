import * as billingService from '../services/billingService.js';

/**
 * Billing Controller - handles customer portal requests
 * Maps to: POST /api/billing/portal (from customer-portal Edge Function)
 */

export const portal = async (req, res) => {
  try {
    // Placeholder for customer-portal Edge Function
    const userEmail = req.user?.email;
    const origin = req.headers.origin || req.headers.host;
    const returnUrl = `${origin}/dashboard`;
    const result = await billingService.createPortalSession(userEmail, returnUrl);
    res.json(result);
  } catch (error) {
    console.error('Billing portal error:', error.message);
    res.status(501).json({ error: error.message });
  }
};