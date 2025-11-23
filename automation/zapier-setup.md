# Zapier Integration Setup for eLINE

Alternative to n8n for users who prefer Zapier.

## Available Zaps

### 1. Customer Joins Queue → Add to Google Sheets
**Trigger:** Webhook - New Customer Joins
**Actions:**
1. Add row to Google Sheets with customer data
2. Track all customers for analytics

**Setup:**
- Webhook URL: `https://hooks.zapier.com/hooks/catch/YOUR_ID/`
- Sheet columns: Token, Name, Phone, Service, Join Time, Status

### 2. Service Complete → Send Feedback Email
**Trigger:** Webhook - Service Completed
**Actions:**
1. Wait 5 minutes
2. Send email via Gmail with feedback form link
3. Add to Mailchimp for marketing

### 3. New Customer → Slack Notification
**Trigger:** Webhook - New Customer Pending
**Actions:**
1. Send message to #queue-management channel
2. Include customer details and approve/reject buttons

**Slack Message Format:**
```
🔔 New Customer Waiting
Name: {{customer.name}}
Service: {{service.name}}
Estimated Wait: {{estimatedWait}} min
[Approve] [Reject]
```

### 4. Peak Hours → SMS Alert to Manager
**Trigger:** Schedule - Every hour
**Actions:**
1. Check queue length via API
2. If > 10 people, send SMS to manager
3. Log to Google Sheets

### 5. Customer No-Show → Update CRM
**Trigger:** Webhook - Customer Removed (No-Show)
**Actions:**
1. Update customer record in HubSpot/Salesforce
2. Add "no-show" tag
3. Send re-engagement email after 7 days

### 6. Queue Empty → Post to Social Media
**Trigger:** Schedule - Check every 30 minutes
**Actions:**
1. Check if queue is empty
2. Post to Instagram/Facebook: "No wait time! Walk-ins welcome 🎉"
3. Auto-delete post when queue fills up

## Webhook Configuration

Add these webhooks to your eLINE backend:

```javascript
// In server/index.js

const ZAPIER_WEBHOOKS = {
  customerJoined: process.env.ZAPIER_CUSTOMER_JOINED,
  serviceComplete: process.env.ZAPIER_SERVICE_COMPLETE,
  customerNoShow: process.env.ZAPIER_NO_SHOW
};

async function triggerZapier(webhook, data) {
  if (!webhook) return;
  
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Zapier webhook failed:', error);
  }
}

// Trigger on customer join
app.post('/api/queue/join', async (req, res) => {
  // ... existing code ...
  await triggerZapier(ZAPIER_WEBHOOKS.customerJoined, customer);
});
```

## Environment Variables

Add to your `.env`:
```env
ZAPIER_CUSTOMER_JOINED=https://hooks.zapier.com/hooks/catch/xxxxx/yyyyy/
ZAPIER_SERVICE_COMPLETE=https://hooks.zapier.com/hooks/catch/xxxxx/zzzzz/
ZAPIER_NO_SHOW=https://hooks.zapier.com/hooks/catch/xxxxx/aaaaa/
```

## Testing Zaps

1. Create a test customer in your queue
2. Check Zapier dashboard for webhook receipt
3. Verify actions executed correctly
4. Monitor Zapier task history for errors

## Cost Optimization

- Free tier: 100 tasks/month
- Starter: $19.99/month - 750 tasks
- Professional: $49/month - 2,000 tasks

**Tip:** Combine multiple actions in one Zap to reduce task count.
