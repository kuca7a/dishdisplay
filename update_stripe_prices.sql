-- Update subscription plans with real Stripe Price IDs and correct pricing

-- Update Pro Monthly plan
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1Ruwd6AhIHge1u9ndAjiRhD2',
  price = 1000  -- £10.00 in pence
WHERE name = 'Pro';

-- Update Pro Yearly plan  
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1RuwdMAhIHge1u9nVH1DHk02',
  price = 10000  -- £100.00 in pence
WHERE name = 'Pro Yearly';
