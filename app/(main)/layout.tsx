"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Calendar, Package, Warehouse, LogOut, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Building2, Box, BarChart3, Settings, Search,
} from "lucide-react"
import AuthForm from "@/components/auth/auth-form"
import GlobalSearch from "@/components/search/global-search"
import InOutStatusPanel from "@/components/inout/inout-status-panel"
import AmrStatusPanel, { type Amr } from "@/components/simulation/amr-status-panel"
import NotificationPopover from "@/components/notifications/notification-popover"
import { NotificationProvider } from "@/hooks/use-notifications"
import { InOutRecord } from "@/components/utils"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { DataProvider, useData } from "@/contexts/data-context"

export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLogin: string;
  createdAt: string;
}

type SidePanelType = "inout-status" | "amr-status" | null

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { inOutData, amrData } = useData();
  const [sidePanel, setSidePanel] = useState<SidePanelType>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [expandedMenus, setExpandedMenus] = useState({
    basicInfo: false,
    inoutManagement: false,
    systemManagement: false,
    amrManagement: false,
  })

  useEffect(() => {
    if (pathname === "/simulation") {
      const panel = searchParams.get("panel")
      if (panel === "inout-status" || panel === "amr-status") {
        setSidePanel(panel)
        setIsPanelCollapsed(false)
        setExpandedMenus((prev) => ({ ...prev, amrManagement: true }))
      } else {
        setSidePanel(null)
        setIsPanelCollapsed(true)
      }
    } else {
      setSidePanel(null)
      setIsPanelCollapsed(true)
    }
  }, [pathname, searchParams])

  const toggleMenu = (menu: keyof typeof expandedMenus) => {
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }))
  }

  const PANEL_WIDTH = 350

  const renderSidePanel = () => {
    if (!sidePanel) return null
    let panelContent = null
    let panelTitle = ""
    switch (sidePanel) {
      case "inout-status":
        panelContent = <InOutStatusPanel showSearch={false} data={inOutData} />
        panelTitle = "실시간 작업 현황"
        break
      case "amr-status":
        panelContent = <AmrStatusPanel amrList={amrData} />
        panelTitle = "실시간 AMR 현황"
        break
    }
    return (
      <>
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l transition-all duration-300 z-40 overflow-hidden`}
          style={{ width: isPanelCollapsed ? 0 : PANEL_WIDTH }}
        >
          <div className={`h-full flex flex-col transition-opacity duration-300 ${isPanelCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
            <div className="p-4 border-b bg-gray-50"><h3 className="text-lg font-semibold">{panelTitle}</h3></div>
            <div className="p-4 flex-1 overflow-y-auto">{panelContent}</div>
          </div>
        </div>
        <button
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          style={{ position: "fixed", top: "50%", right: isPanelCollapsed ? 0 : PANEL_WIDTH, transform: "translateY(-50%)", zIndex: 50, boxShadow: "none", border: "1px solid #d1d5db", background: "#fff" }}
          className="w-8 h-14 flex items-center justify-center rounded-l-full transition-all duration-300"
        >
          {isPanelCollapsed ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
        </button>
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Warehouse className="w-10 h-10 text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto"><div className="w-16 h-2 bg-blue-600 rounded-full animate-pulse"></div></div>
            <p className="text-gray-600 font-medium">시스템 로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const isActive = (path: string) => pathname === path

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white shadow-xl flex flex-col fixed top-0 bottom-0 left-0 z-20 overflow-y-auto border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600" style={{ height: "120px" }}>
            <Link href="/dashboard">
              <div className="flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity h-full">
                <Image src="/images/smart-wms-logo.png" alt="Smart WMS Logo" width={200} height={100} className="h-full w-full object-contain filter brightness-0 invert" priority />
              </div>
            </Link>
          </div>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">{user.fullName.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 p-3">
            <nav className="space-y-1">
              {/* Navigation Links */}
              <Button asChild variant={isActive("/dashboard") ? "default" : "ghost"} className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"><Link href="/dashboard"><BarChart3 className="w-4 h-4 mr-2" /><span>대시보드</span></Link></Button>
              <div>
                <Button variant="ghost" className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700" onClick={() => toggleMenu("amrManagement")}>
                  <div className="flex items-center"><Warehouse className="w-4 h-4 mr-4" /><span>AMR 작동 현황</span></div>
                  {expandedMenus.amrManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {expandedMenus.amrManagement && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Button asChild variant={isActive("/simulation") && sidePanel === "inout-status" ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/simulation?panel=inout-status"><span className="mr-2">•</span>실시간 작업 현황</Link></Button>
                    <Button asChild variant={isActive("/simulation") && sidePanel === "amr-status" ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/simulation?panel=amr-status"><span className="mr-2">•</span>실시간 AMR 현황</Link></Button>
                  </div>
                )}
              </div>
              <div>
                <Button variant="ghost" className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700" onClick={() => toggleMenu("inoutManagement")}>
                  <div className="flex items-center"><Box className="w-4 h-4 mr-4" /><span>입/출고 관리</span></div>
                  {expandedMenus.inoutManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {expandedMenus.inoutManagement && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Button asChild variant={isActive("/inbound-registration") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/inbound-registration"><span className="mr-2">•</span>입고 관리</Link></Button>
                    <Button asChild variant={isActive("/outbound-registration") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/outbound-registration"><span className="mr-2">•</span>출고 관리</Link></Button>
                    <Button asChild variant={isActive("/inout-history") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/inout-history"><span className="mr-2">•</span>입출고 내역</Link></Button>
                    <Button asChild variant={isActive("/inout-request") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/inout-request"><span className="mr-2">•</span>입출고 요청</Link></Button>
                  </div>
                )}
              </div>
              <Button asChild variant={isActive("/inventory") ? "default" : "ghost"} className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"><Link href="/inventory"><Package className="w-4 h-4 mr-2" /><span>재고 관리</span></Link></Button>
              <div>
                <Button variant="ghost" className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700" onClick={() => toggleMenu("basicInfo")}>
                  <div className="flex items-center"><Building2 className="w-4 h-4 mr-4" /><span>기초 정보</span></div>
                  {expandedMenus.basicInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {expandedMenus.basicInfo && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Button asChild variant={isActive("/company-list") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/company-list"><span className="mr-2">•</span>거래처 관리</Link></Button>
                    <Button asChild variant={isActive("/item-list") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/item-list"><span className="mr-2">•</span>품목 관리</Link></Button>
                  </div>
                )}
              </div>
              <Button asChild variant={isActive("/schedule") ? "default" : "ghost"} className="w-full justify-start text-sm hover:bg-blue-50 hover:text-blue-700"><Link href="/schedule"><Calendar className="w-4 h-4 mr-2" /><span>일정 관리</span></Link></Button>
              <div>
                <Button variant="ghost" className="w-full justify-between text-sm hover:bg-blue-50 hover:text-blue-700" onClick={() => toggleMenu("systemManagement")}>
                  <div className="flex items-center"><Settings className="w-4 h-4 mr-4" /><span>시스템 관리</span></div>
                  {expandedMenus.systemManagement ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {expandedMenus.systemManagement && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Button asChild variant={isActive("/user-management") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/user-management"><span className="mr-2">•</span>사용자 관리</Link></Button>
                    <Button asChild variant={isActive("/notifications") ? "default" : "ghost"} size="sm" className="w-full justify-start text-xs pl-4 hover:bg-blue-50 hover:text-blue-700"><Link href="/notifications"><span className="mr-2">•</span>알림 센터</Link></Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-3 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-center text-sm bg-white hover:bg-gray-50" onClick={() => setIsSearchOpen(true)}><Search className="w-4 h-4 mr-2" />전역 검색</Button>
              <Button variant="ghost" size="sm" className="w-full justify-center text-sm text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}><LogOut className="w-4 h-4 mr-1" />로그아웃</Button>
            </div>
          </div>
        </div>
        <div className={`flex-1 ml-64 transition-all duration-300 ${sidePanel && !isPanelCollapsed ? "mr-[350px]" : ""}`}>
          {children}
          {renderSidePanel()}
        </div>
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 transition-all duration-300 min-w-[300px]">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-gray-800 font-medium flex-1">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors">×</button>
            </div>
          </div>
        )}
        <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <NotificationPopover />
      </div>
    </NotificationProvider>
  )
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </DataProvider>
    </AuthProvider>
  )
}