# 🚀 DEPLOYMENT QUICK START GUIDE

**After Implementation - Step-by-Step Production Deployment**

---

## ⚡ IMMEDIATE ACTIONS (Before Starting Server)

### 1️⃣ Install New Dependencies
```bash
cd backend
npm install
```

**Expected Output:**
```
+ csurf@1.11.0
+ crypto@1.0.1
```

---

### 2️⃣ Run Database Migration Script
```bash
cd backend
node src/scripts/migrateUserData.js
```

**Expected Output:**
```
✅ MongoDB connected for migration
📊 Total users to migrate: X
✅ Migration completed successfully!
   - Users matched: X
   - Users modified: X
✅ Default values set for new fields:
   - Users updated: X
✅ Verification passed: No users have old fields
```

**⚠️ WARNING:** Run this ONCE. Running multiple times is safe but unnecessary.

---

### 3️⃣ Update Environment Variables
**File:** `backend/.env`

**Add/Update:**
```env
# Security (CRITICAL - Generate New)
JWT_SECRET=<run: openssl rand -base64 64>
NODE_ENV=production

# Email Service (TODO - Choose One)
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@meetly.de
SENDGRID_API_KEY=your_api_key_here

# OR use AWS SES
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=eu-central-1

# OR use Gmail (development only)
EMAIL_SERVICE=gmail
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Frontend URL (Production)
CLIENT_URL=https://meetly.de,https://www.meetly.de

# MongoDB (MUST be EU region - Frankfurt/Amsterdam)
MONGO_URI=mongodb+srv://user:pass@cluster.frankfurt.mongodb.net/meetly

# Cloudinary (MUST be EU region - Dublin/Frankfurt)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Generate Secure JWT_SECRET:**
```bash
openssl rand -base64 64
```

---

### 4️⃣ Configure Email Service (TODO)

**Option A: SendGrid (Recommended)**
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API key with "Mail Send" permission
3. Add to `.env`: `SENDGRID_API_KEY=SG.xxx`
4. Create `backend/src/utils/sendEmail.js`:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async ({ email, subject, message }) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject,
    text: message
  };
  await sgMail.send(msg);
};
```

5. Install SendGrid: `npm install @sendgrid/mail`
6. Uncomment email sending in `backend/src/controllers/emailController.js`

**Option B: AWS SES (Cost-Effective)**
```bash
npm install @aws-sdk/client-ses
```

**Option C: Gmail (Development Only)**
```bash
npm install nodemailer
```

---

## 🎨 FRONTEND CHANGES (REQUIRED)

### 1️⃣ CSRF Token Integration
**File:** `src/services/api.ts` (or create if doesn't exist)

```typescript
// Initialize CSRF token on app load
let csrfToken: string | null = null;

export const initializeCsrf = async () => {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    const data = await response.json();
    csrfToken = data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

// Call this in main.tsx or App.tsx
// initializeCsrf();

// Add CSRF token to all state-changing requests
export const api = {
  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || ''
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async put(url: string, data: any) {
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken || ''
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async delete(url: string) {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken || ''
      }
    });
    return response.json();
  }
};
```

**File:** `src/main.tsx`
```typescript
import { initializeCsrf } from './services/api';

// Initialize CSRF token before rendering app
initializeCsrf().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

---

### 2️⃣ Update Registration Form
**File:** `src/app/pages/ProfileSetup.tsx` or `Register.tsx`

**Add Required Consent Checkboxes:**
```tsx
import { Checkbox } from '@/components/ui/checkbox';

const [formData, setFormData] = useState({
  // ... existing fields
  ageVerified: false,
  acceptedTerms: false,
  acceptedPrivacy: false,
  gdprNecessary: false,
  gdprAnalytics: false,
  gdprMarketing: false
});

// In the form JSX:
<div className="space-y-4 border p-4 rounded-lg bg-gray-50">
  <h3 className="font-semibold text-lg">Legal Consent (Required)</h3>
  
  <div className="flex items-start space-x-2">
    <Checkbox 
      id="ageVerified" 
      checked={formData.ageVerified}
      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ageVerified: checked }))}
      required
    />
    <label htmlFor="ageVerified" className="text-sm">
      I confirm that I am <strong>18 years or older</strong> (required by German law - JuSchG) *
    </label>
  </div>

  <div className="flex items-start space-x-2">
    <Checkbox 
      id="acceptedTerms" 
      checked={formData.acceptedTerms}
      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptedTerms: checked }))}
      required
    />
    <label htmlFor="acceptedTerms" className="text-sm">
      I accept the <a href="/terms" target="_blank" className="text-blue-600 underline">Terms of Service</a> (v1.0) *
    </label>
  </div>

  <div className="flex items-start space-x-2">
    <Checkbox 
      id="acceptedPrivacy" 
      checked={formData.acceptedPrivacy}
      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptedPrivacy: checked }))}
      required
    />
    <label htmlFor="acceptedPrivacy" className="text-sm">
      I accept the <a href="/privacy" target="_blank" className="text-blue-600 underline">Privacy Policy</a> (v1.0) *
    </label>
  </div>

  <div className="flex items-start space-x-2">
    <Checkbox 
      id="gdprNecessary" 
      checked={formData.gdprNecessary}
      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprNecessary: checked }))}
      required
    />
    <label htmlFor="gdprNecessary" className="text-sm">
      I consent to processing of my personal data for essential app functionality (GDPR Article 6) *
    </label>
  </div>

  <div className="flex items-start space-x-2">
    <Checkbox 
      id="gdprAnalytics" 
      checked={formData.gdprAnalytics}
      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprAnalytics: checked }))}
    />
    <label htmlFor="gdprAnalytics" className="text-sm">
      I consent to analytics cookies (optional)
    </label>
  </div>

  <div className="flex items-start space-x-2">
    <Checkbox 
      id="gdprMarketing" 
      checked={formData.gdprMarketing}
      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprMarketing: checked }))}
    />
    <label htmlFor="gdprMarketing" className="text-sm">
      I consent to marketing communications (optional)
    </label>
  </div>

  <p className="text-xs text-gray-600">* Required fields</p>
