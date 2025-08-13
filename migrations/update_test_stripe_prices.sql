-- Update subscription plans with TEST Stripe Price IDs and correct pricing

-- Update Pro Monthly plan with TEST price ID
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1RuwrXAluVLbiFnm14DNsfhz',
  price = 1000  -- £10.00 in pence
WHERE name = 'Pro';

-- Update Pro Yearly plan with TEST price ID
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1RuwrkAluVLbiFnmfYLbQVVC',
  price = 10000  -- £100.00 in pence  
WHERE name = 'Pro Yearly';
