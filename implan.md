# Migrate Amit Store to Supabase Backend

Replace the non-functional Google Sheets backend with Supabase (Postgres DB + Auth + Row Level Security). This will give the app real data persistence, proper authentication, and a production-ready backend.

## User Review Required

> [!IMPORTANT]
> **New Supabase Project**: We'll create a project called **"AmitStore"** in your org (amitdriveone01@gmail.com's Org), in the **ap-south-1** (Mumbai) region. Cost: **$0/month** (free tier).

> [!IMPORTANT]
> **Auth change**: We'll switch from hardcoded Zustand users to **Supabase Auth** (email/password). After migration, I'll seed the two default users (admin@amitstore.com / amit@123 and staff@amitstore.com / staff@123) with their roles stored in a profiles table.

## Proposed Changes

### Phase 1 — Supabase Project + Database Schema

Create the Supabase project and apply migrations for:

#### Tables
| Table | Columns | Notes |
|-------|---------|-------|
| profiles | id (FK to auth.users), username, name, role (Owner/Staff) | Auto-created on user signup via trigger |
| categories | id, name, description, low_stock_threshold, color | 6 pre-seeded categories |
| products | id, barcode, name, description, category_id (FK), price, cost_price, quantity, unit, created_at, updated_at | 26 pre-seeded products |
| sales | id, subtotal, discount, total, payment_method, customer_name, created_by (FK), created_at | Tracks who made the sale |
| sale_items | id, sale_id (FK), product_id (FK), product_name, barcode, quantity, unit_price, total | Line items for each sale |
| stock_intakes | id, product_id (FK), product_name, barcode, quantity, cost_price, supplier, created_by (FK), created_at | Stock intake records |

#### Row Level Security (RLS)
- All tables: authenticated users can read
- products, categories: only Owner role can insert/update/delete
- sales, sale_items, stock_intakes: authenticated users can insert; only Owner can delete
- profiles: users can read all, update only their own

#### Database Functions & Triggers
- handle_new_user() trigger: auto-creates a profile row when a new auth user signs up
- complete_sale() RPC function: atomically inserts sale + sale_items + deducts product stock in a transaction
- add_stock_intake() RPC function: atomically inserts intake record + updates product quantity

---

### Phase 2 — Frontend Refactor

#### [NEW] src/lib/supabase.ts 
- Initialize Supabase client with project URL + anon key

#### [MODIFY] src/store/useStore.ts 
- Replace all in-memory/sample data logic with Supabase queries
- login() → supabase.auth.signInWithPassword() 
- logout() → supabase.auth.signOut() 
- fetchInitialData() → fetch categories, products, sales from Supabase
- addProduct(), updateProduct(), deleteProduct() → Supabase CRUD
- addCategory(), updateCategory(), deleteCategory() → Supabase CRUD
- addSale() → call complete_sale RPC
- addStockIntake() → call add_stock_intake RPC
- getTodayStats() → calculate from real sale data with actual cost prices (fix the 20% mock)
- Add Zustand persist middleware for offline caching

#### [DELETE] src/api/sheets.ts 
- Remove Google Sheets API layer entirely

#### [MODIFY] src/sampleData.ts 
- Keep as reference but no longer imported at runtime — data lives in Supabase

#### [MODIFY] package.json 
- Add @supabase/supabase-js dependency

---

### Phase 3 — Seed Data + Fix Remaining Issues

- Seed 6 categories + 26 products + 3 sample sales into Supabase
- Create the two default auth users with profiles
- Fix profit calculation to use actual cost_price 
- Remove the old backend_script.js and sync_demo_data.js files (no longer needed)

---

## Open Questions

> [!IMPORTANT]
> 1. **Region**: I'll use ap-south-1 (Mumbai, India) for lowest latency. OK?
> 2. **Auth emails**: I'll create users as admin@amitstore.com and staff@amitstore.com. Are these OK, or do you want different emails?
> 3. **Should I also fix the other missing UI features** (category modal, date picker for reports, camera scanning, etc.) in this same session, or just focus on the Supabase migration first?

## Verification Plan

### Automated Tests
- Query all tables via MCP to confirm schema + seed data
- Run npm run build to confirm no TypeScript errors
- Launch dev server and test login, CRUD, sales flow in browser

### Manual Verification
- Login with both users → verify role-based behavior
- Add a product → refresh page → confirm it persists
- Complete a sale → check stock deduction + sale record in DB
- Check dashboard stats use real profit from cost prices
 
from this plan i have done 
 we have completed the core "engine" (Database & Store), but the UI still needs to be connected to the new features.

Here is what is yet to be done:

1. Missing UI Modals & Features
Categories Page: Currently, you can't add or edit categories. I need to build the Category Modal with the color picker and threshold settings.
Inventory Page: I need to implement the Delete Product confirmation and Edit Product logic to work with Supabase.
POS Page: The barcode search is missing. I need to add a focusable Barcode Input so you can scan items directly into the cart.
Scanner Page: The camera scanning is still a placeholder; I need to integrate a library like html5-qrcode.
2. Reports & Analytics
Date Selection: The reports are hardcoded to "Today". I need to add a Date Picker or "Range Selector".
Data Visualization: I need to build the Top Selling Items table and ensure profits are calculated using the real cost_price from the DB, not the 20% mock.
3. Polish & Logic
Print Support: Add Print CSS so your sales reports look professional when printed.
Admin Creation: I have prepared the database, but I still need to Invite your admin email through the Supabase Auth system so you can set a password and log in.
Cleanup: I need to delete the old sheets.ts and backend_script.js files that are no longer needed.