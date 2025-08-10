"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store/store"
import { logoutUser } from "@/store/slices/auth-slice"
import { GraduationCap, LayoutDashboard, LogIn, LogOut, Shield, ShieldHalf, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { highestLevel } = useSelector((s: RootState) => s.assessment)
  const dispatch = useDispatch()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "SUPERVISOR" ? "/supervisor" : "/"
  const dashboardActive = user?.role === "ADMIN"
    ? (pathname?.startsWith("/admin") ?? false)
    : user?.role === "SUPERVISOR"
      ? (pathname?.startsWith("/supervisor") ?? false)
      : pathname === "/"

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <span className="font-semibold">Test_School</span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink href={dashboardHref} active={dashboardActive} icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </NavLink>
          {/* Hide student-only links (Assessment/Certificate) for ADMIN and SUPERVISOR */}
          {user?.role !== "ADMIN" && user?.role !== "SUPERVISOR" ? (
            <>
              <NavLink
                href="/assess"
                active={pathname?.startsWith("/assess") ?? false}
                icon={<ShieldHalf className="h-4 w-4" />}
              >
                Assessment
              </NavLink>
              <NavLink
                href="/certificate"
                active={pathname?.startsWith("/certificate") ?? false}
                icon={<Shield className="h-4 w-4" />}
              >
                Certificate
              </NavLink>
            </>
          ) : null}
          {/* {user?.role === "ADMIN" ? (
            <NavLink
              href="/admin"
              active={pathname?.startsWith("/admin") ?? false}
              icon={<Settings className="h-4 w-4" />}
            >
              Admin
            </NavLink>
          ) : null}
          {user?.role === "SUPERVISOR" ? (
            <NavLink
              href="/supervisor"
              active={pathname?.startsWith("/supervisor") ?? false}
              icon={<User className="h-4 w-4" />}
            >
              Supervisor
            </NavLink>
          ) : null} */}
        </nav>
        <div className="flex items-center gap-3">
          {user?.role !== "ADMIN" && user?.role !== "SUPERVISOR" && highestLevel ? <Badge variant="secondary">Level: {highestLevel}</Badge> : null}
          {isAuthenticated && user ? (
            <>
              <Badge variant="outline" suppressHydrationWarning>
                {user.role}
              </Badge>
              <Badge variant="outline">{user.name}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  dispatch<any>(logoutUser())
                  router.push("/login")
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => router.push("/login")}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  active,
  children,
  icon,
}: {
  href: string
  active: boolean
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-sm",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
