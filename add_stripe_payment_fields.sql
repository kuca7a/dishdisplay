-- Add Stripe payment and subscription fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_subscription_id VARCHAR(255),
ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free',
ADD COLUMN subscription_start_date TIMESTAMP,
ADD COLUMN subscription_end_date TIMESTAMP,
ADD COLUMN trial_end_date TIMESTAMP,
ADD COLUMN payment_method_id VARCHAR(255),
ADD COLUMN billing_email VARCHAR(255);

-- Create payments table for transaction history
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_invoice_id VARCHAR(255),
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'GBP',
  status VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription_plans table for plan management
CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  stripe_price_id VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  currency VARCHAR(3) DEFAULT 'GBP',
  billing_interval VARCHAR(20) NOT NULL, -- 'month' or 'year'
  features JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, stripe_price_id, price, billing_interval, features) VALUES
('Free', 'price_free', 0, 'month', '{"max_menu_items": 10, "qr_codes": 1, "analytics": false}'),
('Pro', 'price_pro_monthly', 1999, 'month', '{"max_menu_items": -1, "qr_codes": -1, "analytics": true, "custom_branding": true}'),
('Pro Yearly', 'price_pro_yearly', 19999, 'year', '{"max_menu_items": -1, "qr_codes": -1, "analytics": true, "custom_branding": true}');
