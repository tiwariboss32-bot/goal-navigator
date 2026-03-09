import * as paymentService from '../services/paymentService.js';

/**
 * Payment Controller - handles payment verification requests
 * Maps to: POST /api/payment/verify (from verify-payment Edge Function)
 */

export const verify = async (req, res) => {
  try {
    // Placeholder for verify-payment Edge Function
    const { sessionId } = req.body;
    const result = await paymentService.verifyPaymentSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(501).json({ error: error.message });
  }
};