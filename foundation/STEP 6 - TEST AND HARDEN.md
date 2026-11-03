# PROJECT FOUNDATION SYSTEM

## STEP 6: TEST AND HARDEN
### Quality Assurance, Security, Performance and Production Readiness

The goal of this step is to try to break the MVP before real users do.

Test the actual application, not just whether it compiles.

## TEST

Check:

- PRD requirements
- Main user journeys
- Authentication
- Authorization
- Forms
- Loading states
- Empty states
- Error states
- Database behavior
- API behavior
- File uploads where applicable
- Payments where applicable
- Notifications where applicable
- Responsive behavior
- Keyboard and touch behavior
- Accessibility
- UI consistency
- Iconography
- Production security
- Environment variables
- Performance
- Network failures
- Data integrity
- Browser/device behavior

## SECURITY

Review:

- Authentication
- Authorization
- Database access
- API permissions
- Input validation
- Secret handling
- File uploads
- Payment verification
- Webhooks
- Rate limiting where applicable
- Sensitive data exposure
- Error messages

Do not perform destructive attacks against production.

## COPY AND ICON AUDIT

Remove unnecessary:

- Emojis
- Em dashes `—`
- En dashes `–`
- Excessive ellipses
- Decorative symbols
- AI filler phrases
- Overly enthusiastic copy

Ensure icons use the selected icon system and are accessible.

## ISSUE SEVERITY

P0: Critical
P1: High
P2: Medium
P3: Low

Fix P0 and P1 issues before launch.

## REQUIRED REPORTS

Create:

`docs/TEST_REPORT.md`
`docs/SECURITY_REVIEW.md`
`docs/PERFORMANCE.md`
`docs/ACCESSIBILITY.md`

Use PASS, FAIL, PARTIAL, NOT TESTED or NOT APPLICABLE.

Never mark something PASS without verification.

## FINAL DECISION

Choose:

GO
CONDITIONAL GO
NO-GO

Base the decision on actual test results.

## END OF STEP 6

PROJECT FOUNDATION SYSTEM
Version 1.0
Created by No1Vibecoder
