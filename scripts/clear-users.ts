/**
 * Clear all users from the database.
 * Run with: bun run scripts/clear-users.ts
 * (Loads .env.local automatically for MONGODB_URI)
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set. Add it to .env.local");
  process.exit(1);
}

async function clearUsers() {
  await mongoose.connect(MONGODB_URI);
  const result = await mongoose.connection.db
    .collection("users")
    .deleteMany({});
  console.log(`Deleted ${result.deletedCount} user(s)`);
  await mongoose.disconnect();
}

clearUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
