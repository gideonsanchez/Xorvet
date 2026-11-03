# PROJECT FOUNDATION SYSTEM

## STEP 7: DEPLOY AND LAUNCH
### Production Setup, Deployment, Domain, Monitoring and Launch Readiness

Step 7 moves the tested application into production.

Deployment success does not automatically mean launch readiness.

## PRODUCTION SETUP

Verify:

- Hosting
- Database
- Authentication
- API
- Storage
- Payments
- Email
- Notifications
- Domain
- SSL
- PWA where applicable
- Analytics
- Monitoring
- Backups
- Rollback

## ENVIRONMENT VARIABLES

Review every production variable.

Never commit:

- API keys
- Private keys
- Passwords
- Database credentials
- Service role keys
- Payment secrets
- Webhook secrets
- Authentication secrets

If a secret was publicly exposed, rotate it.

## DATABASE

Before production changes:

1. Confirm the production database.
2. Confirm backups/recovery options.
3. Review migrations.
4. Apply migrations carefully.
5. Verify the resulting schema.
6. Test critical queries.

Never casually delete production data.

## AUTHENTICATION

Verify:

- Production domain
- Redirect URLs
- Callback URLs
- OAuth
- Email verification
- Password reset
- Session behavior

## THIRD-PARTY SERVICES

Verify production credentials, URLs, webhooks, security settings and failure behavior.

## DOMAIN AND HTTPS

Verify:

- DNS
- Root domain
- `www` behavior where applicable
- API domain where applicable
- Authentication callbacks
- Payment callbacks
- Webhooks
- HTTPS

Remove production references to localhost and temporary development URLs.

## PWA

Where applicable verify:

- Manifest
- Icons
- Theme
- Start URL
- Display mode
- Service worker
- Caching
- Offline behavior
- Installability
- Update behavior

Do not cache sensitive private data unnecessarily.

## DEPLOYMENT

Run the actual production build.

Then deploy using the project's chosen hosting platform.

After deployment, verify the real production application.

## SMOKE TEST

Create a repeatable production smoke test covering:

- Homepage
- Authentication
- Dashboard
- Core action
- Database
- API
- Payments where applicable
- Notifications where applicable
- Logout

Check browser console and network requests.

## MONITORING

Set up appropriate:

- Error tracking
- Application logs
- Server logs
- Database monitoring
- Uptime monitoring
- Performance monitoring

Do not claim monitoring or backups are active without verification.

## ROLLBACK

Document:

- Current version
- Previous stable version
- Rollback method
- Database considerations
- Responsible person

## REQUIRED DOCUMENTS

Create:

`docs/DEPLOYMENT.md`
`docs/LAUNCH_CHECKLIST.md`
`docs/PRODUCTION_REPORT.md`

## LAUNCH DECISION

Choose:

READY TO LAUNCH
CONDITIONAL LAUNCH
DO NOT LAUNCH

Base the decision on verified production results.

## POST-LAUNCH

After launch, monitor:

- Errors
- Failed requests
- Authentication failures
- Payment failures
- Database errors
- API errors
- User reports
- Performance problems

Then create:

`docs/POST_LAUNCH_REVIEW.md`

## END OF STEP 7

PROJECT FOUNDATION SYSTEM
Version 1.0
Created by No1Vibecoder
