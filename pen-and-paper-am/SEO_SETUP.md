# SEO Setup Guide - Pen & Paper Accounting

This document explains the SEO optimizations implemented on the website and how to configure them.

## 📋 What Has Been Implemented

### 1. **Meta Tags & Open Graph**
- ✅ Dynamic meta tags for all pages (title, description, keywords)
- ✅ Open Graph tags for social media sharing (Facebook, Twitter, LinkedIn)
- ✅ Canonical URLs to prevent duplicate content
- ✅ Language-specific meta tags (English & Armenian)

### 2. **Structured Data (Schema.org)**
- ✅ Organization schema on homepage
- ✅ Course schema for course detail pages
- ✅ FAQ schema on FAQ page
- ✅ Article schema for announcements

### 3. **Technical SEO**
- ✅ `robots.txt` - Configured to allow search engine crawling
- ✅ `sitemap.xml` - XML sitemap with all main pages
- ✅ Semantic HTML structure
- ✅ Mobile-responsive design

### 4. **Analytics**
- ✅ Google Analytics 4 (GA4) integration
- ✅ Automatic page view tracking
- ✅ Custom event tracking helpers

---

## 🚀 Setup Instructions

### Step 1: Configure Google Analytics

1. **Get your GA4 Measurement ID:**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property or select existing one
   - Get your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add to environment variables:**
   - Create a `.env` file in the `pen-and-paper-am` directory
   - Add your GA4 ID:
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Test Analytics:**
   - Run the development server: `npm run dev`
   - Open browser console and check for GA4 events
   - Visit different pages to verify tracking

### Step 2: Update Sitemap

1. **Edit `public/sitemap.xml`:**
   - Domain is set to `https://ppa.am`
   - Update `<lastmod>` dates when content changes
   - Add new announcement URLs as they're created

2. **Submit to Search Engines:**
   - Google Search Console: https://search.google.com/search-console
   - Bing Webmaster Tools: https://www.bing.com/webmasters

### Step 3: Update SEO Component

1. **Edit `src/components/SEO.tsx`:**
   - Update `siteUrl` constant with your actual domain
   - Customize default descriptions and keywords
   - Update default social sharing image

### Step 4: Verify robots.txt

1. **Check `public/robots.txt`:**
   - Verify sitemap URL is correct
   - Ensure admin pages are disallowed from indexing

---

## 📊 Testing & Validation

### Test Meta Tags
1. **Facebook Debugger:** https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator:** https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

### Test Structured Data
1. **Google Rich Results Test:** https://search.google.com/test/rich-results
2. **Schema Markup Validator:** https://validator.schema.org/

### Test Performance
1. **Google PageSpeed Insights:** https://pagespeed.web.dev/
2. **Lighthouse (Chrome DevTools):** Audit tab
3. **GTmetrix:** https://gtmetrix.com/

---

## 🎯 Custom Event Tracking

You can track custom events anywhere in your app:

```typescript
import { trackEvent, trackButtonClick, trackFormSubmit, trackCourseView } from '@/components/GoogleAnalytics';

// Track a custom event
trackEvent('user_signup', { method: 'email' });

// Track button clicks
trackButtonClick('enroll_now', { course: 'advanced' });

// Track form submissions
trackFormSubmit('contact_form', { interest: 'courses' });

// Track course views
trackCourseView('Advanced Track', 'advanced-track');
```

---

## 📝 Best Practices

### 1. **Page Titles**
- Keep under 60 characters
- Include target keywords
- Make unique for each page
- Format: "Page Name | Pen & Paper Accounting"

### 2. **Meta Descriptions**
- Keep between 150-160 characters
- Include call-to-action
- Make unique and compelling
- Include target keywords naturally

### 3. **Keywords**
- Focus on long-tail keywords
- Include location (Armenia, Yerevan)
- Add service-specific keywords
- Avoid keyword stuffing

### 4. **Images**
- Use descriptive alt text
- Compress images (use WebP format)
- Lazy load below-the-fold images
- Include keywords in file names

### 5. **URL Structure**
- Use kebab-case (lowercase with hyphens)
- Keep URLs short and descriptive
- Avoid unnecessary parameters
- Use semantic structure (/courses/advanced-track)

---

## 🔍 Monitoring & Maintenance

### Weekly Tasks
- [ ] Check Google Search Console for errors
- [ ] Monitor search rankings for target keywords
- [ ] Review analytics for traffic patterns

### Monthly Tasks
- [ ] Update sitemap if new pages added
- [ ] Review and update meta descriptions
- [ ] Check for broken links
- [ ] Monitor page load speeds
- [ ] Review top-performing pages

### Quarterly Tasks
- [ ] Conduct keyword research
- [ ] Update content based on performance
- [ ] Review competitor SEO strategies
- [ ] Audit all meta tags and structured data

---

## 🌐 Important URLs to Submit

After deployment, submit these to search engines:

1. **Homepage:** https://ppa.am/
2. **Sitemap:** https://ppa.am/sitemap.xml
3. **Robots.txt:** https://ppa.am/robots.txt

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test with Google's testing tools
4. Review this documentation

For technical support, consult the React, Vite, and Google Analytics documentation.

---

## ✅ SEO Checklist

- [x] Meta tags on all pages
- [x] Open Graph tags
- [x] Structured data (Schema.org)
- [x] robots.txt configured
- [x] sitemap.xml created
- [x] Google Analytics integrated
- [ ] GA4 Measurement ID added to .env
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools
- [ ] Social media meta tags tested
- [ ] Structured data validated
- [ ] Page speed optimized
- [ ] Mobile responsiveness verified
- [ ] SSL certificate installed (HTTPS)

---

**Last Updated:** January 2025

