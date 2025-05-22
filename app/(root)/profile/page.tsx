import { getUserSession } from '@/components/shared/lib/get-user-session';
import { ProfileForm } from '@/components/shared/profile-form';
import { prisma } from '@/prisma/prisma-client';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getUserSession();

  if (!session) {
    return redirect('/not-auth');
  }

  const user = await prisma.user.findFirst({
    where: {
      id: Number(session?.id),
    },
  });

  if (!user) {
    return redirect('/not-auth');
  }

  return <ProfileForm data={user} />;
}