</div>

// In the submit handler:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate required consents
  if (!formData.ageVerified || !formData.acceptedTerms || !formData.acceptedPrivacy || !formData.gdprNecessary) {
    alert('Please accept all required consent checkboxes');
    return;
  }
  
  const registrationData = {
    name: formData.name,
    email: formData.email,
    password: formData.password,
    // ... other fields
    
    // Legal consent
    ageVerified: true,
    acceptedTermsVersion: '1.0',
    acceptedPrivacyVersion: '1.0',
    gdprConsent: {
      necessary: formData.gdprNecessary,
      analytics: formData.gdprAnalytics,
      marketing: formData.gdprMarketing
    }
  };
  
  await api.post('/api/auth/register', registrationData);
};
```

**Remove Old Fields:**
```tsx
// DELETE these form inputs (no longer in User model):
- dateOfBirth
- phoneNumber
- socialMedia (Facebook, Instagram, LinkedIn, etc.)
- relationshipStatus
- occupation
- education
```

---

### 3️⃣ Add Blocking/Reporting UI
**File:** `src/app/components/ReportDialog.tsx` (new component)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { api } from '@/services/api';

export const ReportDialog = ({ targetType, targetId, isOpen, onClose }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason || description.length < 10) {
      alert('Please select a reason and provide a description (minimum 10 characters)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/moderation/reports', {
        targetType,
        targetId,
        reason,
        description
      });
      alert('Report submitted successfully. Our team will review it shortly.');
      onClose();
    } catch (error) {
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="fake_profile">Fake Profile</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="violence">Violence/Threats</SelectItem>
                <SelectItem value="illegal_activity">Illegal Activity</SelectItem>
                <SelectItem value="underage">Underage User</SelectItem>
                <SelectItem value="scam">Scam/Fraud</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Description (10-1000 characters)</label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              minLength={10}
              maxLength={1000}
              rows={5}
              placeholder="Please provide details about this report..."
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

**File:** `src/app/pages/Profile.tsx` (add buttons to user profile)
```tsx
import { ReportDialog } from '@/components/ReportDialog';
import { useState } from 'react';

const [showReportDialog, setShowReportDialog] = useState(false);

// Add buttons to profile page
<div className="flex gap-2">
  <Button 
    variant="destructive"
    onClick={async () => {
      if (confirm('Are you sure you want to block this user?')) {
        await api.post(`/api/moderation/users/${userId}/block`, {
          reason: 'other'
        });
        alert('User blocked successfully');
      }
    }}
  >
    Block User
  </Button>
  
  <Button 
    variant="outline"
    onClick={() => setShowReportDialog(true)}
  >
    Report User
  </Button>
</div>

