import { eq } from 'drizzle-orm';
import { db } from '../client';
import { allowedAdmins } from '../schema/allowed-admins';

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  if (!email) {
    console.error('BOOTSTRAP_ADMIN_EMAIL env var required');
    process.exit(1);
  }

  const existing = await db
    .select()
    .from(allowedAdmins)
    .where(eq(allowedAdmins.email, email))
    .then(rows => rows[0] || null);

  if (existing) {
    console.log(`Admin ${email} already exists (id: ${existing.id})`);
    return;
  }

  const [admin] = await db.insert(allowedAdmins).values({ email, isActive: true }).returning();
  console.log(`Created bootstrap admin: ${admin.email} (id: ${admin.id})`);
}

main().catch(console.error).finally(() => process.exit());
