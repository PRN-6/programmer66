# Live Website System Maintenance & Developer Operations Guide

The **System Maintenance Console** in **programmer66** allows Super Admins to manage site availability, gate visitors, deploy infrastructure updates, and send broadcast alerts across live production environments.

---

## 🔐 Super Admin Authorization

1. Click **Sign In** in the top bar.
2. Select **Developer / Admin Access**.
3. Authorize using the master credentials configured in your `.env` file:
   - `VITE_SUPER_ADMIN_EMAIL` (e.g. `admin@programmer66.com`)
   - `VITE_SUPER_ADMIN_USERNAME` (e.g. `admin`)
   - `VITE_SUPER_ADMIN_PASSWORD` (your private secure admin password)
4. Once authorized, an amber **Admin Profile** badge appears in the top bar with access to the **System Maintenance** console.

---

## 🛠️ Maintenance Policies

| Mode | Impact on Visitors | Super Admin Experience |
|---|---|---|
| **Full Lockdown** | Visitors are blocked by a cybernetic maintenance overlay displaying the reason, estimated duration, and start time. | Super Admin automatically bypasses lockdown and can freely navigate the site with an amber `"Live Maintenance Active"` floating indicator. |
| **Read-Only Sandbox** | Visitors can view the 3D farm, run local Python code, but cloud saving and tournament room creation are temporarily gated. | Unrestricted access. |
| **Warning Banner Only** | The entire site remains operational; displays an urgent amber announcement notice along the top of all visitors' screens. | Unrestricted access. |

---

## 📡 Live Broadcast Alerts

From the System Maintenance Console, admins can type an announcement (e.g. *"Server restarting in 5 minutes for database indexing"*) and click **Send Broadcast**.
- The message is pushed via **Supabase Realtime Broadcast** to all active browser sessions globally in sub-second latency.
- Visitors see a floating notice pill at the top of their screen with an option to dismiss.
- Clicking **Clear Notice** removes the alert for all connected users worldwide.

---

## 🗄️ Database Schema & Zero-Migration Fallback

The maintenance engine uses a dual-tier persistence design:
1. **Primary**: Reads and writes to `public.system_settings` (key: `'maintenance'`).
2. **Automatic Fallback**: If the `system_settings` table has not yet been migrated into your Supabase database, it automatically uses the existing `public.rooms` table (`__system_maintenance__`). This ensures that maintenance controls work out-of-the-box in production without requiring an immediate database migration.

To set up the dedicated table in Supabase SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on system_settings" ON public.system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on system_settings" ON public.system_settings FOR UPDATE USING (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
```

