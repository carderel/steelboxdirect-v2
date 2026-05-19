# Container Decision Engine

An education-first decision engine for shipping container buyers. Helps buyers make informed decisions about size, condition, delivery, and pricing before requesting a quote.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```env
# Supabase (Required)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend Email (Required)
RESEND_API_KEY=your_resend_api_key

# Seller notification email
SELLER_EMAIL=seller@example.com

# Site URL (update when domain is ready)
PUBLIC_SITE_URL=https://example.com
```

## Setup Steps

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Run the contents of `supabase/schema.sql`
4. Copy your project URL and keys from **Settings > API**

### 2. Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key
4. Update the `from` address in `netlify/functions/submit-quote.ts`

### 3. Netlify Deployment

1. Push code to a Git repository
2. Connect repo to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy

## Project Structure

```
├── src/
│   ├── components/         # React components (calculator)
│   ├── layouts/            # Page layouts
│   ├── lib/                # Utilities (attribution, scoring, supabase)
│   ├── pages/              # Astro pages
│   └── styles/             # Global styles
├── netlify/
│   └── functions/          # Serverless functions (form handler)
├── supabase/
│   └── schema.sql          # Database schema
├── public/                 # Static assets
└── .project-catalog/       # Project documentation
```

## Pages (MVP)

| Page | Path | Purpose |
|------|------|---------|
| Homepage | `/` | Decision router |
| Size Guide | `/size/` | Size decision (D1) |
| Calculator | `/size/calculator/` | Interactive size tool |
| Condition Guide | `/condition/` | Condition decision (D2) |
| Delivery Guide | `/delivery/` | Delivery decision (D3) |
| Pricing Factors | `/cost/` | Price expectations (D4) |
| Permits Overview | `/permits/` | Permit concerns (D5) |
| Quote Form | `/quote/` | Conversion |

## Key Features

### Attribution Tracking

First-party tracking via localStorage:
- First touch source/medium
- Landing page
- Pages visited
- Calculator results
- Time on site

All attribution data attached to form submissions.

### Lead Scoring

Automatic scoring based on:
- Size/condition preferences (decisiveness)
- Timeline (urgency)
- Use case (target segment match)
- Site access (delivery feasibility)

### Service Area

Configured for 250-mile radius from Cincinnati. Out-of-area leads flagged but not rejected.

### Database Immutability

Attribution and contact fields are immutable after creation. Only seller-editable fields (status, outcome, notes) can be updated.

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Architecture Decisions

See `.project-catalog/decisions/` for documented decisions:
- MVP constraints
- Segment expansion protocol
- Service area boundaries
- Tech stack rationale
- Lead console architecture

## Content Status

Pages have structural placeholders. Full content development pending.

## License

Private - All rights reserved
