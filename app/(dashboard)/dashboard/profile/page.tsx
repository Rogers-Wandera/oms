import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileView from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
    with: {
      department: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileView user={user} />;
}
