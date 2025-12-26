# Beautiful Portfolios Feature

## Overview
The Beautiful Portfolios feature allows you to showcase your best work and creative projects on the home page with a beautiful, interactive gallery.

## Features
- ✨ Admin panel for managing portfolios
- 🖼️ Image upload support
- 🏷️ Categories and technologies tagging
- 📱 Responsive grid layout
- 🎨 Hover effects and animations
- 🔗 External project links
- 📊 Display order control
- 👁️ Publish/Draft status
- ⭐ Featured portfolios

## Setup Instructions

### 1. Database Setup
Run the SQL migration to create the portfolios table:

```bash
# If using Supabase CLI
supabase db push

# Or manually execute the SQL in Supabase Dashboard
# Navigate to SQL Editor and run: supabase/migrations/create_portfolios_table.sql
```

### 2. Admin Access
Navigate to `/admin/portfolios` to manage your portfolio items.

### 3. Adding a New Portfolio

1. Go to `/admin/portfolios`
2. Click "New Portfolio"
3. Fill in the details:
   - **Title**: Name of the project
   - **Slug**: URL-friendly identifier (auto-generated from title)
   - **Description**: Brief description of the project
   - **Client Name**: Client or company name (optional)
   - **Category**: Project category (e.g., E-commerce, Corporate, Landing Page)
   - **Portfolio Image**: Upload or provide URL for the project screenshot
   - **Project URL**: Live project link (optional)
   - **Technologies**: Comma-separated list of technologies used
   - **Display Order**: Order in which to show (lower number = higher priority)
   - **Featured**: Mark as featured (optional)
   - **Published**: Publish to make visible on the home page

4. Click "Create Portfolio"

### 4. Home Page Display
The portfolios will automatically appear on the home page in the "Beautiful Portfolios" section, positioned after the Projects section.

- Shows up to 6 published portfolios
- Sorted by display_order (ascending)
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Hover effects reveal "View Live" button

## File Structure

```
app/admin/portfolios/
├── page.tsx           # Portfolio list page
└── new/
    └── page.tsx       # New portfolio form

components/sections/
└── portfolios-section.tsx  # Frontend display component

supabase/migrations/
└── create_portfolios_table.sql  # Database schema
```

## Database Schema

```sql
portfolios (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    client_name TEXT,
    category TEXT,
    technologies TEXT[],
    project_url TEXT,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## Usage Tips

1. **Image Optimization**: Use high-quality images (recommend 1200x900px or 4:3 aspect ratio)
2. **Display Order**: Use increments of 10 (0, 10, 20...) to easily insert items later
3. **Categories**: Keep category names consistent for better organization
4. **Technologies**: List the most important technologies first (only first 3 show on cards)
5. **Featured**: Use sparingly to highlight your best work

## Customization

### Change Number of Portfolios Displayed
Edit `components/sections/portfolios-section.tsx`:
```typescript
.limit(6)  // Change this number
```

### Modify Grid Layout
Edit the grid classes in `portfolios-section.tsx`:
```typescript
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
```

### Styling
All components use Tailwind CSS classes and respect the global theme (dark/light mode).

## Troubleshooting

### Portfolios not showing on home page?
- Check that portfolios are marked as "Published"
- Verify database connection in Supabase
- Check browser console for errors

### Images not loading?
- Ensure image URLs are publicly accessible
- Check CORS settings if using external image hosts
- Verify image upload was successful

### Admin page not accessible?
- Ensure you're authenticated
- Check Row Level Security policies in Supabase
- Verify user has proper permissions

## Support
For issues or questions, check the project documentation or contact the development team.
