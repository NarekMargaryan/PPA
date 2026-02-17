# Admin Panel Guide

## 🚀 Getting Started

The new Advanced Admin Panel provides a comprehensive content management system with role-based access control, analytics, bulk operations, and more.

### Access

Navigate to: `https://ppa.am/admin`

### Default Accounts

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | ppa2024admin | Super Admin | Full access to all features |
| editor | ppa2024editor | Editor | Edit all content, view analytics |
| smm | ppa2024smm | SMM Manager | Manage announcements only |

**⚠️ Important:** Change these passwords immediately in production!

---

## 🎯 Features

### 1. Image Upload & Management
- **Drag & drop interface** for easy image uploads
- Support for JPG, PNG, WEBP, GIF (up to 5MB)
- Live preview before uploading
- Multi-image support

**Location:** Images Tab

### 2. Bulk Operations
- Select multiple items with checkboxes
- Bulk delete, show/hide, export
- Duplicate content
- Real-time selection counter

**Available in:** Announcements, Courses, FAQ tabs

### 3. Analytics Dashboard
- Real-time visitor statistics
- Page view trends (7-day chart)
- Traffic source breakdown
- Popular pages ranking
- Live visitor count

**Location:** Analytics Tab  
**Access:** Editor role and above

### 4. Search & Filter
- Full-text search across all content
- Filter by content type (Courses, FAQ, Announcements)
- Sort by date, title, or views
- Active filter badges
- Quick clear all filters

**Available in:** All content tabs

### 5. Rich Text Editor
- Full WYSIWYG editing
- Format: headers, bold, italic, lists
- Insert images, videos, links
- Code blocks and quotes
- Customizable toolbar

**Usage:** Available when editing announcement or course details

### 6. Preview Mode
- Device-specific previews (Desktop, Tablet, Mobile)
- Live preview or static preview mode
- Before/After comparison
- Open in new tab for full testing

**Location:** Preview Tab

### 7. User Management (Super Admin Only)
- View all admin users
- See user roles and permissions
- Activity log tracking
- Recent login history

**Location:** Users Tab  
**Access:** Super Admin only

**Permissions:**
- **Super Admin:** Full access to everything
- **Editor:** Edit all content, view analytics
- **SMM Manager:** Only edit/add/delete announcements
- **Viewer:** Read-only access

### 8. Export/Import
- **Export formats:**
  - JSON (complete backup with all data)
  - CSV (announcements only)
- **Import:** 
  - Restore from JSON backup
  - Overwrites existing content (⚠️ use with caution)
- Automatic timestamp in filenames

**Location:** Export Tab

### 9. Multilingual Management
- **Side-by-side editing** for English & Armenian
- **Tab view** for focused editing
- Translation progress tracking
- Copy English to Armenian feature
- Visual completion indicators

**Usage:** Available in all content editing forms

### 10. UI/UX Improvements
- **Modern gradient design** with smooth animations
- **Responsive layout** - works on all devices
- **Dark mode support**
- **Quick Actions dashboard** for common tasks
- **Activity Timeline** showing recent changes
- **Translation Progress** widget
- **System Status** indicators

---

## 📋 Common Tasks

### Adding a New Announcement

1. Go to **Announcements** tab
2. Click **Add Announcement** button
3. Fill in both English and Armenian versions
4. Upload an image (optional)
5. Select category
6. Click **Save**

### Editing Multiple Items

1. Navigate to the relevant tab
2. Check boxes next to items you want to edit
3. Use bulk operation buttons at the top
4. Confirm your action

### Exporting Content

1. Go to **Export** tab
2. Choose format (JSON or CSV)
3. Click export button
4. File downloads automatically with timestamp

### Viewing Analytics

1. Go to **Analytics** tab (Editor+ only)
2. View real-time stats
3. Check traffic sources
4. Monitor popular pages
5. See visitor trends

### Managing Users (Super Admin)

1. Go to **Users** tab
2. View active users and roles
3. Check recent activity log
4. Monitor login history

---

## 🎨 UI Components

### Dashboard (Home Tab)
- Welcome message
- Content statistics (4 stat cards)
- Quick Actions grid (8 shortcuts)
- Activity Timeline
- Translation Progress
- System Status

