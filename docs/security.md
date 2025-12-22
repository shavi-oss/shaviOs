# Security Documentation

## CSRF Protection

### Server Actions

Shavi Academy OS relies on **Next.js Server Actions** for form submissions and mutations. Next.js provides built-in CSRF protection for Server Actions by:

1.  **Origin Check**: Verifying the `Origin` and `Host` headers match.
2.  **Same-Site Cookie**: Using strict same-site cookie policies for session tokens.
3.  **Encrypted Closure**: Ensuring action arguments cannot be tampered with.

**Developer Action**: No manual CSRF token generation is required for Server Actions.

### Custom API Routes

For custom API endpoints (e.g., `app/api/...`), standard CSRF protection is **NOT** automatically applied if they are accessed directly from non-browser clients or cross-origin.

- **Webhooks**: Endpoints like `/api/webhooks/nazmly` should use signature verification (HMAC) to validate the sender.
- **REST APIs**: If adding REST endpoints for frontend use, ensure strict CORS checks and consider manual CSRF tokens or restricting methods to GET/OPTIONS where appropriate.

## Authentication

- **Supabase Auth**: All protected routes use `getSession()` or middleware to verify the JWT session.
- **Role-Based Access Control (RBAC)**: Critical actions (Payroll, sensitive Audit logs) explicitly check `session.user.role`.

## Audit Logging

- Critical mutations map to `audit_logs` entries.
- Webhook events are logged to ensure traceability of external data ingress.
