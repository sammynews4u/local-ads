import 'dotenv/config';
import { db } from '../db';
import { users, wallets, countryRates, advertiserProfiles, publisherProfiles } from '../db/schema';
import { hashPassword } from '../lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPasswordHash = await hashPassword('admin123');
    const [admin] = await db.insert(users).values({
      email: 'admin@localadnetwork.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      status: 'active',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true,
    }).onConflictDoNothing().returning();

    if (admin) {
      await db.insert(wallets).values({
        userId: admin.id,
        balance: '0.00',
      }).onConflictDoNothing();
      console.log('✅ Admin user created: admin@localadnetwork.com');
    }

    // Create sample advertiser
    const advertiserPasswordHash = await hashPassword('advertiser123');
    const [advertiser] = await db.insert(users).values({
      email: 'advertiser@example.com',
      passwordHash: advertiserPasswordHash,
      role: 'advertiser',
      status: 'active',
      firstName: 'John',
      lastName: 'Advertiser',
      emailVerified: true,
    }).onConflictDoNothing().returning();

    if (advertiser) {
      await db.insert(wallets).values({
        userId: advertiser.id,
        balance: '1000.00',
      }).onConflictDoNothing();
      
      await db.insert(advertiserProfiles).values({
        userId: advertiser.id,
        companyName: 'Example Corp',
        website: 'https://example.com',
        industry: 'Technology',
        country: 'United States',
      }).onConflictDoNothing();
      
      console.log('✅ Advertiser user created: advertiser@example.com');
    }

    // Create sample publisher
    const publisherPasswordHash = await hashPassword('publisher123');
    const [publisher] = await db.insert(users).values({
      email: 'publisher@example.com',
      passwordHash: publisherPasswordHash,
      role: 'publisher',
      status: 'active',
      firstName: 'Jane',
      lastName: 'Publisher',
      emailVerified: true,
    }).onConflictDoNothing().returning();

    if (publisher) {
      await db.insert(wallets).values({
        userId: publisher.id,
        balance: '50.00',
        totalEarnings: '250.00',
      }).onConflictDoNothing();
      
      await db.insert(publisherProfiles).values({
        userId: publisher.id,
        websiteUrl: 'https://myblog.com',
        niches: ['Technology', 'Business', 'Finance'],
        country: 'United States',
        paymentMethod: 'paypal',
      }).onConflictDoNothing();
      
      console.log('✅ Publisher user created: publisher@example.com');
    }

    // Create country rates
    const countryRatesData = [
      { countryCode: 'US', countryName: 'United States', defaultCpc: '0.10', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'GB', countryName: 'United Kingdom', defaultCpc: '0.08', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'CA', countryName: 'Canada', defaultCpc: '0.07', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'AU', countryName: 'Australia', defaultCpc: '0.07', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'DE', countryName: 'Germany', defaultCpc: '0.06', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'FR', countryName: 'France', defaultCpc: '0.06', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'NG', countryName: 'Nigeria', defaultCpc: '0.05', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'KE', countryName: 'Kenya', defaultCpc: '0.04', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'CM', countryName: 'Cameroon', defaultCpc: '0.03', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'GH', countryName: 'Ghana', defaultCpc: '0.04', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'ZA', countryName: 'South Africa', defaultCpc: '0.05', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'IN', countryName: 'India', defaultCpc: '0.02', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'BR', countryName: 'Brazil', defaultCpc: '0.04', publisherShare: '80.00', platformShare: '20.00' },
      { countryCode: 'MX', countryName: 'Mexico', defaultCpc: '0.03', publisherShare: '80.00', platformShare: '20.00' },
    ];

    for (const rate of countryRatesData) {
      await db.insert(countryRates).values(rate).onConflictDoNothing();
    }
    console.log('✅ Country rates created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('   Admin: admin@localadnetwork.com / admin123');
    console.log('   Advertiser: advertiser@example.com / advertiser123');
    console.log('   Publisher: publisher@example.com / publisher123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
