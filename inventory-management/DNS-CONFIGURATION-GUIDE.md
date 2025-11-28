# DNS Configuration Guide for Inventory Dashboard

## Deployment Status ✅

The Inventory Management System has been successfully deployed to Vercel:

- **Production URL**: https://inventory-dashboard-pq53q1lp4-devweb3-outlookcoms-projects.vercel.app
- **Target Custom Domain**: https://inventory.adminhouseiana.com
- **Credentials**: Admin1005 / inventory2025

## DNS Configuration Required

The domain `inventory.adminhouseiana.com` has been added to your Vercel project, but DNS records need to be configured at your domain registrar.

### Option 1: Add CNAME Record (Recommended - Easiest)

Go to your domain registrar where `adminhouseiana.com` is registered (GoDaddy, Namecheap, Cloudflare, etc.) and add this DNS record:

**CNAME Record:**
```
Type:    CNAME
Name:    inventory
Value:   cname.vercel-dns.com
TTL:     3600 (or Auto)
```

**Common Registrar Instructions:**

#### GoDaddy:
1. Log into GoDaddy account
2. Go to "My Products" → "Domains"
3. Click on `adminhouseiana.com` → "DNS"
4. Click "Add" → Select "CNAME"
5. Name: `inventory`
6. Value: `cname.vercel-dns.com`
7. TTL: 1 Hour
8. Click "Save"

#### Namecheap:
1. Log into Namecheap account
2. Go to Domain List → `adminhouseiana.com` → "Manage"
3. Click "Advanced DNS"
4. Click "Add New Record"
5. Type: CNAME Record
6. Host: `inventory`
7. Value: `cname.vercel-dns.com`
8. TTL: Automatic
9. Click "Save All Changes"

#### Cloudflare:
1. Log into Cloudflare account
2. Select `adminhouseiana.com`
3. Go to "DNS" tab
4. Click "Add record"
5. Type: CNAME
6. Name: `inventory`
7. Target: `cname.vercel-dns.com`
8. Proxy status: DNS only (gray cloud)
9. Click "Save"

### Option 2: Use Vercel Nameservers (For CLI Management)

If you want to manage DNS via Vercel CLI, transfer your domain's nameservers to Vercel:

1. Go to your domain registrar
2. Update nameservers to Vercel's:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
3. Wait for DNS propagation (24-48 hours)
4. Then you can use Vercel CLI:
   ```bash
   vercel dns add adminhouseiana.com inventory CNAME cname.vercel-dns.com
   ```

### DNS Propagation

- **Time**: 5-30 minutes (can take up to 48 hours)
- **Check Status**: Visit https://dnschecker.org and enter `inventory.adminhouseiana.com`

### Verification

Once DNS is configured, Vercel will automatically:
1. Detect the CNAME record
2. Issue an SSL certificate
3. Enable HTTPS for `https://inventory.adminhouseiana.com`

You can verify the domain is working by visiting:
```
https://inventory.adminhouseiana.com
```

## Current DNS Status

To check if DNS is configured correctly:

```bash
# Check CNAME record
dig inventory.adminhouseiana.com CNAME

# Or use nslookup
nslookup inventory.adminhouseiana.com
```

Expected result: Should point to `cname.vercel-dns.com` or a Vercel IP address.

## Troubleshooting

### Domain shows "This domain is not configured"
- DNS record not added yet
- DNS propagation still in progress
- CNAME record points to wrong value

### SSL Certificate Not Working
- Wait 5-10 minutes after DNS propagation
- Vercel automatically issues Let's Encrypt certificates
- Check Vercel dashboard for certificate status

### 404 Error on Custom Domain
- Clear browser cache
- Try incognito/private browsing
- Verify deployment is successful on Vercel URL first

## Additional Subdomains

If you want to add more subdomains in the future, follow the same process:

```
hr.adminhouseiana.com       → CNAME cname.vercel-dns.com
accountant.adminhouseiana.com → CNAME cname.vercel-dns.com
owner.adminhouseiana.com    → CNAME cname.vercel-dns.com
supervisor.adminhouseiana.com → CNAME cname.vercel-dns.com
```

## Support

If you encounter issues:
1. Check Vercel dashboard: https://vercel.com/dashboard
2. View project domains: https://vercel.com/devweb3-outlookcoms-projects/inventory-dashboard/settings/domains
3. Contact your domain registrar's support for DNS help

---

**Next Steps:**
1. ✅ Deployment completed
2. ⏳ Add DNS CNAME record at your registrar
3. ⏳ Wait for DNS propagation
4. ✅ Access https://inventory.adminhouseiana.com
