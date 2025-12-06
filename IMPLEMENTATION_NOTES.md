# GrantHustle - Implementation Notes

## Completed Features (Part 2)

### 1. ✅ Removed SSN/EIN/Last-4 Fields
- Removed from Auth.tsx signup form
- Removed from AuthContext
- Removed from database schema (migration applied)
- No sensitive data is collected anywhere

### 2. ✅ Free Tier Enforcement
- Free users can ONLY see 5 matches per month
- Saved Grants, Templates, Sponsors, LOI, and Win-Rate tabs are completely hidden for free users
- Each pro feature shows upgrade prompt when accessed by free users

### 3. ✅ Application Templates (4 Types)
- Federal/Government grants (Grants.gov style)
- Private Foundation (Common App style)
- Corporate grants
- Arts & Culture grants
- All templates auto-fill from user questionnaire
- **Export to DOCX** using `docx` library (proper Word format)
- Export to PDF (via browser print)

### 4. ✅ Copy Last Application
- Button in template editor
- Shows last 5 submissions
- One-click copy of all fields
- Saves time on repeat applications

### 5. ✅ Fiscal Sponsor Matcher
- 30+ real fiscal sponsors with:
  - Name, location, focus areas
  - Fee ranges (6-12%)
  - Direct apply links
  - Descriptions
- Searchable and filterable
- Pro feature only

### 6. ✅ LOI (Letter of Inquiry) Generator
- 1-2 page professional LOI
- Auto-fills org info from profile
- Customizable project details
- Export to DOCX
- Pro feature only

### 7. ✅ Win-Rate Tracker
- Track submissions by status:
  - Draft
  - Submitted
  - Awarded
  - Rejected
- Shows statistics:
  - Win rate percentage
  - Total awarded amount
  - Pending count
- Edit status with one click
- Pro feature only

### 8. ✅ Calendar Export (iCal)
- Export saved grant deadlines
- Compatible with Google Calendar & Outlook
- One-click download from Saved Grants page

### 9. ✅ FingerprintJS Integration
- Browser fingerprinting implemented
- Database fields added (profiles.browser_fingerprint, abuse_log.browser_fingerprint)
- Ready for anti-abuse checking
- Prevents same user from creating multiple paid accounts

### 10. ✅ Updated Stripe Checkout
- Intro: $9.99/month → $27.99/month recurring: https://buy.stripe.com/eVqeVd2Jh9mf82o7Uf
- Season Pass: $79.99 one-time (4 months): https://buy.stripe.com/aFafZhfw31TNciE8Yj
- Annual: $149.99 one-time (12 months): https://buy.stripe.com/7sY8wP1Fd7e75Ug4I3
- Free: $0 (5 matches/month)

## Not Yet Implemented

### Deadline Reminder Emails & Push Notifications
**Requires:**
- Resend API key (for email sending)
- Supabase Edge Function for cron job
- Push notification service setup (e.g., Firebase Cloud Messaging)

**To implement:**
1. Set up Resend account and get API key
2. Create edge function at `supabase/functions/deadline-reminders/index.ts`
3. Set up cron job to run daily
4. Query saved grants with deadlines in 30/14/7/3/1 days
5. Send emails via Resend API

## Database Schema Updates Applied
- Removed: `ein_hash` from profiles and abuse_log
- Added: `browser_fingerprint` to profiles and abuse_log
- Added to submissions: `template_type`, `target_beneficiaries`, `measurable_outcomes`, `project_duration`

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (Database, Auth, Edge Functions)
- Stripe (Payments)
- FingerprintJS (Anti-abuse)
- docx + file-saver (DOCX export)
- ical-generator (Calendar export)
- Lucide React (Icons)

## Build Status
✅ Project builds successfully
✅ No TypeScript errors
✅ Bundle size: ~707 KB (consider code-splitting for optimization)

## Next Steps for Production
1. Set up Resend for email reminders
2. Create Stripe webhook handler for subscription updates
3. Set up proper error tracking (e.g., Sentry)
4. Add analytics (e.g., PostHog, Plausible)
5. Implement rate limiting on API calls
6. Add comprehensive test coverage
7. Optimize bundle size with code-splitting
8. Set up monitoring for edge functions

## Completed Features (Part 3) - Multi-Source Grant Aggregation System

