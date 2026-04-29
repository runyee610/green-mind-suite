import {
  LayoutDashboard,
  FileBarChart,
  CalendarRange,
  Gauge,
  FolderArchive,
  ClipboardCheck,
  Boxes,
  Leaf,
  Crosshair,
  Building2,
  Settings,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavChild = { title: string; url: string; icon: typeof BookOpen };
type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { title: "全景监测", url: "/", icon: LayoutDashboard },
  { title: "节能月度报告", url: "/report-monthly", icon: FileBarChart },
  { title: "节能年度报告", url: "/report-yearly", icon: CalendarRange },
  {
    title: "能源限额报告",
    url: "/energy-quota",
    icon: Gauge,
    children: [
      { title: "标准库管理", url: "/energy-quota/standard", icon: BookOpen },
      { title: "限额申报管理", url: "/energy-quota/declaration", icon: ClipboardList },
    ],
  },
  { title: "节能管理档案", url: "/archives", icon: FolderArchive },
  { title: "双控考核管理", url: "/dual-control", icon: ClipboardCheck },
  { title: "固定资产管理", url: "/assets", icon: Boxes },
  { title: "绿色制造管理", url: "/green-mfg", icon: Leaf },
  { title: "设备对标管理", url: "/benchmark", icon: Crosshair },
  { title: "企业管理", url: "/enterprise", icon: Building2 },
  {
    title: "系统管理",
    url: "/system",
    icon: Settings,
    children: [
      { title: "用户管理", url: "/system/users", icon: ClipboardList },
    ],
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">节能降碳</span>
              <span className="text-[10px] tracking-wider text-sidebar-foreground/60">
                数智管理平台
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
              功能模块
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                item.children ? (
                  <NavItemWithChildren
                    key={item.url}
                    item={item}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ) : (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-sidebar-accent/60"
                        activeClassName="!bg-sidebar-accent !text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className={cn("flex items-center px-1 py-1", collapsed ? "justify-center" : "justify-end")}>
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

function NavItemWithChildren({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const childActive = item.children!.some((c) => pathname === c.url || pathname.startsWith(c.url + "/"));
  const groupActive = childActive || pathname === item.url;
  const [open, setOpen] = useState(groupActive);

  // 路由变化导致命中子项时自动展开
  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  // 收起态：渲染单个 icon 按钮（不展开子菜单），点击进入第一个子页
  if (collapsed) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <NavLink
            to={item.children![0].url}
            className="hover:bg-sidebar-accent/60"
            activeClassName="!bg-sidebar-accent !text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary"
          >
            <item.icon className="h-4 w-4 shrink-0" />
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "hover:bg-sidebar-accent/60",
            groupActive &&
              "!bg-sidebar-accent !text-sidebar-accent-foreground font-medium border-l-2 border-sidebar-primary",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.title}</span>
          <ChevronDown
            className={cn(
              "ml-auto h-3.5 w-3.5 transition-transform",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
      {open ? (
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.url}>
              <SidebarMenuSubButton asChild>
                <NavLink
                  to={child.url}
                  end
                  className="hover:bg-sidebar-accent/40 text-sidebar-foreground/80"
                  activeClassName="!bg-sidebar-accent/70 !text-sidebar-accent-foreground font-medium"
                >
                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{child.title}</span>
                </NavLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </>
  );
}
