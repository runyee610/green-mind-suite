import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sprout,
  BadgeCheck,
  Megaphone,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { useRole } from "@/contexts/RoleContext";
import logoUrl from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
};

const overviewItems: NavItem[] = [
  { title: "全景视图看板", url: "/", icon: LayoutDashboard },
];

const greenItemsByRole: Record<"gov" | "ent", NavItem[]> = {
  gov: [
    { title: "自评价管理", url: "/green-mfg/gov", icon: ShieldCheck },
    { title: "梯度培育", url: "/green-mfg/gov/incubator", icon: Sprout },
    { title: "动态管理", url: "/green-mfg/gov/dynamic", icon: BadgeCheck },
    { title: "AI 对话", url: "/green-mfg-agent", icon: Megaphone },
  ],
  ent: [
    { title: "自评价管理", url: "/green-mfg/ent", icon: ShieldCheck },
    { title: "梯度培育", url: "/green-mfg/ent/incubator", icon: Sprout },
    { title: "动态管理", url: "/green-mfg/ent/dynamic", icon: BadgeCheck },
    { title: "AI 对话", url: "/green-mfg-agent", icon: Megaphone },
  ],
};

const policyItems: NavItem[] = [
  { title: "政策智能推送", url: "/policy-agent", icon: Megaphone },
];

export const navItems: NavItem[] = [
  ...overviewItems,
  ...greenItemsByRole.gov,
  ...greenItemsByRole.ent,
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { role } = useRole();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-sidebar-border overflow-hidden">
            <img src={logoUrl} alt="能碳数智空间 Logo" className="h-9 w-9 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-sidebar-foreground tracking-wide bg-gradient-primary bg-clip-text text-transparent">
                AI 能碳数智空间
              </span>
              <span className="text-[10px] tracking-widest text-sidebar-foreground/60 mt-0.5">
                AI · CARBON · INTELLIGENCE
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {(() => {
          const overview = role === "ent" ? [] : overviewItems;
          const green = greenItemsByRole[role];
          const renderItem = (item: NavItem) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild tooltip={item.title} className="h-11 text-[15px] font-medium">
                <NavLink
                  to={item.url}
                  end
                  className="hover:bg-sidebar-accent/60"
                  activeClassName="!bg-sidebar-accent !text-sidebar-accent-foreground font-semibold border-l-2 border-sidebar-primary"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="whitespace-nowrap">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
          return (
            <>
              {overview.length > 0 && (
                <SidebarGroup>
                  {!collapsed && (
                    <SidebarGroupLabel className="text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
                      总览
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>{overview.map(renderItem)}</SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
              <SidebarGroup>
                {!collapsed && (
                  <SidebarGroupLabel className="text-[12px] font-semibold tracking-wide text-sidebar-foreground/80">
                    绿色制造
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>{green.map(renderItem)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                {!collapsed && (
                  <SidebarGroupLabel className="text-[12px] font-semibold tracking-wide text-sidebar-foreground/80">
                    绿色智能体
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>{policyItems.map(renderItem)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          );
        })()}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={`flex items-center px-1 py-1 ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

