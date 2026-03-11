# 📋 PRODUCTION DEPLOYMENT CHECKLIST

**Project:** Meetly - Social Connection App  
**Target Launch:** TBD  
**Compliance Requirements:** GDPR, BDSG, TMG §5, TTDSG, DSA, JuSchG  

---

## ✅ PHASE 1: BACKEND IMPLEMENTATION (COMPLETED)

- [x] Install dependencies (csurf, crypto)
- [x] Add CSRF protection middleware
- [x] Add HTTPS enforcement middleware
- [x] Implement age verification system
- [x] Implement email verification system
- [x] Remove excessive data fields (GDPR minimization)
- [x] Add legal consent tracking fields
- [x] Implement GPS precision reduction
- [x] Create user blocking system
- [x] Create content reporting system
- [x] Enhance account deletion (Cloudinary cleanup)
- [x] Protect upload routes with authentication
- [x] Fix GDPR consent validation
- [x] Add password reset functionality
- [x] Create database migration script

---

## 🔄 PHASE 2: FRONTEND INTEGRATION (PENDING)

### Critical Frontend Changes
- [ ] **CSRF Token Integration** (BLOCKER - App won't work without this)
  - [ ] Create `src/services/api.ts` with CSRF token fetching
  - [ ] Call `initializeCsrf()` in `main.tsx` before rendering
  - [ ] Add `X-CSRF-Token` header to all POST/PUT/DELETE/PATCH requests
  - [ ] Test: Verify token is sent with all state-changing requests

### Registration Form Updates
- [ ] **Add Consent Checkboxes** (BLOCKER - Legal requirement)
  - [ ] Age verification checkbox (18+) - required
  - [ ] Terms of Service acceptance - required
  - [ ] Privacy Policy acceptance - required
  - [ ] GDPR necessary consent - required
  - [ ] GDPR analytics consent - optional
  - [ ] GDPR marketing consent - optional
  - [ ] Test: Registration fails if any required checkbox unchecked

- [ ] **Remove Old Form Fields**
  - [ ] Remove dateOfBirth input
  - [ ] Remove phoneNumber input
  - [ ] Remove socialMedia inputs (Facebook, Instagram, etc.)
  - [ ] Remove relationshipStatus dropdown
  - [ ] Remove occupation input
  - [ ] Remove education input
  - [ ] Test: Form submits without these fields

### User Safety Features
- [ ] **Block User Functionality**
  - [ ] Add "Block User" button to profile page
  - [ ] Implement block confirmation dialog
  - [ ] API call: `POST /api/moderation/users/:id/block`
  - [ ] Test: Blocked users can't interact

- [ ] **Report System**
  - [ ] Create `ReportDialog.tsx` component
  - [ ] Add "Report User" button to profile page
  - [ ] Add "Report Event" button to event details
  - [ ] Reason dropdown (10 options)
  - [ ] Description textarea (10-1000 chars)
  - [ ] API call: `POST /api/moderation/reports`
  - [ ] Test: Reports are created successfully

- [ ] **Blocked Users Management**
  - [ ] Create "Blocked Users" page
  - [ ] List all blocked users
  - [ ] Unblock button
  - [ ] API call: `GET /api/moderation/users/blocked`
  - [ ] Test: Users can view and unblock

### Email Verification
- [ ] **Email Verification Flow**
  - [ ] Create `EmailVerification.tsx` page
  - [ ] Add "Verify Email" banner if unverified
  - [ ] Send verification email button
  - [ ] 6-digit code input field
  - [ ] Resend code button (with rate limiting)
  - [ ] API calls: `POST /api/auth/send-verification-email`, `POST /api/auth/verify-email`
  - [ ] Test: Email verification completes successfully

### Password Reset
- [ ] **Forgot Password Flow**
  - [ ] Create "Forgot Password" page
  - [ ] Email input for reset request
  - [ ] 6-digit code input
  - [ ] New password input
  - [ ] API calls: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
  - [ ] Test: Password reset works

---

## 🛠️ PHASE 3: INFRASTRUCTURE SETUP (PENDING)

### Email Service Configuration
- [ ] **Choose Email Provider**
  - [ ] Option A: SendGrid (recommended for production)
  - [ ] Option B: AWS SES (cost-effective)
  - [ ] Option C: Gmail SMTP (development only)

- [ ] **SendGrid Setup** (if chosen)
  - [ ] Create SendGrid account
  - [ ] Generate API key with "Mail Send" permission
  - [ ] Install package: `npm install @sendgrid/mail`
  - [ ] Create `backend/src/utils/sendEmail.js`
  - [ ] Add `SENDGRID_API_KEY` to `.env`
  - [ ] Uncomment email sending in `emailController.js`
  - [ ] Test: Send test email

- [ ] **AWS SES Setup** (if chosen)
  - [ ] Create AWS account
  - [ ] Verify domain in SES
  - [ ] Request production access (exit sandbox)
  - [ ] Install package: `npm install @aws-sdk/client-ses`
  - [ ] Add AWS credentials to `.env`
  - [ ] Test: Send test email

### Database Configuration
- [ ] **MongoDB Atlas Setup**
  - [ ] Create MongoDB Atlas account
  - [ ] Create cluster in **Frankfurt (eu-central-1)** or **Amsterdam (eu-west-1)** region
  - [ ] Create database user with read/write permissions
  - [ ] Whitelist IP addresses
  - [ ] Update `MONGO_URI` in `.env` with EU cluster URL
  - [ ] Test: Connect to database

### Image Storage Configuration
- [ ] **Cloudinary Setup**
  - [ ] Create Cloudinary account
  - [ ] Set storage region to **Europe (Dublin)** or **Frankfurt**
  - [ ] Copy Cloud Name, API Key, API Secret
  - [ ] Update Cloudinary credentials in `.env`
  - [ ] Test: Upload and delete image

### Security Configuration
- [ ] **Environment Variables**
  - [ ] Generate secure JWT_SECRET: `openssl rand -base64 64`
  - [ ] Set `NODE_ENV=production`
  - [ ] Set `CLIENT_URL` to production domain(s)
  - [ ] Verify all secrets are 64+ characters
  - [ ] Test: Server starts with production config

### Domain & SSL
- [ ] **Domain Setup**
  - [ ] Purchase domain (e.g., meetly.de)
  - [ ] Configure DNS A record to point to server IP
  - [ ] Configure DNS AAAA record (IPv6)
  - [ ] Test: Domain resolves correctly

- [ ] **SSL Certificate**
  - [ ] Option A: Let's Encrypt (free, auto-renewal)
  - [ ] Option B: Cloudflare (free, managed)
  - [ ] Option C: Purchase SSL certificate
  - [ ] Install SSL certificate on server
  - [ ] Verify HTTPS redirect works
  - [ ] Test: https://your-domain.de loads correctly

---

## 📄 PHASE 4: LEGAL COMPLIANCE (PENDING)

### Business Registration (Germany)
- [ ] **Register Business**
  - [ ] Visit local Gewerbeamt (trade office)
  - [ ] Submit Gewerbeanmeldung form
  - [ ] Pay registration fee (€20-60)
  - [ ] Receive Gewerbeschein (trade license)
  - [ ] Timeline: Same day

- [ ] **Tax Registration**
  - [ ] Register with Finanzamt (tax office)
  - [ ] Apply for Steuernummer (tax number)
  - [ ] Apply for Umsatzsteuer-ID (VAT ID) if needed
  - [ ] Timeline: 2-4 weeks

- [ ] **Company Formation** (if GmbH/UG)
  - [ ] Hire lawyer/notary
  - [ ] Create company bylaws
  - [ ] Register with Handelsregister (commercial register)
  - [ ] Pay registration fee (€150-300)
  - [ ] Receive HRB number
  - [ ] Timeline: 2-4 weeks

### Legal Documents
- [ ] **Impressum (Legal Notice)**
  - [ ] Fill company name
  - [ ] Fill complete address
  - [ ] Fill managing director name
  - [ ] Fill contact email and phone
  - [ ] Fill Handelsregister number (if applicable)
  - [ ] Fill Umsatzsteuer-ID (VAT ID)
  - [ ] Fill Gerichtsstand (court jurisdiction)
  - [ ] Lawyer review
  - [ ] Publish at `/impressum` route

- [ ] **Terms of Service**
  - [ ] Customize template with company details
  - [ ] Add dispute resolution clause
  - [ ] Add liability limitations
  - [ ] Add content policy
  - [ ] Add account termination rules
  - [ ] Lawyer review (€200-€500)
  - [ ] Set version to 1.0
  - [ ] Publish at `/terms` route

- [ ] **Privacy Policy**
  - [ ] Customize template with company details
  - [ ] List all data collected (name, email, city, etc.)
  - [ ] Explain data usage purposes
  - [ ] List third-party processors (MongoDB, Cloudinary, SendGrid)
  - [ ] Add GDPR rights information (access, erasure, portability)
  - [ ] Add cookie policy
  - [ ] Add data retention periods
  - [ ] Lawyer review (€200-€500)
  - [ ] Set version to 1.0
  - [ ] Publish at `/privacy` route

- [ ] **Cookie Banner**
  - [ ] Implement cookie consent banner
  - [ ] Categorize cookies (necessary, analytics, marketing)
  - [ ] Allow granular consent
  - [ ] Store consent in database
  - [ ] Respect Do Not Track (DNT)
  - [ ] Test: Banner appears on first visit

### Lawyer Review
- [ ] **Find German IT Lawyer**
  - [ ] Specialization: GDPR, BDSG, TMG compliance
  - [ ] Request quote (expected: €500-€1,500 for full review)
  - [ ] Timeline: 1-2 weeks

- [ ] **Documents for Review**
  - [ ] Submit Impressum draft
  - [ ] Submit Terms of Service draft
  - [ ] Submit Privacy Policy draft
  - [ ] Submit Cookie Policy draft
  - [ ] Request review of consent checkboxes
  - [ ] Request review of data processing activities

- [ ] **Implement Lawyer Feedback**
  - [ ] Update legal documents per recommendations
  - [ ] Fix any compliance issues identified
  - [ ] Increment version numbers if significant changes
  - [ ] Update consent tracking in database

---

## 🗄️ PHASE 5: DATABASE MIGRATION (PENDING)

- [ ] **Backup Database**
  - [ ] Create MongoDB Atlas snapshot
  - [ ] Export database to JSON (backup)
  - [ ] Verify backup integrity

- [ ] **Run Migration Script**
  - [ ] Connect to production database
  - [ ] Run: `node src/scripts/migrateUserData.js`
  - [ ] Verify output: All users migrated
  - [ ] Verify: No old fields remain

- [ ] **Post-Migration Verification**
  - [ ] Check user count matches
  - [ ] Spot-check 5-10 user documents
  - [ ] Verify new fields have default values
  - [ ] Test user login/registration

---

## 🧪 PHASE 6: TESTING (PENDING)

### Backend API Testing
- [ ] **Authentication Tests**
  - [ ] Register with valid consent → success
  - [ ] Register without age verification → fail
  - [ ] Register without Terms consent → fail
  - [ ] Register without GDPR consent → fail
  - [ ] Login with correct credentials → success
  - [ ] Login with wrong credentials → fail

- [ ] **CSRF Protection Tests**
  - [ ] GET request without token → success
  - [ ] POST request without token → fail (403 Forbidden)
  - [ ] POST request with valid token → success
  - [ ] POST request with expired token → fail

- [ ] **Age Verification Tests**
  - [ ] Access protected route without age verification → fail
  - [ ] Access protected route with age verification → success

- [ ] **Email Verification Tests**
  - [ ] Send verification email → code generated
  - [ ] Verify with correct code → success
  - [ ] Verify with wrong code → fail
  - [ ] Verify with expired code → fail

- [ ] **GPS Privacy Tests**
  - [ ] Create event with coordinates → coordinates rounded to 3 decimals
  - [ ] Update event with coordinates → coordinates rounded to 3 decimals

- [ ] **Blocking Tests**
  - [ ] Block user → success
  - [ ] Block same user again → fail (already blocked)
  - [ ] Unblock user → success
  - [ ] Get blocked users list → returns all blocked users

- [ ] **Reporting Tests**
  - [ ] Create report → success
  - [ ] Create duplicate report within 24h → fail
  - [ ] Get my reports → returns user's reports
  - [ ] Update report status (admin) → success

- [ ] **Account Deletion Tests**
  - [ ] Delete account without password → fail
  - [ ] Delete account with wrong password → fail
  - [ ] Delete account with correct password → success
  - [ ] Verify Cloudinary images deleted
  - [ ] Verify all user data removed from database

- [ ] **GDPR Data Export Tests**
  - [ ] Export data → returns complete JSON
  - [ ] Verify all personal data included
  - [ ] Verify old fields NOT included
  - [ ] Verify export is machine-readable

### Frontend Testing
- [ ] **Registration Flow**
  - [ ] All consent checkboxes visible
  - [ ] Required checkboxes prevent submission
  - [ ] Old fields (dateOfBirth, etc.) not present
  - [ ] Form submits successfully
  - [ ] CSRF token included in request

- [ ] **CSRF Integration**
  - [ ] Token fetched on app load
  - [ ] Token included in all POST/PUT/DELETE requests
  - [ ] Requests work without errors

- [ ] **Blocking UI**
  - [ ] Block button visible on profile
  - [ ] Block confirmation dialog appears
  - [ ] User blocked successfully
  - [ ] Blocked users list shows all blocks

- [ ] **Reporting UI**
  - [ ] Report button visible
  - [ ] Report dialog opens
  - [ ] All reason options present
  - [ ] Description validation works
  - [ ] Report submitted successfully

- [ ] **Email Verification UI**
  - [ ] Verification banner shows if unverified
  - [ ] Send email button works
  - [ ] Code input works
  - [ ] Resend button works (with cooldown)

### Security Testing
- [ ] **Penetration Testing**
  - [ ] SQL injection attempts → blocked
  - [ ] NoSQL injection attempts → blocked
  - [ ] XSS attempts → blocked
  - [ ] CSRF attacks → blocked
  - [ ] Click-jacking attempts → blocked

- [ ] **Performance Testing**
  - [ ] Load test: 100 concurrent users → stable
  - [ ] Rate limiting works (429 Too Many Requests)
  - [ ] Database queries optimized (indexes used)

---

## 🚀 PHASE 7: DEPLOYMENT (PENDING)

### Pre-Deployment
- [ ] **Code Review**
  - [ ] No console.log() in production code
  - [ ] No TODO comments for critical features
  - [ ] All environment variables configured
  - [ ] Error handling covers edge cases

- [ ] **Documentation**
  - [ ] API documentation complete
  - [ ] README updated
  - [ ] Deployment guide ready
  - [ ] User documentation written

### Deployment
- [ ] **Server Setup**
  - [ ] Choose hosting provider (AWS, DigitalOcean, Railway, etc.)
  - [ ] Provision server instance
  - [ ] Install Node.js (v18+)
  - [ ] Install PM2 or similar process manager
  - [ ] Configure firewall (allow ports 80, 443)
  - [ ] Set up reverse proxy (Nginx/Caddy)

- [ ] **Deploy Backend**
  - [ ] Clone repository to server
  - [ ] Install dependencies: `npm install --production`
  - [ ] Copy `.env` file with production values
  - [ ] Run migration script
  - [ ] Start server: `pm2 start src/server.js --name meetly-api`
  - [ ] Verify health check: `curl https://api.meetly.de/health`

- [ ] **Deploy Frontend**
  - [ ] Build production bundle: `npm run build`
  - [ ] Upload build files to CDN/hosting
  - [ ] Configure environment variables
  - [ ] Test production build locally first
  - [ ] Deploy to production

### Post-Deployment
- [ ] **Monitoring Setup**
  - [ ] Set up error tracking (Sentry, LogRocket)
  - [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
  - [ ] Set up performance monitoring (New Relic, DataDog)
  - [ ] Configure alerts for critical errors

- [ ] **Verification**
  - [ ] Test all critical flows end-to-end
  - [ ] Check SSL certificate validity
  - [ ] Verify HTTPS redirect works
  - [ ] Check legal pages load correctly
  - [ ] Test CSRF protection works
  - [ ] Test registration flow
  - [ ] Test login flow

---

## 📊 PROGRESS TRACKER

| Phase | Status | Completion % | Blocker? |
|-------|--------|--------------|----------|
| Phase 1: Backend Implementation | ✅ Done | 100% | No |
| Phase 2: Frontend Integration | ⏹️ Pending | 0% | **YES** |
| Phase 3: Infrastructure Setup | ⏹️ Pending | 0% | **YES** |
| Phase 4: Legal Compliance | ⏹️ Pending | 0% | **YES** |
| Phase 5: Database Migration | ⏹️ Pending | 0% | No |
| Phase 6: Testing | ⏹️ Pending | 0% | No |
| Phase 7: Deployment | ⏹️ Pending | 0% | No |

**Overall Progress: 14% (1/7 phases complete)**

---

## 🚨 CRITICAL BLOCKERS (Must Complete Before Launch)

1. **CSRF Token Integration** (Frontend)
   - App will not work without CSRF tokens
   - Estimated time: 2 hours

2. **Consent Checkboxes** (Frontend)
   - Legal requirement - cannot launch without
   - Estimated time: 3 hours

3. **Email Service Configuration** (Infrastructure)
   - Required for email verification and password reset
   - Estimated time: 1 hour

4. **Legal Documents** (Legal)
   - Impressum must be filled with real company data
   - Terms/Privacy must be reviewed by lawyer
   - Estimated time: 1-2 weeks (external dependency)

5. **Business Registration** (Legal)
   - Cannot operate without trade license (Gewerbeschein)
   - Estimated time: 1 day + 2-4 weeks for tax ID

---

## 📅 ESTIMATED TIMELINE

| Milestone | Duration | Dependencies |
|-----------|----------|--------------|
| Frontend Integration | 2-3 days | Backend complete ✅ |
| Infrastructure Setup | 1 day | None |
| Legal Compliance | 2-4 weeks | Lawyer availability |
| Database Migration | 1 hour | Database backup |
| Testing | 3-5 days | All above complete |
| Deployment | 1-2 days | Testing complete |

**Total Estimated Time to Launch: 4-6 weeks**  
(Assumes lawyer review takes 2-4 weeks)

---

## ✅ LAUNCH READINESS CRITERIA

Before announcing public launch:
- [ ] All critical blockers resolved
- [ ] All phases 1-7 complete
- [ ] SSL certificate valid
- [ ] Legal documents lawyer-approved
- [ ] Business registered with Gewerbeamt
- [ ] Email service operational
- [ ] All tests passing
- [ ] Error monitoring active
- [ ] Backup system configured
- [ ] Support email active

---

**Last Updated:** February 28, 2026  
**Next Review:** After Phase 2 completion  
**Responsible:** Development Team + Legal Counsel
