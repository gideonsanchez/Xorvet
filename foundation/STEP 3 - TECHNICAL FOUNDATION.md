# PROJECT FOUNDATION SYSTEM

## STEP 3: TECHNICAL FOUNDATION
### Turn the Product Requirements Into a Concrete Technical Plan

Read:

`docs/PROJECT_BRIEF.md`
`docs/PRD.md`

Do not begin full implementation.

Your job is to decide and document how the product should be technically structured.

Do not choose technologies simply because they are popular. Prefer the simplest stack that
can correctly support the product requirements.

## 1. STACK DECISION

Define:

- Frontend framework
- Language
- Backend approach
- Database
- Authentication
- Styling
- Component system
- State management where needed
- File storage
- Hosting
- Deployment
- Testing
- Monitoring
- Other required services

For each major decision explain why it fits the project.

## 2. ARCHITECTURE

Define:

- Application boundaries
- Frontend/backend relationship
- Data flow
- Authentication flow
- API boundaries
- External services
- Important security boundaries

Avoid unnecessary complexity.

## 3. PROJECT STRUCTURE

Create a proposed file and folder structure.

Example:

```text
project/
├── docs/
├── src/
├── public/
├── tests/
├── ...
```

The structure must match the selected framework and project needs.

Do not create folders just for the sake of having folders.

## 4. DATABASE FOUNDATION

Translate the PRD data requirements into a database plan.

Define:

- Tables/entities
- Important fields
- Primary keys
- Foreign keys
- Relationships
- Constraints
- Indexes where justified
- Ownership
- Security policies
- Important lifecycle rules

Do not add unnecessary tables.

Create:

`docs/DATABASE.md`

## 5. API FOUNDATION

Where an API exists, define:

- Routes
- Methods
- Authentication
- Authorization
- Request shape
- Response shape
- Validation
- Errors
- Rate limits where relevant

Create:

`docs/API.md`

## 6. DESIGN SYSTEM

Translate the product and brand requirements into a usable design system.

Define:

- Color tokens
- Typography
- Spacing
- Border radius
- Shadows
- Layout
- Breakpoints
- Buttons
- Inputs
- Cards
- Modals
- Navigation
- Feedback states
- Loading states
- Empty states
- Error states
- Icon library
- Icon sizes
- Icon weight/style

Use a consistent icon system.

Do not use emojis as UI icons.

Do not mix random icon libraries.

Create:

`docs/DESIGN_SYSTEM.md`

## 7. RESPONSIVE FOUNDATION

Define how the interface behaves across:

- Mobile
- Tablet
- Desktop
- Large screens

Do not design only for desktop.

## 8. AUTHENTICATION ARCHITECTURE

Document:

- Authentication provider
- Session strategy
- Protected routes
- User roles
- Authorization
- OAuth callbacks where applicable
- Password reset
- Email verification

## 9. SECURITY FOUNDATION

Document:

- Secret handling
- Environment variables
- Server/client boundaries
- Input validation
- Authorization
- Database policies
- File security
- Payment verification
- Webhook security
- Sensitive data handling

Never place secrets in source code.

## 10. THIRD-PARTY SERVICES

Document each external service and:

- Why it is needed
- What it connects to
- Credentials required
- Production considerations
- Failure behavior

## 11. ENVIRONMENT CONFIGURATION

Define:

- Development environment
- Preview/staging environment where needed
- Production environment
- Environment variables
- `.env.example`

Never include real secrets in the repository.

## 12. TESTING FOUNDATION

Define:

- Unit testing
- Integration testing
- End-to-end testing
- Type checking
- Linting
- Build checks

Only include testing tools that fit the project.

## 13. DEPLOYMENT FOUNDATION

Define:

- Hosting
- Database deployment
- Environment configuration
- Domain
- SSL
- CI/CD where needed
- Production build
- Rollback approach

## 14. CREATE ARCHITECTURE DOCUMENT

Create:

`docs/ARCHITECTURE.md`

Include:

- Stack
- Architecture
- Project structure
- Data flow
- Security boundaries
- Deployment approach
- Major technical decisions

## 15. TECHNICAL GAP CHECK

Before finishing, identify:

- Missing technical decisions
- Conflicting requirements
- Unsupported requirements
- Over-engineered areas
- Security risks
- Scalability concerns
- Unnecessary dependencies

Do not silently make major decisions.

## 16. FINAL FOUNDATION

The final output should contain:

- Architecture
- Stack
- Project structure
- Database plan
- API plan
- Design system
- Authentication architecture
- Security foundation
- Environment setup
- Testing foundation
- Deployment foundation
- Open technical decisions

Do not build the application yet.

## END OF STEP 3

PROJECT FOUNDATION SYSTEM
Version 1.0
Created by No1Vibecoder
