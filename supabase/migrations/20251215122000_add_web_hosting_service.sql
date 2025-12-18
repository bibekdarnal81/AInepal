-- Add Web Hosting service
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
) VALUES (
    'Web Hosting',
    'web-hosting',
    'Reliable and fast web hosting solutions with 99.9% uptime guarantee. Get your website online with our managed hosting service, including SSL certificate, daily backups, and 24/7 support.',
    50,
    'USD',
    'Server',
    ARRAY[
        '99.9% Uptime Guarantee',
        'Free SSL Certificate',
        'Daily Automatic Backups',
        'Unlimited Bandwidth',
        'Free Domain (1st year)',
        'Email Hosting Included',
        '24/7 Technical Support',
        'One-Click WordPress Install'
    ],
    true,
    true,
    7
);
