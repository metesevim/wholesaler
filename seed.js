import prisma from "./prisma/client.js";
import fs from "fs";

const logFile = "/tmp/seed_output.log";

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
}

// Clear previous log
fs.writeFileSync(logFile, "");

log("Starting seed script...");

const providers = [
  {
    name: "Global Supplies Co",
    email: "contact@globalsupplies.com",
    phone: "+1-555-0101",
    address: "123 Trade Street",
    city: "New York",
    country: "USA",
    iban: "US12345678901234567890"
  },
  {
    name: "Euro Distributors Ltd",
    email: "info@eurodist.com",
    phone: "+49-30-123456",
    address: "456 Import Road",
    city: "Berlin",
    country: "Germany",
    iban: "DE89370400440532013000"
  },
  {
    name: "Asian Trading Partners",
    email: "sales@asiantrading.com",
    phone: "+65-6789-0123",
    address: "789 Commerce Avenue",
    city: "Singapore",
    country: "Singapore",
    iban: "SG12345678901234567890"
  },
  {
    name: "Mediterranean Imports",
    email: "orders@medimports.com",
    phone: "+39-06-987654",
    address: "321 Mediterranean Way",
    city: "Rome",
    country: "Italy",
    iban: "IT60X0542811101000000123456"
  },
  {
    name: "Pacific Wholesale Group",
    email: "wholesale@pacificgroup.com",
    phone: "+61-2-5555-0123",
    address: "654 Ocean Boulevard",
    city: "Sydney",
    country: "Australia",
    iban: "AU123456789012345678"
  },
  {
    name: "Nordic Business Solutions",
    email: "business@nordicbiz.com",
    phone: "+46-8-123-456",
    address: "987 Nordic Street",
    city: "Stockholm",
    country: "Sweden",
    iban: "SE4550000000058398257466"
  },
  {
    name: "American Wholesale Inc",
    email: "wholesale@americanwholesale.com",
    phone: "+1-800-555-0123",
    address: "111 Commerce Drive",
    city: "Los Angeles",
    country: "USA",
    iban: "US87654321098765432109"
  },
  {
    name: "Canadian Trade Partners",
    email: "trade@canadianpartners.com",
    phone: "+1-416-555-0123",
    address: "222 Trade Avenue",
    city: "Toronto",
    country: "Canada",
    iban: "CA12345678901234567890"
  },
  {
    name: "UK Distribution Network",
    email: "distribution@uknetwork.com",
    phone: "+44-20-7946-0123",
    address: "333 British Road",
    city: "London",
    country: "United Kingdom",
    iban: "GB82WEST12345698765432"
  },
  {
    name: "French Enterprise Solutions",
    email: "enterprise@frenchsolutions.com",
    phone: "+33-1-4242-0123",
    address: "444 Parisian Lane",
    city: "Paris",
    country: "France",
    iban: "FR1420041010050500013M02606"
  }
];

async function main() {
  try {
    log("Adding 10 providers...");
    for (const provider of providers) {
      await prisma.provider.upsert({
        where: { email: provider.email },
        update: {},
        create: provider,
      });
      log(`✓ ${provider.name}`);
    }
    log("\n✅ All 10 providers added successfully!");
  } catch (error) {
    log(`Error: ${error.message}`);
    log(`Stack: ${error.stack}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

log("Calling main()...");
main().then(() => {
  log("Seed completed!");
  process.exit(0);
}).catch((err) => {
  log(`Failed: ${err.message}`);
  log(`Stack: ${err.stack}`);
  process.exit(1);
});
