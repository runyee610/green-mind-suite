import { useMemo, useState } from "react";
import {
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Pencil,
  Download,
  Upload,
  Filter,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ===== 角色与视图定义 =====

type ViewRole =
  | "city_admin"
  | "district_admin"
  | "park_admin"
  | "group_admin"
  | "enterprise_admin";

const ROLE_OPTIONS: { value: ViewRole; label: string; scope: string }[] = [
  { value: "city_admin", label: "市管理员", scope: "市级账户 · 全市视图" },
  { value: "district_admin", label: "区管理员", scope: "区级账户 · 区域视图" },
  { value: "park_admin", label: "园区管理员", scope: "园区账户 · 园区视图" },
  { value: "group_admin", label: "集团管理员", scope: "集团账户 · 集团视图" },
  { value: "enterprise_admin", label: "企业管理员", scope: "企业账户 · 单企业视图" },
];

// ===== 模拟数据 =====

interface CityUser {
  id: string;
  account: string;
  name: string;
  department: string; // 所属科室
  role: "市管理员" | "科室管理员" | "对口人";
  managedEnterprises: number;
  phone: string;
  status: "启用" | "停用";
  enterpriseList?: string[]; // 对口企业列表
}

interface DistrictUser {
  id: string;
  account: string;
  areaName: string; // 区县/园区名称
  level: "区" | "园区";
  owner: string; // 负责人
  cityContact: string; // 中心对口人
  enterpriseCount: number;
  phone: string;
  status: "启用" | "停用";
}

interface GroupUser {
  id: string;
  account: string;
  groupName: string;
  owner: string;
  subsidiaries: string[]; // 下属企业
  phone: string;
  status: "启用" | "停用";
}

interface EnterpriseUser {
  id: string;
  account: string;
  enterpriseName: string;
  creditCode: string; // 18 位
  energyLevel: "2000吨标煤及以上" | "1000-2000吨标煤" | "1000吨标煤以下";
  industry: string; // 行业分类
  district: string;
  owner: string;
  phone: string;
  status: "启用" | "停用";
}

const CITY_DEPARTMENTS = [
  "市发改委-能源科",
  "市发改委-环资处",
  "市经信局-节能处",
  "市经信局-绿色制造处",
  "市生态环境局-大气处",
  "市住建委-建筑节能处",
  "市统计局-能源统计处",
];

const SAMPLE_ENTERPRISES = [
  "华谊化工有限公司", "宝山钢铁股份有限公司", "中芯国际集成电路", "申永纸业有限公司",
  "锦华纺织有限公司", "永和食品制造有限公司", "上海石化炼油厂", "东方汽轮机厂",
  "华东电力设备制造", "上汽大众动力总成", "金桥半导体", "临港新能源科技",
  "申能燃机发电", "宝冶建设集团", "光明乳业制造基地", "晨光文具制造",
  "三爱富新材料", "华虹半导体", "外高桥造船", "振华重工制造",
];

const CITY_FIRST_NAMES = ["张", "李", "王", "陈", "刘", "杨", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗", "梁"];
const CITY_GIVEN_NAMES = ["明远", "静怡", "思源", "雨涵", "建国", "晓燕", "宏伟", "云飞", "丹丹", "志勇", "晓东", "丽华", "建华", "建军", "文博", "慧敏", "晓琳", "明月", "海涛", "若曦", "天宇", "梓萱", "佳怡", "瑞泽"];

function genName(seed: number): string {
  const f = CITY_FIRST_NAMES[seed % CITY_FIRST_NAMES.length];
  const g = CITY_GIVEN_NAMES[(seed * 7) % CITY_GIVEN_NAMES.length];
  return f + g;
}

function genCityUsers(): CityUser[] {
  const list: CityUser[] = [];
  let idx = 0;
  CITY_DEPARTMENTS.forEach((dept, di) => {
    const count = 9 + (di % 3); // 9~11 人
    for (let i = 0; i < count; i++) {
      idx++;
      const isHead = i === 0;
      const isAdmin = di === 0 && i === 0;
      const role: CityUser["role"] = isAdmin ? "市管理员" : isHead ? "科室管理员" : "对口人";
      const entCount = role === "市管理员" ? 1287 : role === "科室管理员" ? 200 + ((idx * 37) % 300) : 20 + ((idx * 13) % 80);
      const enterpriseList = SAMPLE_ENTERPRISES
        .slice()
        .sort(() => ((idx * 17) % 7) - 3)
        .slice(0, Math.min(entCount, 12));
      list.push({
        id: `C${String(idx).padStart(3, "0")}`,
        account: `city_${dept.split("-")[1] ?? "adm"}_${String(i + 1).padStart(2, "0")}`.replace(/[^\w]/g, "_"),
        name: genName(idx),
        department: dept,
        role,
        managedEnterprises: entCount,
        phone: `13${(8 + (idx % 2))}****${String(1000 + (idx * 73) % 9000)}`,
        status: idx % 17 === 0 ? "停用" : "启用",
        enterpriseList,
      });
    }
  });
  return list;
}

const cityUsers: CityUser[] = genCityUsers();

const districtUsers: DistrictUser[] = [
  { id: "D001", account: "huangpu_admin", areaName: "黄浦区", level: "区", owner: "周建国", cityContact: "王思源", enterpriseCount: 86, phone: "138****0011", status: "启用" },
  { id: "D002", account: "pudong_admin", areaName: "浦东新区", level: "区", owner: "刘晓燕", cityContact: "王思源", enterpriseCount: 312, phone: "138****0022", status: "启用" },
  { id: "D003", account: "minhang_admin", areaName: "闵行区", level: "区", owner: "赵宏伟", cityContact: "陈雨涵", enterpriseCount: 178, phone: "138****0033", status: "启用" },
  { id: "D004", account: "zjpark_admin", areaName: "张江高科园区", level: "园区", owner: "孙云飞", cityContact: "陈雨涵", enterpriseCount: 94, phone: "138****0044", status: "启用" },
  { id: "D005", account: "linkong_admin", areaName: "临港装备园区", level: "园区", owner: "吴丹丹", cityContact: "王思源", enterpriseCount: 47, phone: "138****0055", status: "停用" },
];

const groupUsers: GroupUser[] = [
  { id: "G001", account: "huayi_group", groupName: "华谊集团", owner: "黄志勇", subsidiaries: ["华谊化工有限公司", "华谊新材料股份", "华谊精细化学"], phone: "138****7001", status: "启用" },
  { id: "G002", account: "baowu_group", groupName: "宝武钢铁集团", owner: "马晓东", subsidiaries: ["宝山钢铁", "宝武特钢", "宝武不锈钢", "宝武碳业"], phone: "138****7002", status: "启用" },
  { id: "G003", account: "shdz_group", groupName: "上海电气集团", owner: "郑丽华", subsidiaries: ["电气重工", "电气风电", "电气输配电"], phone: "138****7003", status: "启用" },
];

const enterpriseUsers: EnterpriseUser[] = [
  { id: "E001", account: "huayi_chem01", enterpriseName: "华谊化工有限公司", creditCode: "913100007123456789", energyLevel: "2000吨标煤及以上", industry: "化学原料和化学制品制造业", district: "金山区", owner: "顾建华", phone: "138****8001", status: "启用" },
  { id: "E002", account: "baoshan_steel", enterpriseName: "宝山钢铁股份有限公司", creditCode: "913100001234567890", energyLevel: "2000吨标煤及以上", industry: "黑色金属冶炼和压延加工业", district: "宝山区", owner: "胡建军", phone: "138****8002", status: "启用" },
  { id: "E003", account: "smic_fab", enterpriseName: "中芯国际集成电路", creditCode: "913100009876543210", energyLevel: "2000吨标煤及以上", industry: "计算机、通信和其他电子设备制造业", district: "浦东新区", owner: "林文博", phone: "138****8003", status: "启用" },
  { id: "E004", account: "syp_paper", enterpriseName: "申永纸业有限公司", creditCode: "913100005566778899", energyLevel: "1000-2000吨标煤", industry: "造纸和纸制品业", district: "青浦区", owner: "梁慧敏", phone: "138****8004", status: "启用" },
  { id: "E005", account: "jh_textile", enterpriseName: "锦华纺织有限公司", creditCode: "913100003344556677", energyLevel: "1000吨标煤以下", industry: "纺织业", district: "松江区", owner: "范晓琳", phone: "138****8005", status: "停用" },
  { id: "E006", account: "yh_food", enterpriseName: "永和食品制造有限公司", creditCode: "913100002233445566", energyLevel: "1000吨标煤以下", industry: "食品制造业", district: "嘉定区", owner: "高明月", phone: "138****8006", status: "启用" },
];

// ===== 工具函数 =====

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
const CREDIT_CODE_RE = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;

function genRandomPassword(): string {
  const lowers = "abcdefghijkmnopqrstuvwxyz";
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const specials = "!@#$%^&*";
  const all = lowers + uppers + digits + specials;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let pwd = pick(lowers) + pick(uppers) + pick(digits) + pick(specials);
  for (let i = 0; i < 8; i++) pwd += pick(all);
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

// ===== 主页面 =====

export default function SystemUsers() {
  const [view, setView] = useState<ViewRole>("city_admin");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [groupByDept, setGroupByDept] = useState<boolean>(true);

  // 弹窗
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [entListUser, setEntListUser] = useState<CityUser | null>(null);

  const currentRoleLabel = ROLE_OPTIONS.find((r) => r.value === view)?.label ?? "";

  // 仅市级/平台管理员可禁用 2000 吨标煤及以上的企业
  const canDisableHighEnergy = view === "city_admin";

  return (
    <AppLayout title="用户管理" subtitle="多级账户体系下的账号、角色与权限管理">
      {/* 角色切换演示器 */}
      <Card className="mb-4 border-border/60">
        <CardContent className="py-3 px-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>当前模拟视图</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-1">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setView(r.value)}
                className={cn(
                  "px-3 h-7 rounded text-xs transition-colors",
                  view === r.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
            {ROLE_OPTIONS.find((r) => r.value === view)?.scope}
          </Badge>
          <div className="ml-auto text-[11px] text-muted-foreground">
            演示模式：切换视图可查看不同角色的字段与权限
          </div>
        </CardContent>
      </Card>

      {/* 工具栏 */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索账号 / 名称 / 负责人"
                className="h-8 w-64 pl-8 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="启用">启用</SelectItem>
                <SelectItem value="停用">停用</SelectItem>
              </SelectContent>
            </Select>
            {view === "city_admin" && (
              <>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue placeholder="科室" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部科室</SelectItem>
                    {CITY_DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => setGroupByDept((v) => !v)}
                  className={cn(
                    "h-8 px-2.5 rounded-md border text-xs inline-flex items-center gap-1.5 transition-colors",
                    groupByDept
                      ? "border-primary/40 bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  按科室分组
                </button>
              </>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Filter className="h-3.5 w-3.5" />
              高级筛选
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Upload className="h-3.5 w-3.5" />
                批量导入
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Download className="h-3.5 w-3.5" />
                导出
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {view === "enterprise_admin" || view === "city_admin"
                  ? "新建企业账号"
                  : "新建账号"}
              </Button>
            </div>
          </div>

          {/* 表格区 */}
          <div className="overflow-x-auto">
            {view === "city_admin" && (
              <CityTable
                rows={cityUsers.filter(
                  (r) =>
                    (statusFilter === "all" || r.status === statusFilter) &&
                    (deptFilter === "all" || r.department === deptFilter) &&
                    (!keyword ||
                      r.name.includes(keyword) ||
                      r.account.includes(keyword) ||
                      r.department.includes(keyword)),
                )}
                groupByDepartment={groupByDept && deptFilter === "all"}
                onViewEnterprises={(u) => setEntListUser(u)}
                onChangePwd={(acc) => {
                  setPwdTarget(acc);
                  setPwdOpen(true);
                }}
              />
            )}
            {(view === "district_admin" || view === "park_admin") && (
              <DistrictTable
                level={view === "district_admin" ? "区" : "园区"}
                rows={districtUsers.filter(
                  (r) =>
                    (view === "district_admin" ? r.level === "区" : r.level === "园区") &&
                    (statusFilter === "all" || r.status === statusFilter) &&
                    (!keyword ||
                      r.areaName.includes(keyword) ||
                      r.owner.includes(keyword) ||
                      r.account.includes(keyword)),
                )}
                onChangePwd={(acc) => {
                  setPwdTarget(acc);
                  setPwdOpen(true);
                }}
              />
            )}
            {view === "group_admin" && (
              <GroupTable
                rows={groupUsers.filter(
                  (r) =>
                    (statusFilter === "all" || r.status === statusFilter) &&
                    (!keyword ||
                      r.groupName.includes(keyword) ||
                      r.owner.includes(keyword) ||
                      r.account.includes(keyword)),
                )}
                onChangePwd={(acc) => {
                  setPwdTarget(acc);
                  setPwdOpen(true);
                }}
              />
            )}
            {view === "enterprise_admin" && (
              <EnterpriseTable
                rows={enterpriseUsers.filter(
                  (r) =>
                    (statusFilter === "all" || r.status === statusFilter) &&
                    (!keyword ||
                      r.enterpriseName.includes(keyword) ||
                      r.account.includes(keyword) ||
                      r.creditCode.includes(keyword)),
                )}
                canDisableHighEnergy={canDisableHighEnergy}
                currentRoleLabel={currentRoleLabel}
                onChangePwd={(acc) => {
                  setPwdTarget(acc);
                  setPwdOpen(true);
                }}
              />
            )}
          </div>

          {/* 分页脚 */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
            <span>
              共 {tableCount(view)} 条 · 当前视图：{currentRoleLabel}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                上一页
              </Button>
              <span className="px-2">1 / 1</span>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled>
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={pwdOpen}
        onOpenChange={setPwdOpen}
        accountName={pwdTarget}
      />
      <CreateEnterpriseDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppLayout>
  );
}

function tableCount(v: ViewRole) {
  switch (v) {
    case "city_admin":
      return cityUsers.length;
    case "district_admin":
      return districtUsers.filter((r) => r.level === "区").length;
    case "park_admin":
      return districtUsers.filter((r) => r.level === "园区").length;
    case "group_admin":
      return groupUsers.length;
    case "enterprise_admin":
      return enterpriseUsers.length;
  }
}

// ===== 表格组件 =====

function StatusBadge({ status, subtle = false }: { status: "启用" | "停用"; subtle?: boolean }) {
  if (subtle) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            status === "启用" ? "bg-emerald-500/70" : "bg-muted-foreground/40",
          )}
        />
        {status}
      </span>
    );
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-normal",
        status === "启用"
          ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/5"
          : "border-muted-foreground/30 text-muted-foreground bg-muted/30",
      )}
    >
      <span
        className={cn(
          "mr-1 inline-block h-1.5 w-1.5 rounded-full",
          status === "启用" ? "bg-emerald-500" : "bg-muted-foreground/50",
        )}
      />
      {status}
    </Badge>
  );
}

function ActionButtons({
  account,
  status,
  onChangePwd,
  disableLocked,
  disableLockedReason,
}: {
  account: string;
  status: "启用" | "停用";
  onChangePwd: (acc: string) => void;
  disableLocked?: boolean;
  disableLockedReason?: string;
}) {
  const disableBtn = (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs gap-1"
      disabled={disableLocked}
      onClick={() =>
        toast({
          title: status === "启用" ? "已停用账号" : "已启用账号",
          description: account,
        })
      }
    >
      {status === "启用" ? (
        <ShieldOff className="h-3.5 w-3.5" />
      ) : (
        <ShieldCheck className="h-3.5 w-3.5" />
      )}
      {status === "启用" ? "禁用" : "启用"}
    </Button>
  );

  return (
    <div className="flex items-center gap-1 justify-end">
      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
        <Pencil className="h-3.5 w-3.5" />
        编辑
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs gap-1"
        onClick={() => onChangePwd(account)}
      >
        <KeyRound className="h-3.5 w-3.5" />
        修改密码
      </Button>
      {disableLocked ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{disableBtn}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {disableLockedReason ?? "无操作权限"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        disableBtn
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
        删除
      </Button>
    </div>
  );
}

function CityTable({
  rows,
  onChangePwd,
  onViewEnterprises,
  groupByDepartment,
}: {
  rows: CityUser[];
  onChangePwd: (acc: string) => void;
  onViewEnterprises: (u: CityUser) => void;
  groupByDepartment: boolean;
}) {
  const groups = useMemo(() => {
    if (!groupByDepartment) return [{ dept: "__all__", items: rows }];
    const map = new Map<string, CityUser[]>();
    rows.forEach((r) => {
      if (!map.has(r.department)) map.set(r.department, []);
      map.get(r.department)!.push(r);
    });
    return Array.from(map.entries()).map(([dept, items]) => ({ dept, items }));
  }, [rows, groupByDepartment]);

  const renderHeader = () => (
    <TableHeader>
      <TableRow className="bg-muted/40">
        <TableHead className="h-9 text-xs">账号</TableHead>
        <TableHead className="h-9 text-xs whitespace-nowrap">姓名</TableHead>
        {!groupByDepartment && <TableHead className="h-9 text-xs">所属科室</TableHead>}
        <TableHead className="h-9 text-xs">角色</TableHead>
        <TableHead className="h-9 text-xs text-right whitespace-nowrap">对口企业</TableHead>
        <TableHead className="h-9 text-xs">手机号</TableHead>
        <TableHead className="h-9 text-xs">状态</TableHead>
        <TableHead className="h-9 text-xs text-right">操作</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderRow = (r: CityUser) => (
    <TableRow key={r.id} className="text-xs">
      <TableCell className="py-2 font-mono text-foreground">{r.account}</TableCell>
      <TableCell className="py-2 whitespace-nowrap">{r.name}</TableCell>
      {!groupByDepartment && <TableCell className="py-2">{r.department}</TableCell>}
      <TableCell className="py-2">
        <Badge variant="secondary" className="text-[11px] font-normal">
          {r.role}
        </Badge>
      </TableCell>
      <TableCell className="py-2 text-right">
        <button
          onClick={() => onViewEnterprises(r)}
          className="font-mono text-primary hover:underline"
        >
          {r.managedEnterprises.toLocaleString()}
        </button>
      </TableCell>
      <TableCell className="py-2 font-mono text-muted-foreground">{r.phone}</TableCell>
      <TableCell className="py-2">
        <StatusBadge status={r.status} subtle />
      </TableCell>
      <TableCell className="py-2">
        <ActionButtons account={r.account} status={r.status} onChangePwd={onChangePwd} />
      </TableCell>
    </TableRow>
  );

  if (!groupByDepartment) {
    return (
      <Table>
        {renderHeader()}
        <TableBody>{rows.map(renderRow)}</TableBody>
      </Table>
    );
  }

  return (
    <div>
      {groups.map((g) => (
        <div key={g.dept} className="border-b border-border last:border-b-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 border-b border-border">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-foreground">{g.dept}</span>
            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
              {g.items.length} 人
            </Badge>
          </div>
          <Table>
            {renderHeader()}
            <TableBody>{g.items.map(renderRow)}</TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

function DistrictTable({
  rows,
  level,
  onChangePwd,
}: {
  rows: DistrictUser[];
  level: "区" | "园区";
  onChangePwd: (acc: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="h-9 text-xs">账号</TableHead>
          <TableHead className="h-9 text-xs">{level === "区" ? "区县名称" : "园区名称"}</TableHead>
          <TableHead className="h-9 text-xs">负责人</TableHead>
          <TableHead className="h-9 text-xs">中心对口人</TableHead>
          <TableHead className="h-9 text-xs text-right">辖区企业数</TableHead>
          <TableHead className="h-9 text-xs">手机号</TableHead>
          <TableHead className="h-9 text-xs">状态</TableHead>
          <TableHead className="h-9 text-xs text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} className="text-xs">
            <TableCell className="py-2 font-mono">{r.account}</TableCell>
            <TableCell className="py-2 font-medium">{r.areaName}</TableCell>
            <TableCell className="py-2">{r.owner}</TableCell>
            <TableCell className="py-2 text-muted-foreground">{r.cityContact}</TableCell>
            <TableCell className="py-2 text-right font-mono">{r.enterpriseCount}</TableCell>
            <TableCell className="py-2 font-mono text-muted-foreground">{r.phone}</TableCell>
            <TableCell className="py-2">
              <StatusBadge status={r.status} />
            </TableCell>
            <TableCell className="py-2">
              <ActionButtons account={r.account} status={r.status} onChangePwd={onChangePwd} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function GroupTable({
  rows,
  onChangePwd,
}: {
  rows: GroupUser[];
  onChangePwd: (acc: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="h-9 text-xs">账号</TableHead>
          <TableHead className="h-9 text-xs">集团名称</TableHead>
          <TableHead className="h-9 text-xs">集团负责人</TableHead>
          <TableHead className="h-9 text-xs">管辖下属企业</TableHead>
          <TableHead className="h-9 text-xs">手机号</TableHead>
          <TableHead className="h-9 text-xs">状态</TableHead>
          <TableHead className="h-9 text-xs text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id} className="text-xs">
            <TableCell className="py-2 font-mono">{r.account}</TableCell>
            <TableCell className="py-2 font-medium">{r.groupName}</TableCell>
            <TableCell className="py-2">{r.owner}</TableCell>
            <TableCell className="py-2">
              <div className="flex flex-wrap gap-1 max-w-md">
                {r.subsidiaries.slice(0, 3).map((s) => (
                  <Badge key={s} variant="outline" className="text-[10px] font-normal">
                    {s}
                  </Badge>
                ))}
                {r.subsidiaries.length > 3 && (
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    +{r.subsidiaries.length - 3}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="py-2 font-mono text-muted-foreground">{r.phone}</TableCell>
            <TableCell className="py-2">
              <StatusBadge status={r.status} />
            </TableCell>
            <TableCell className="py-2">
              <ActionButtons account={r.account} status={r.status} onChangePwd={onChangePwd} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EnterpriseTable({
  rows,
  canDisableHighEnergy,
  currentRoleLabel,
  onChangePwd,
}: {
  rows: EnterpriseUser[];
  canDisableHighEnergy: boolean;
  currentRoleLabel: string;
  onChangePwd: (acc: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="h-9 text-xs">账号</TableHead>
          <TableHead className="h-9 text-xs">企业名称</TableHead>
          <TableHead className="h-9 text-xs">统一社会信用代码</TableHead>
          <TableHead className="h-9 text-xs">能耗级别</TableHead>
          <TableHead className="h-9 text-xs">行业分类</TableHead>
          <TableHead className="h-9 text-xs">所属区</TableHead>
          <TableHead className="h-9 text-xs">负责人</TableHead>
          <TableHead className="h-9 text-xs">状态</TableHead>
          <TableHead className="h-9 text-xs text-right">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const isHighEnergy = r.energyLevel === "2000吨标煤及以上";
          const lockDisable = isHighEnergy && !canDisableHighEnergy;
          return (
            <TableRow key={r.id} className="text-xs">
              <TableCell className="py-2 font-mono">{r.account}</TableCell>
              <TableCell className="py-2 font-medium">{r.enterpriseName}</TableCell>
              <TableCell className="py-2 font-mono text-muted-foreground">
                {r.creditCode}
              </TableCell>
              <TableCell className="py-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-normal",
                    isHighEnergy
                      ? "border-amber-500/50 text-amber-600 bg-amber-500/5"
                      : r.energyLevel === "1000-2000吨标煤"
                        ? "border-blue-500/40 text-blue-600 bg-blue-500/5"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {r.energyLevel}
                </Badge>
              </TableCell>
              <TableCell className="py-2 text-muted-foreground">{r.industry}</TableCell>
              <TableCell className="py-2">{r.district}</TableCell>
              <TableCell className="py-2">{r.owner}</TableCell>
              <TableCell className="py-2">
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell className="py-2">
                <ActionButtons
                  account={r.account}
                  status={r.status}
                  onChangePwd={onChangePwd}
                  disableLocked={lockDisable}
                  disableLockedReason={`「2000 吨标煤及以上」企业仅市级 / 平台管理员可禁用，当前角色为「${currentRoleLabel}」`}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ===== 修改密码弹窗 =====

function ChangePasswordDialog({
  open,
  onOpenChange,
  accountName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accountName: string;
}) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const pwdValid = PASSWORD_RE.test(pwd);
  const matched = pwd.length > 0 && pwd === confirm;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setPwd("");
          setConfirm("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" />
            修改密码
          </DialogTitle>
          <DialogDescription className="text-xs">
            目标账号：<span className="font-mono text-foreground">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="new-pwd" className="text-xs">
              新密码 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-pwd"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="8-20 位，含大小写字母 + 数字 + 特殊字符"
              className="h-9 text-sm"
            />
            <p
              className={cn(
                "text-[11px]",
                pwd.length === 0
                  ? "text-muted-foreground"
                  : pwdValid
                    ? "text-emerald-600"
                    : "text-destructive",
              )}
            >
              规则：长度 8-20 位，必须包含大写字母、小写字母、数字、特殊字符
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pwd" className="text-xs">
              确认密码 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirm-pwd"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入新密码"
              className="h-9 text-sm"
            />
            {confirm.length > 0 && !matched && (
              <p className="text-[11px] text-destructive">两次输入的密码不一致</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            size="sm"
            disabled={!pwdValid || !matched}
            onClick={() => {
              toast({ title: "密码已更新", description: `账号 ${accountName} 的密码修改成功` });
              onOpenChange(false);
            }}
          >
            确认修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== 新建企业账号弹窗 =====

function CreateEnterpriseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [creditCode, setCreditCode] = useState("");
  const [enterpriseName, setEnterpriseName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState(genRandomPassword());

  const codeValid = CREDIT_CODE_RE.test(creditCode);
  const accountValid = /^[A-Za-z][A-Za-z0-9]{5,19}$/.test(account);

  const reset = () => {
    setCreditCode("");
    setEnterpriseName("");
    setAccount("");
    setPassword(genRandomPassword());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" />
            新建企业账号
          </DialogTitle>
          <DialogDescription className="text-xs">
            创建后系统自动下发初始密码，企业管理员首次登录需修改
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">
              统一社会信用代码 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={creditCode}
              onChange={(e) => setCreditCode(e.target.value.toUpperCase())}
              placeholder="18 位字母 + 数字组合"
              maxLength={18}
              className="h-9 font-mono text-sm"
            />
            <p
              className={cn(
                "text-[11px]",
                creditCode.length === 0
                  ? "text-muted-foreground"
                  : codeValid
                    ? "text-emerald-600"
                    : "text-destructive",
              )}
            >
              {creditCode.length === 0
                ? "示例：91310000123456789X"
                : codeValid
                  ? "✓ 信用代码格式正确"
                  : `✗ 当前 ${creditCode.length}/18 位，格式不符合 GB 32100 规范`}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              企业名称 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={enterpriseName}
              onChange={(e) => setEnterpriseName(e.target.value)}
              placeholder="请输入工商注册全称"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              账户名 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="6-20 位，字母开头，可含数字"
              maxLength={20}
              className="h-9 font-mono text-sm"
            />
            <p
              className={cn(
                "text-[11px]",
                account.length === 0
                  ? "text-muted-foreground"
                  : accountValid
                    ? "text-emerald-600"
                    : "text-destructive",
              )}
            >
              规则：长度 6-20 位，字母或字母数字组合，不分大小写
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">默认密码</Label>
            <div className="flex gap-2">
              <Input
                value={password}
                readOnly
                className="h-9 font-mono text-sm bg-muted/40"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1 text-xs shrink-0"
                onClick={() => setPassword(genRandomPassword())}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重新生成
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              系统自动生成，符合 8-20 位 + 大小写 + 数字 + 特殊字符规则
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            size="sm"
            disabled={!codeValid || !accountValid || !enterpriseName.trim()}
            onClick={() => {
              toast({
                title: "企业账号创建成功",
                description: `${enterpriseName} · 账户 ${account}`,
              });
              onOpenChange(false);
            }}
          >
            创建账号
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
