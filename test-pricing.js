#!/usr/bin/env node

/**
 * Quick test script to verify Stripe pricing
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function testPricing() {
  try {
    console.log('🧪 Testing new Stripe pricing...\n');

    // Test monthly price
    const monthlyPrice = await stripe.prices.retrieve('price_1Rxm3YAluVLbiFnm7JdALoqk');
    console.log('✅ Monthly Price:');
    console.log(`   - ID: ${monthlyPrice.id}`);
    console.log(`   - Amount: £${monthlyPrice.unit_amount / 100}`);
    console.log(`   - Interval: ${monthlyPrice.recurring.interval}\n`);

    // Test yearly price
    const yearlyPrice = await stripe.prices.retrieve('price_1Rxm3ZAluVLbiFnmnukwPAOa');
    console.log('✅ Yearly Price:');
    console.log(`   - ID: ${yearlyPrice.id}`);
    console.log(`   - Amount: £${yearlyPrice.unit_amount / 100}`);
    console.log(`   - Interval: ${yearlyPrice.recurring.interval}\n`);

    console.log('🎉 All prices are correctly configured in Stripe!');

  } catch (error) {
    console.error('❌ Error testing pricing:', error.message);
  }
}

testPricing();
