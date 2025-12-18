-- Query to get all services with their Nepali prices
SELECT 
    title,
    slug,
    price,
    currency,
    CASE 
        WHEN currency = 'USD' THEN CONCAT('$', price)
        WHEN currency = 'NPR' THEN CONCAT('Rs ', price)
        WHEN currency = 'EUR' THEN CONCAT('€', price)
        WHEN currency = 'GBP' THEN CONCAT('£', price)
        ELSE CONCAT(price, ' ', currency)
    END as formatted_price,
    is_published,
    is_featured,
    display_order,
    created_at
FROM public.services
ORDER BY display_order ASC;
