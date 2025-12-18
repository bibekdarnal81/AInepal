-- Add all services with NPR pricing
-- Approximate conversion rate: 1 USD = 132 NPR

INSERT INTO public.services (
    title,
    slug,
    description,
    price,
    currency,
    icon_name,
    features,
    is_featured,
    is_published,
    display_order
) VALUES 
-- E-Commerce Website
(
    'E-Commerce Website',
    'e-commerce-website',
    'Complete online store solution built for modern businesses ready to sell online. Features secure payment processing, inventory management, and a powerful admin dashboard.',
    132000,
    'NPR',
    'ShoppingCart',
    ARRAY[
        'Product Management',
        'Secure Payment Integration',
        'Admin Dashboard',
        'Responsive Design',
        'Inventory Management',
        'Order Tracking',
        'Customer Management',
        'Analytics & Reports'
    ],
    true,
    true,
    1
),
-- Single Page Website
(
    'Single Page Website',
    'single-page-website',
    'Perfect for businesses, personal brands, or landing pages that need to make a strong first impression with an elegant, scrollable format.',
    26400,
    'NPR',
    'Code',
    ARRAY[
        'Modern Design',
        'SEO Optimized',
        'Contact Forms',
        'Fast Loading',
        'Mobile Responsive',
        'Social Media Integration'
    ],
    false,
    true,
    2
),
-- Blog Website
(
    'Blog Website',
    'blog-website',
    'Modern blog platform with content management system designed for writers, businesses, and content creators with SEO optimization.',
    33000,
    'NPR',
    'Pencil',
    ARRAY[
        'CMS Integration',
        'SEO Ready',
        'Social Sharing',
        'Comment System',
        'Category & Tags',
        'Author Profiles',
        'Rich Text Editor'
    ],
    false,
    true,
    3
),
-- Portfolio Website
(
    'Portfolio Website',
    'portfolio-website',
    'Showcase your work with a stunning portfolio website that highlights your skills and achievements with project galleries and case studies.',
    26400,
    'NPR',
    'Palette',
    ARRAY[
        'Project Galleries',
        'Case Studies',
        'Contact Forms',
        'Professional Design',
        'Image Optimization',
        'Testimonials Section'
    ],
    false,
    true,
    4
),
-- Custom Web Development
(
    'Custom Web Development',
    'custom-web-development',
    'Tailored web solutions for unique business requirements. Complex web applications, API integration, or specialized functionality built from the ground up.',
    198000,
    'NPR',
    'Code',
    ARRAY[
        'Custom Solutions',
        'API Integration',
        'Scalable Architecture',
        'Cloud Deployment',
        'Database Design',
        'Third-party Integrations',
        'Performance Optimization'
    ],
    true,
    true,
    5
),
-- App Development
(
    'App Development',
    'app-development',
    'Native and cross-platform mobile applications for iOS and Android. Full-featured apps with modern UI and seamless performance.',
    264000,
    'NPR',
    'Smartphone',
    ARRAY[
        'iOS & Android',
        'Push Notifications',
        'Offline Support',
        'App Store Deployment',
        'Cross-platform Development',
        'Backend Integration',
        'Real-time Features',
        'Analytics Integration'
    ],
    true,
    true,
    6
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    icon_name = EXCLUDED.icon_name,
    features = EXCLUDED.features,
    is_featured = EXCLUDED.is_featured,
    is_published = EXCLUDED.is_published,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();