### 11. ✅ Expanded Grants Database Schema
- Added support for multiple grant data sources (Grants.gov, Candid, Instrumentl, GrantStation, GrantForward, state portals)
- Enhanced metadata fields:
  - Source tracking (source, source_id, source_url, last_synced_at, sync_status)
  - Federal grant metadata (CFDA number, opportunity number, agency codes)
  - Enhanced funding information (total funding, expected awards, cost sharing)
  - Full-text search capability
  - Keywords and categories for better matching
- Created grant_sync_log table to track all sync operations

### 12. ✅ Grants.gov/SAM.gov Integration
- Edge function: `sync-grants-gov`
- Fetches ALL federal grant opportunities from SAM.gov API
- No pagination limit - pulls complete dataset
- Automatic upsert prevents duplicates
- Comprehensive logging of sync operations
- **Requires: SAMGOV_API_KEY environment variable**

### 13. ✅ Candid Foundation Directory Integration
- Edge function: `sync-candid`
- Pulls foundation and private grant data
- Includes subject areas, population groups, geographic restrictions
- Full grant eligibility criteria
- **Requires: CANDID_API_KEY environment variable**

### 14. ✅ Instrumentl Integration
- Edge function: `sync-instrumentl`
- Research and foundation grants
- Detailed funder information and categories
- Project stage matching
- **Requires: INSTRUMENTL_API_KEY environment variable**

### 15. ✅ GrantStation Integration
- Edge function: `sync-grantstation`
- Multi-source grant aggregator data
- Focus areas and target populations
- Geographic restrictions and eligibility
- **Requires: GRANTSTATION_API_KEY environment variable**

### 16. ✅ GrantForward Integration
- Edge function: `sync-grantforward`
- Academic and research opportunities
- Institutional subscriptions supported
- Comprehensive research area categorization
- **Requires: GRANTFORWARD_API_KEY and GRANTFORWARD_INSTITUTION_ID environment variables**

### 17. ✅ State Grant Portals Scraper
- Edge function: `sync-state-portals`
- Integrated state portals:
  - Florida SHARE
  - NY Grants Gateway
  - Texas eGrants
  - California Grants Portal
  - Illinois GATA
  - Pennsylvania eGrants
  - Ohio Grants
  - Michigan Grants
  - Washington Grants Portal
  - Massachusetts Grants
- API-first approach with fallback to web scraping
- Automatic state-specific grant categorization

### 18. ✅ Admin Dashboard
- Real-time grant statistics (total, active, expired)
- Grants by source breakdown
- Manual sync triggers for each data source
- Sync all sources with one click
- Recent sync history with detailed logs
- Shows records processed, created, updated, and failed
- Status indicators (running, completed, failed)
- Error message display for failed syncs
- Auto-refreshes every 10 seconds

### 19. ✅ Enhanced Grant Matching
- Increased return limit from 20 to 10,000 grants for pro users
- Free users still see 5 matches but know 8,000+ are available
- Better messaging about available grant count
- Optimized database queries with proper indexing

## API Keys Required for Full Functionality

To sync grants from all sources, set these environment variables in your Supabase project:

```bash
# Federal Grants
SAMGOV_API_KEY=your_key_here

# Foundation Grants
CANDID_API_KEY=your_key_here

# Research & Academic Grants
INSTRUMENTL_API_KEY=your_key_here
GRANTSTATION_API_KEY=your_key_here
GRANTFORWARD_API_KEY=your_key_here
GRANTFORWARD_INSTITUTION_ID=your_institution_id
```

### Where to Get API Keys:

1. **SAM.gov/Grants.gov**:
   - Free API key: https://sam.gov/content/api-request
   - Documentation: https://open.gsa.gov/api/opportunities-api/

2. **Candid Foundation Directory**:
   - Subscription required: https://candid.org/products/apis
   - Contact: https://candid.org/contact

3. **Instrumentl**:
   - Contact for API access: https://www.instrumentl.com/contact

4. **GrantStation**:
   - Subscription: https://grantstation.com
   - API access via customer support

5. **GrantForward (InfoEd Global)**:
   - Institutional subscription: https://www.grantforward.com
   - Contact for API credentials

## Known Limitations
- Deadline reminders not implemented (needs Resend)
- No Stripe webhook handler yet (subscription updates won't reflect immediately)
- API keys must be configured before syncing works
- State portal scrapers may need updates if portal HTML structures change
- No automatic sync scheduling yet (manual trigger from admin dashboard only)
