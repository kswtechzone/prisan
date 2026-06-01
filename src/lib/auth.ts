import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "prisan-beauty-jwt-secret-change-in-production"
)

const COOKIE_NAME = "session"
const SESSION_DURATION = 60 * 60 * 24 // 24 hours

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true, email: true, name: true, role: true },
    })
    return user
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return user
}

export async function login(
  email: string,
  password: string
): Promise<{ error: string } | { success: true }> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: "Invalid email or password" }
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    return { error: "Invalid email or password" }
  }

  await createSession(user.id)
  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
