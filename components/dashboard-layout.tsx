"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Home, User, FileText, Settings, Menu, LogOut } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "patient" | "doctor"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const patientNavItems = [
    {
      title: "Dashboard",
      href: "/patient/dashboard",
      icon: Home,
    },
    {
      title: "New Diagnosis",
      href: "/patient/new-diagnosis",
      icon: FileText,
    },
    {
      title: "Profile",
      href: "/patient/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/patient/settings",
      icon: Settings,
    },
  ]

  const doctorNavItems = [
    {
      title: "Dashboard",
      href: "/doctor/dashboard",
      icon: Home,
    },
    {
      title: "Profile",
      href: "/doctor/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/doctor/settings",
      icon: Settings,
    },
  ]

  const navItems = role === "patient" ? patientNavItems : doctorNavItems

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-primary">AI Diagnosis</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between">
              <UserButton afterSignOutUrl="/" />
              <Button variant="ghost" size="icon" asChild>
                <Link href="/sign-out">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign out</span>
                </Link>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{role === "patient" ? "Patient Dashboard" : "Doctor Dashboard"}</h1>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

