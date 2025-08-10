import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/connect.js';
import { seedQuestionsIfEmpty } from './modules/questions/seed.js';
import { seedDefaultPolicyIfEmpty } from './modules/settings/policy.seed.js';

async function main() {
  console.log('🚀 Booting server…');
  await connectDB();
  // await seedQuestionsIfEmpty();
  await seedDefaultPolicyIfEmpty();
  app.listen(env.PORT, () => {
    console.log(`✅ HTTP server on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('💥 Fatal startup error:', err);
  process.exit(1);
});