### Stat Cards
- Total Content count
- Announcements count
- Courses count
- FAQ Items count
- Trend indicators (↑ ↓)

### Quick Actions
- New Announcement
- New Course
- Add FAQ
- Upload Image
- View Analytics
- Preview Site
- Export Data
- Manage Users

### Activity Timeline
- Real-time activity feed
- User actions with timestamps
- Color-coded action types
- Scrollable history (last 100 items)

---

## 🔒 Security

### Role-Based Access Control (RBAC)

| Feature | Super Admin | Editor | SMM | Viewer |
|---------|-------------|--------|-----|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Edit Content | ✅ | ✅ | ❌ | ❌ |
| Edit Courses | ✅ | ✅ | ❌ | ❌ |
| Edit FAQ | ✅ | ✅ | ❌ | ❌ |
| Manage Announcements | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| Export/Import | ✅ | ✅ | ❌ | ❌ |

### Session Management
- Sessions expire after 24 hours of inactivity
- Auto-logout on timeout
- Activity tracking for security audit

---

## 🛠️ Technical Details

### Technology Stack
- **React** + **TypeScript**
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **React Dropzone** for file uploads
- **Recharts** for analytics
- **React Quill** for rich text editing
- **date-fns** for date formatting

### File Structure
```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication & RBAC
├── components/admin/
│   ├── ImageUploader.tsx        # Image upload component
│   ├── AnalyticsDashboard.tsx   # Analytics charts
│   ├── SearchFilter.tsx         # Search & filter component
│   ├── RichTextEditor.tsx       # WYSIWYG editor
│   ├── BulkOperations.tsx       # Bulk action controls
│   ├── ExportImport.tsx         # Data export/import
│   ├── PreviewMode.tsx          # Device preview
│   ├── MultilingualEditor.tsx   # EN/HY side-by-side
│   ├── StatCard.tsx             # Dashboard stat cards
│   ├── QuickActions.tsx         # Quick action buttons
│   └── ActivityTimeline.tsx     # Activity feed
└── pages/
    └── AdminAdvanced.tsx        # Main admin panel
```

### Data Storage
- Content stored in `localStorage` (for demo)
- In production, integrate with your backend API
- Activity log keeps last 100 entries
- Session data persists for 24 hours

---

## 📱 Responsive Design

The admin panel is fully responsive and works on:

- **Desktop:** Full layout with all features
- **Tablet:** Optimized 2-column layout
- **Mobile:** Single column, collapsible navigation

---

## 🐛 Troubleshooting

### Common Issues

**1. Can't login**
- Check username/password (case-sensitive)
- Clear browser cache and localStorage
- Try default credentials

**2. Session expired**
- Login again (sessions last 24 hours)
- Your data is not lost

**3. Image upload fails**
- Check file size (max 5MB)
- Use supported formats: JPG, PNG, WEBP, GIF
- Check browser console for errors

**4. Preview not working**
- Enable "Live Preview" toggle
- Or use "Open in New Tab" button
- Check if website is running

**5. Export button doesn't work**
- Check browser's download settings
- Allow downloads from this site
- Check disk space

---

## 🚀 Future Enhancements

Planned features for future versions:

- [ ] Real backend integration (replace localStorage)
- [ ] Advanced image editing (crop, resize, filters)
- [ ] Scheduled publishing
- [ ] Content versioning / history
- [ ] Email notifications
- [ ] Advanced analytics (Google Analytics integration)
- [ ] SEO scoring and suggestions
- [ ] Automated backups to cloud storage
- [ ] Two-factor authentication (2FA)
- [ ] Webhook integrations

---

## 📞 Support

For questions or issues:

- Email: admin@ppa.am
- Phone: +374 33 52 70 70
- Address: 3 Hakob Hakobyan St, Yerevan

---

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ Complete admin panel redesign
- ✨ Role-based access control
- ✨ Image upload & management
- ✨ Bulk operations
- ✨ Analytics dashboard
- ✨ Search & filter
- ✨ Rich text editor
- ✨ Preview mode
- ✨ Export/Import
- ✨ Multilingual editing
- ✨ Activity timeline
- ✨ UI/UX improvements

### Version 1.0.0
- Basic content management
- Simple admin interface

---

**Made with ❤️ for Pen & Paper Accounting**

