import {
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sprout,
  BadgeCheck,
  Megaphone,
  Send,
  Leaf,
  Gauge,
  Boxes,
  Settings,
  Users,
  KeyRound,
  ListChecks,
  CalendarRange,
  Brain,
  Wallet,
  Workflow,
  CircleDollarSign,
  FileSearch,
  Compass,
  Network,
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

const greenMfgItemsByRole: Record<"gov" | "ent", NavItem[]> = {
  gov: [
    { title: "全景视图看板", url: "/", icon: LayoutDashboard },
    { title: "审核推荐", url: "/green-mfg/gov/review", icon: Send },
    { title: "梯度培育", url: "/green-mfg/gov/incubator", icon: Sprout },
    { title: "动态管理", url: "/green-mfg/gov/dynamic", icon: BadgeCheck },
    { title: "零碳进阶", url: "/green-mfg/gov/zerocarbon", icon: Leaf },
    { title: "数据智能", url: "/green-mfg-agent", icon: Brain },
    { title: "政策推送", url: "/policy-agent", icon: Megaphone },
  ],
  ent: [
    { title: "模拟自我评价", url: "/green-mfg/ent", icon: ShieldCheck },
    { title: "梯度培育", url: "/green-mfg/ent/incubator", icon: Sprout },
    { title: "动态管理", url: "/green-mfg/ent/dynamic", icon: BadgeCheck },
    { title: "零碳进阶", url: "/green-mfg/ent/zerocarbon", icon: Leaf },
    { title: "数据智能", url: "/green-mfg-agent", icon: Brain },
    { title: "政策推送", url: "/policy-agent", icon: Megaphone },
  ],
};


const quotaItemsByRole: Record<"gov" | "ent", NavItem[]> = {
  gov: [
    { title: "限额标准管理", url: "/energy-quota/standard", icon: ListChecks },
    { title: "限额周期与申报", url: "/energy-quota/declaration", icon: CalendarRange },
  ],
  ent: [
    { title: "限额周期与申报", url: "/energy-quota/declaration", icon: CalendarRange },
  ],
};
const quotaItems: NavItem[] = quotaItemsByRole.gov;

const assetsItemsByRole: Record<"gov" | "ent", NavItem[]> = {
  gov: [{ title: "固定资产投资项目管理", url: "/assets", icon: Boxes }],
  ent: [],
};
const assetsItems: NavItem[] = assetsItemsByRole.gov;

const directBenefitItemsByRole: Record<"gov" | "ent", NavItem[]> = {
  gov: [
    { title: "智能体工作台", url: "/direct-benefit/gov", icon: Brain },
    { title: "全部政策", url: "/direct-benefit/gov/all-policies", icon: Compass },
    { title: "数据源配置", url: "/direct-benefit/gov/sources", icon: Settings },
  ],
  ent: [
    { title: "智能体工作台", url: "/direct-benefit/ent/home", icon: Brain },
    { title: "全部政策", url: "/direct-benefit/ent/all-policies", icon: FileSearch },
    { title: "我的专属政策", url: "/direct-benefit/ent", icon: Wallet },
    { title: "资金到账", url: "/direct-benefit/ent/funds", icon: CircleDollarSign },
  ],
};

const systemItemsByRole: Record<"gov" | "ent", NavItem[]> = {
  gov: [
    { title: "账号管理", url: "/system/users", icon: Users },
    { title: "组织架构管理", url: "/system/org-structure", icon: Network },
    { title: "权限配置中心", url: "/system/permissions", icon: KeyRound },
  ],
  ent: [],
};
const systemItems: NavItem[] = systemItemsByRole.gov;

export const navItems: NavItem[] = [
  ...greenMfgItemsByRole.gov,
  ...quotaItems,
  ...assetsItems,
  ...directBenefitItemsByRole.gov,
  ...systemItems,
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { role } = useRole();

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

  const renderGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup key={label}>
      {!collapsed && (
        <SidebarGroupLabel className="text-[12px] font-semibold tracking-wide text-[#0f5c4d]">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-sidebar-border overflow-hidden">
            <img src={logoUrl} alt="能碳数智空间 Logo" className="h-9 w-9 object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-sidebar-foreground tracking-wide bg-gradient-primary bg-clip-text text-[#56d7bd]">
                AI 能碳数智空间
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("绿色制造", greenMfgItemsByRole[role])}
        
        {renderGroup("能耗限额管理", quotaItemsByRole[role])}
        {assetsItemsByRole[role].length > 0 && renderGroup("固定资产投资项目", assetsItemsByRole[role])}
        {renderGroup("免审即享", directBenefitItemsByRole[role])}
        {systemItemsByRole[role].length > 0 && renderGroup("系统管理", systemItemsByRole[role])}
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
