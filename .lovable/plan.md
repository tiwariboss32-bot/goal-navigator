
## Add Placeholder Controllers and Services for Backend Scaffold

### Goal
We will expand the `/backend` scaffold by creating placeholder `controller` and `service` files for every existing Supabase Edge Function. This ensures the future Node.js application structure is well-defined and ready for the migration of each specific serverless function.

### Planned Changes

**1. Create Service Files (`backend/src/services/`)**
We will create 6 service files. Each will export a placeholder function that throws a "Not Implemented" error, along with a `TODO` pointing to its corresponding Edge Function:
- `goalService.js` (for `goal-chat`)
- `checkoutService.js` (for `create-checkout`)
- `subscriptionService.js` (for `check-subscription`)
- `billingService.js` (for `customer-portal`)
- `paymentService.js` (for `verify-payment`)
- `reminderService.js` (for `send-reminders`)

*Example Service:*
```javascript
export const processChat = async (data) => {
  // TODO: Migrate logic from supabase/functions/goal-chat
  throw new Error("processChat not implemented yet");
};
```

**2. Create Controller Files (`backend/src/controllers/`)**
We will create 6 controller files mapped to the services. These will match the `Edge Function → Route Migration Map` defined in `backend/README.md`.
- `goalsController.js` (method: `chat`)
- `checkoutController.js` (method: `create`)
- `subscriptionController.js` (method: `check`)
- `billingController.js` (method: `portal`)
- `paymentController.js` (method: `verify`)
- `reminderController.js` (method: `send`)

*Example Controller:*
```javascript
import * as goalService from '../services/goalService.js';

export const chat = async (req, res) => {
  try {
    // Placeholder for goal-chat Edge Function
    const result = await goalService.processChat(req.body);
    res.json(result);
  } catch (error) {
    res.status(501).json({ error: error.message });
  }
};
```

### Safety Rules Assured
- **No Integration:** These changes are strictly within `/backend` and do not touch any frontend code.
- **No Supabase Alteration:** The actual Edge Functions in `supabase/functions` will remain untouched.

Let me know if you approve so I can create these files.
