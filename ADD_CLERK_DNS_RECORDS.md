# 📋 Add Clerk DNS Records in Vercel Dashboard

## Step-by-Step Instructions

### Step 1: Open Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Sign in if needed

### Step 2: Navigate to Domains

1. Look for **"Domains"** in the left sidebar or top menu
2. Click on it
3. Find **"houseiana.net"** in the list
4. Click on **"houseiana.net"**

### Step 3: Add DNS Records

You should see a "DNS Records" section with existing records. Click **"Add"** or **"Add Record"** button.

---

## Records to Add (Copy Exactly)

### Record 1: Email Service

```
Type: CNAME
Name: clkmail
Value: mail.6m21so7f4oe2.clerk.services
TTL: 3600 (or leave default)
```

**Click "Add" or "Save"**

---

### Record 2: DKIM Key 1

```
Type: CNAME
Name: clk._domainkey
Value: dkim1.6m21so7f4oe2.clerk.services
TTL: 3600 (or leave default)
```

**Click "Add" or "Save"**

---

### Record 3: DKIM Key 2

```
Type: CNAME
Name: clk2._domainkey
Value: dkim2.6m21so7f4oe2.clerk.services
TTL: 3600 (or leave default)
```

**Click "Add" or "Save"**

---

## Step 4: Verify Records Were Added

After adding all 3 records, you should see them in the DNS records list:

```
✓ clkmail.houseiana.net → mail.6m21so7f4oe2.clerk.services
✓ clk._domainkey.houseiana.net → dkim1.6m21so7f4oe2.clerk.services
✓ clk2._domainkey.houseiana.net → dkim2.6m21so7f4oe2.clerk.services
```

---

## Step 5: Wait for Propagation (2-5 minutes)

DNS records take a few minutes to propagate. You can:

1. **Go back to Clerk Dashboard** → Domains page
2. **Refresh the page** after 2-3 minutes
3. The records should change from "Unverified" to "Verified"

---

## Step 6: Check Clerk Dashboard

Once DNS propagates (2-5 minutes):

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Go to your Houseiana app → **Domains**
3. All 5 DNS records should show **"Verified"** ✓
4. SSL certificates section should say **"SSL certificates issued"**

---

## 🎯 After DNS is Verified

Once all records show as verified:

1. Wait 5 more minutes for SSL certificates to fully activate
2. Test authentication at https://houseiana.net/sign-up
3. Create a test account
4. **Your site is production ready!**

---

## 📸 What You're Looking For

In Vercel Dashboard DNS Records section, after adding:

```
Type   Name                    Value
─────────────────────────────────────────────────────────────
CNAME  clkmail                 mail.6m21so7f4oe2.clerk.services
CNAME  clk._domainkey          dkim1.6m21so7f4oe2.clerk.services
CNAME  clk2._domainkey         dkim2.6m21so7f4oe2.clerk.services
```

---

## ⏱️ Timeline

- **Add records:** 2 minutes
- **DNS propagation:** 2-5 minutes
- **Clerk verification:** Automatic (refresh page)
- **SSL certificate activation:** 5-10 minutes after verification
- **Total time:** ~10-15 minutes

---

## 🆘 If You Get Stuck

**Can't find Domains section:**
- Try the top navigation menu
- Or go directly to: https://vercel.com/dashboard/domains

**Can't add CNAME records:**
- Make sure you're adding "Name" only (not full domain)
- Use `clkmail` NOT `clkmail.houseiana.net`
- If Vercel auto-adds the domain, that's OK

**Records not verifying in Clerk:**
- Wait 5 minutes
- Check records in Vercel were added correctly
- Refresh Clerk Dashboard page

---

**Go ahead and add those 3 DNS records now!**
