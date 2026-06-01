# Prisan Beauty — Premium Beauty Salon

A full-featured beauty salon booking and content management system built with Next.js 15, designed for Prisan Beauty in Kathmandu.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** JWT (jose) + bcrypt with session cookies
- **Email:** Nodemailer (SMTP)
- **Image Processing:** Sharp
- **Process Manager:** PM2
- **Deployment Output:** Standalone (`output: "standalone"`)

## Features

### Public Pages
- **Home** — Hero section, features, testimonials, CTA
- **Services** — Browse by category (Hair, Nails, Skincare, Makeup, Massage), view details
- **Gallery** — Category-filtered lightbox gallery
- **Blog** — Published posts with detail pages and SEO meta tags
- **FAQ** — Categorized accordion, JSON-LD structured data
- **Booking** — 5-step wizard (Services → Stylist → Date/Time → Info → Confirm)

### Admin Panel (`/admin`)
- **Dashboard** — Stats cards (total, pending, confirmed, completed bookings; active services/stylists) + recent bookings table
- **Bookings** — Full list with status filter, search, and inline status actions; sends email notifications on status change
- **Services** — CRUD with image upload; toggle active/inactive
- **Stylists** — CRUD with image; toggle active/inactive
- **Gallery** — CRUD with category tags; masonry layout
- **Blog** — Full CRUD with published/draft toggle; markdown content; SEO meta fields
- **FAQs** — CRUD with sort order, category grouping, active/hidden toggle
- **SEO Editor** — Per-page meta title, description, keywords, OG image, and Schema.org JSON-LD

### Automated Emails
- Booking confirmation to customer
- New booking notification to admin
- Status update notification to customer

### Image Upload
- Server-side resize via Sharp (max 1200px width, JPEG quality 70)
- Secure file-type validation
- Configurable `UPLOAD_DIR` for production persistence

## Project Structure

```
prisan-beauty/
├── prisma/                  # Database schema & seed
│   ├── schema.prisma
│   └── seed.ts
├── public/                  # Static assets + uploads
│   ├── images/
│   ├── uploads/             # Persistent user uploads
│   └── prisanbeautylogo.png
├── scripts/
│   └── post-build.sh        # Post-build asset bundler for standalone output
├── src/
│   ├── app/
│   │   ├── admin/           # Admin pages (dashboard, bookings, services, stylists, gallery, blog, faqs, seo, login)
│   │   ├── api/upload/      # Image upload API route
│   │   ├── blog/            # Public blog index + detail pages
│   │   ├── booking/         # Booking wizard + confirmation page
│   │   ├── faq/             # Public FAQ page
│   │   ├── gallery/         # Public gallery page
│   │   ├── services/        # Public services listing + detail
│   │   ├── layout.tsx       # Root layout with Navbar/Footer
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Tailwind base styles
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, AdminNav
│   │   ├── ui/              # Button, Card, Input, Modal, Badge, Select, Textarea, Spinner
│   │   └── seo-meta-injector.tsx
│   ├── lib/
│   │   ├── actions.ts       # All server actions (CRUD, bookings, stats)
│   │   ├── auth.ts          # JWT auth, session management, login/logout
│   │   ├── mail.ts          # Email templates (confirmation, admin notification, status update)
│   │   ├── prisma.ts        # Prisma client singleton
│   │   └── utils.ts         # Helpers (cn, formatPrice, formatDate, generateTimeSlots, getStatusColor)
│   ├── middleware.ts         # Route guard for admin pages
│   └── types/index.ts       # TypeScript interfaces
├── ecosystem.config.js       # PM2 configuration
├── next.config.ts            # Next.js config (standalone output, images, server actions)
├── .env                      # Environment variables
└── tailwind.config.ts
```

## Database Schema (PostgreSQL)

| Table          | Key Fields |
|---------------|------------|
| `services`    | id, name, description, price, duration, image, category, active |
| `stylists`    | id, name, bio, image, active |
| `bookings`    | id, customer_name/email/phone, stylist_id, date, time, status, notes |
| `booking_items` | booking_id, service_id |
| `gallery_images` | id, url, caption, category |
| `blog_posts`  | id, title, slug (unique), content, excerpt, image, author, published, meta fields |
| `faqs`        | id, question, answer, category, order, active |
| `seo_meta`    | id, page (unique), title, description, keywords, og_image, schema_json |
| `users`       | id, email (unique), password (bcrypt), name, role |

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env   # Edit DATABASE_URL and SMTP config

# Run database migrations
npx prisma migrate dev

# Seed admin user and initial data
npm run db:seed

# Start dev server on port 3005
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing session JWTs |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | Use TLS (true/false) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `MAIL_FROM` | Sender address for emails |
| `ADMIN_EMAIL` | Email to receive admin notifications |
| `NEXT_PUBLIC_SITE_URL` | Public site URL |
| `UPLOAD_DIR` | Persistent upload directory (production) |

## Deployment (Production on Ubuntu/Nginx)

The application uses Next.js `output: "standalone"` which bundles the server into `.next/standalone/` for self-contained deployment.

### Prerequisites

- Node.js 18+
- PostgreSQL running and accessible
- PM2 (`npm i -g pm2`)
- Nginx (to reverse proxy port 3005)

### Deploy Steps

```bash
cd /home/kswms/apps/prisan

# 1. Install dependencies and build
npm install
npm run build

# 2. Sync production asset directories
rm -rf .next/standalone/public .next/standalone/.next/static
mkdir -p .next/standalone/public
mkdir -p .next/standalone/.next/static
cp -r public/* .next/standalone/public/
cp -r .next/static/* .next/standalone/.next/static/

# 3. Re-link persistent uploads
rm -rf .next/standalone/public/uploads
ln -s /home/kswms/apps/prisan/public/uploads /home/kswms/apps/prisan/.next/standalone/public/uploads

# 4. Restart the process on port 3005
PORT=3005 pm2 restart prisan
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        alias /home/kswms/apps/prisan/.next/static;
        expires 365d;
        access_log off;
    }

    location /uploads {
        alias /home/kswms/apps/prisan/public/uploads;
        expires 30d;
    }
}
```

### Admin Access

Navigate to `/admin/login` and sign in with the seeded admin credentials.
