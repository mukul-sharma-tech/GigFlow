"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  CheckCircle,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Contracts", href: "/contracts", icon: FileText },
    { name: "Chats", href: "/chats", icon: MessageSquare },
    { name: "Completed Orders", href: "/completed-orders", icon: CheckCircle },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="icon"
          className="bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 h-10 w-10"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      {/* <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-black/20 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}> */}
      <div className={`
  fixed top-0 left-0 h-screen w-64 z-40
  bg-black/20 backdrop-blur-xl border-r border-white/10
  transform transition-transform duration-300 ease-in-out
  lg:translate-x-0
  ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  ${className}
`}>

        {/* <div className="flex flex-col h-full p-6"> */}
        <div className="flex flex-col h-full p-6 overflow-y-auto">

          {/* Logo/Brand */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-white">GigFlow</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">
              Welcome, {session?.user?.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  variant="ghost"
                  className={`
                    w-full justify-start text-left h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base
                    ${isActive
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                    transition-all duration-200
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User actions */}
          <div className="space-y-2">
            {/* <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="w-full justify-start text-left h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base text-gray-300 hover:text-white hover:bg-white/10"
            >
              <User className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Profile Settings
            </Button>
 */}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              variant="ghost"
              className="w-full justify-start text-left h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}