import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { auth } from "@/lib/auth"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <>
      <Navbar
        user={
          session?.user
            ? {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: session.user.role,
              }
            : null
        }
      />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