<ReportDialog 
  targetType="user"
  targetId={userId}
  isOpen={showReportDialog}
  onClose={() => setShowReportDialog(false)}
/>
```

---

## 🗄️ DATABASE SETUP

### MongoDB Atlas Configuration
1. Go to https://cloud.mongodb.com
2. Create cluster in **Frankfurt (eu-central-1)** or **Amsterdam (eu-west-1)** region
3. Add database user with read/write permissions
4. Whitelist IP addresses (or 0.0.0.0/0 for all IPs - not recommended for production)
5. Copy connection string: `mongodb+srv://user:pass@cluster.frankfurt.mongodb.net/meetly`
6. Add to `.env` as `MONGO_URI`

---

## ☁️ CLOUDINARY SETUP

1. Go to https://cloudinary.com
2. Create account
3. In Dashboard → Settings → Storage:
   - Select **Europe (Dublin)** or **Frankfurt** region
4. Copy credentials:
   - Cloud Name
   - API Key
   - API Secret
5. Add to `.env`

---

## 🏢 LEGAL REQUIREMENTS (Germany)

### 1. Business Registration
**Required Before Going Live:**
1. Register at local Gewerbeamt (trade office)
   - Cost: €20-60
   - Duration: Same day
2. Apply for Handelsregister number (if GmbH/UG)
   - Cost: €150-300
   - Duration: 2-4 weeks
3. Apply for Umsatzsteuer-ID (VAT tax ID)
   - Contact: Local Finanzamt
   - Cost: Free
   - Duration: 2-4 weeks

### 2. Update Legal Documents
**Files to Update:**
- `backend/public/legal/impressum.html`
- `backend/public/legal/terms.html`
- `backend/public/legal/privacy.html`

**Impressum Required Information:**
```
Company Name: [Your Business Name]
Legal Form: [e.g., Einzelunternehmen, GmbH, UG]
Address: [Street, Number, Postal Code, City]
Managing Director: [Full Name]
Contact: [Email, Phone]
Register Court: [e.g., Amtsgericht München]
Register Number: [HRB xxxxx]
VAT ID: [DE123456789]
```

**Recommendation:** Hire German lawyer for Terms/Privacy review (€500-€1,500)

---

## 🚀 START SERVER

### Development Mode
```bash
cd backend
npm run dev
```

### Production Mode
```bash
cd backend
npm start
```

**Expected Output:**
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
✅ HTTPS enforcement enabled (production mode)
✅ CSRF protection enabled
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Backend Health Check
```bash
curl https://your-domain.de/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-28T10:30:00.000Z"
}
```

### CSRF Token Test
```bash
curl https://your-domain.de/api/csrf-token -H "Cookie: token=your-jwt-token"
```

**Expected Response:**
```json
{
  "success": true,
  "csrfToken": "xyz123..."
}
```

### HTTPS Redirect Test
```bash
curl -I http://your-domain.de
```

**Expected:** `301 Moved Permanently` → `https://your-domain.de`

---

## 🆘 TROUBLESHOOTING

### Issue: "CSRF token invalid"
**Solution:** Ensure frontend is:
1. Fetching token from `/api/csrf-token`
2. Including token in `X-CSRF-Token` header
3. Sending requests with `credentials: 'include'`

### Issue: "Age verification required"
**Solution:** Ensure registration sends:
```json
{
  "ageVerified": true,
  "acceptedTermsVersion": "1.0",
  "acceptedPrivacyVersion": "1.0",
  "gdprConsent": {
    "necessary": true
  }
}
```

### Issue: "Email verification not working"
**Solution:** 
1. Check email service configuration in `.env`
2. Uncomment email sending in `emailController.js`
3. Install email provider package (SendGrid/AWS SES/Nodemailer)

### Issue: Migration script fails
**Solution:**
1. Check MongoDB connection string in `.env`
2. Ensure database user has read/write permissions
3. Run with verbose logging: `NODE_ENV=development node src/scripts/migrateUserData.js`

---

## 📞 SUPPORT

**German Legal Resources:**
- BfDI (Data Protection): https://bfdi.bund.de
- IHK Legal Advice: https://ihk.de
- GDPR Compliance Guide: https://gdpr.eu

**Technical Support:**
- Backend Issues: Check server logs
- Database Issues: Check MongoDB Atlas logs
- Email Issues: Check SendGrid/AWS SES dashboard

---

**Last Updated:** February 28, 2026  
**Status:** Ready for Deployment ✅
