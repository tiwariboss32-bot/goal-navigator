# GoalBuilder Backend

This folder contains the future Node.js backend for GoalBuilder AI.

## Current Production Architecture

- Supabase (database + auth)
- Edge Functions (serverless API)

## Future Migration Target

- Node.js + Express
- PostgreSQL (via Docker)
- REST APIs

## Getting Started (Future)

```bash
cd backend
npm install
docker-compose up -d
npm run dev
```

## Edge Function → Route Migration Map

| Edge Function         | Future Route              | Controller                  |
|-----------------------|---------------------------|-----------------------------|
| goal-chat             | POST /api/goals/chat      | goalsController.chat        |
| create-checkout       | POST /api/checkout        | checkoutController.create   |
| check-subscription    | GET /api/subscription     | subscriptionController.check|
| customer-portal       | POST /api/billing/portal  | billingController.portal    |
| verify-payment        | POST /api/payment/verify  | paymentController.verify    |
| send-reminders        | POST /api/reminders/send  | reminderController.send     |
