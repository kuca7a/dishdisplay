#!/usr/bin/env node

/**
 * Stripe Setup Script for DishDisplay
 * 
 * This script creates products and prices in your Stripe account.
 * Make sure you have your STRIPE_SECRET_KEY set in .env.local first.
 * 
 * Run with: node scripts/setup-stripe.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  console.log('Please add your Stripe secret key to .env.local:');
  console.log('STRIPE_SECRET_KEY=sk_test_your_key_here');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products for DishDisplay...\n');

    // Create Product
    console.log('Creating product...');
    const product = await stripe.products.create({
      name: 'DishDisplay Pro',
      description: 'Professional restaurant menu management with unlimited features, analytics, and custom branding.',
      images: ['https://your-domain.com/logo.png'], // Replace with your logo URL
      metadata: {
        app: 'dishdisplay',
        features: 'unlimited_menus,unlimited_qr_codes,analytics,custom_branding'
      }
    });

    console.log('✅ Product created:', product.id);

    // Create Monthly Price
    console.log('Creating monthly price...');
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'gbp',
      unit_amount: 2900, // £29.00 in pence
      recurring: {
        interval: 'month',
        trial_period_days: 14
      },
      nickname: 'Pro Monthly',
      metadata: {
        plan: 'pro',
        billing: 'monthly'
      }
    });

    console.log('✅ Monthly price created:', monthlyPrice.id);

    // Create Yearly Price
    console.log('Creating yearly price...');
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'gbp',
      unit_amount: 29900, // £299.00 in pence
      recurring: {
        interval: 'year',
        trial_period_days: 14
      },
      nickname: 'Pro Yearly',
      metadata: {
        plan: 'pro',
        billing: 'yearly'
      }
    });

    console.log('✅ Yearly price created:', yearlyPrice.id);

    // Output environment variables
    console.log('\n🎉 Setup complete! Add these to your .env.local:\n');
    console.log(`STRIPE_PRICE_ID_PRO_MONTHLY=${monthlyPrice.id}`);
    console.log(`STRIPE_PRICE_ID_PRO_YEARLY=${yearlyPrice.id}`);
    console.log('\n📝 Next steps:');
    console.log('1. Update your .env.local with the price IDs above');
    console.log('2. Set up webhooks in Stripe Dashboard');
    console.log('3. Test the payment flow');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is correct and starts with sk_test_');
    }
  }
}

setupStripeProducts();
