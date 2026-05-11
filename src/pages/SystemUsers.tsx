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
  Filter,
  MoreHorizontal,
  Check,
  X,
  Building2,
  Users as UsersIcon,
  Tag,
  Zap,
  Award,
  Briefcase,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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

interface EnterpriseLite {
  name: string;
  creditCode: string;
  owner: string;
  phone: string;
  disabled?: boolean;
}

interface CityUser {
  id: string;
  account: string;
  name: string;
  department: string; // 所属组织
  role: "市管理员" | "管理员" | "对口人";
  managedEnterprises: number;
  phone: string;
  status: "启用" | "停用";
  enterpriseList?: EnterpriseLite[]; // 对口企业列表
}

interface DistrictUser {
  id: string;
  account: string;
  areaName: string; // 区县/园区名称
  level: "区" | "园区";
  fullName: string; // 单位全称
  address: string; // 地址
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
  address: string; // 地址
  cityContact: string; // 中心对口人
  subsidiaries: string[]; // 下属企业
  phone: string;
  status: "启用" | "停用";
}

export interface EnterpriseUser {
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
  cityContact?: string; // 中心对口人
  park?: string; // 所属园区
  group?: string; // 所属集团
}

const CITY_DEPARTMENTS = [
  "市经信委",
  "市发改委",
  "市统计局-能源统计处",
  "节能处-综合办公室",
  "节能处-能碳监测科",
  "节能处-节能监察科",
  "节能处-能效管理科",
  "节能处-宣教推广科",
];

const SAMPLE_ENTERPRISES = [
  "华谊化工有限公司", "宝山钢铁股份有限公司", "中芯国际集成电路", "申永纸业有限公司",
  "锦华纺织有限公司", "永和食品制造有限公司", "上海石化炼油厂", "东方汽轮机厂",
  "华东电力设备制造", "上汽大众动力总成", "金桥半导体", "临港新能源科技",
  "申能燃机发电", "宝冶建设集团", "光明乳业制造基地", "晨光文具制造",
  "三爱富新材料", "华虹半导体", "外高桥造船", "振华重工制造",
  "上海石化股份", "巴斯夫聚氨酯", "赛科石化", "高桥石化",
  "氯碱化工", "天原化工", "氟化工股份", "氯碱新材料",
  "华谊精细化工", "中石化上海", "中石油上海", "申能集团动力",
];

const CITY_FIRST_NAMES = ["张", "李", "王", "陈", "刘", "杨", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗", "梁"];
const CITY_GIVEN_NAMES = ["明远", "静怡", "思源", "雨涵", "建国", "晓燕", "宏伟", "云飞", "丹丹", "志勇", "晓东", "丽华", "建华", "建军", "文博", "慧敏", "晓琳", "明月", "海涛", "若曦", "天宇", "梓萱", "佳怡", "瑞泽"];

function genName(seed: number): string {
  const f = CITY_FIRST_NAMES[seed % CITY_FIRST_NAMES.length];
  const g = CITY_GIVEN_NAMES[(seed * 7) % CITY_GIVEN_NAMES.length];
  return f + g;
}

const ENT_OWNER_FIRST = ["顾", "胡", "林", "梁", "范", "高", "王", "李", "赵", "钱", "孙", "周"];
const ENT_OWNER_GIVEN = ["建华", "建军", "文博", "慧敏", "晓琳", "明月", "海涛", "若曦", "瑞泽", "云飞", "佳怡"];

function genEnterprise(seed: number): EnterpriseLite {
  const name = SAMPLE_ENTERPRISES[seed % SAMPLE_ENTERPRISES.length];
  const owner =
    ENT_OWNER_FIRST[seed % ENT_OWNER_FIRST.length] +
    ENT_OWNER_GIVEN[(seed * 5) % ENT_OWNER_GIVEN.length];
  const code = `9131000${String(1000000000 + (seed * 73856093) % 8999999999).slice(0, 11)}`;
  const phone = `13${8 + (seed % 2)}${String(10000000 + (seed * 4567) % 89999999).slice(0, 8)}`;
  return { name, creditCode: code.slice(0, 18), owner, phone };
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
      const role: CityUser["role"] = isAdmin ? "市管理员" : isHead ? "管理员" : "对口人";
      const entCount = role === "市管理员" ? 1287 : role === "管理员" ? 200 + ((idx * 37) % 300) : 20 + ((idx * 13) % 80);
      // 生成对口企业完整明细（与展示数量一致，最多 80 家以保证演示分页）
      const listSize = Math.min(entCount, 80);
      const enterpriseList: EnterpriseLite[] = Array.from({ length: listSize }, (_, k) =>
        genEnterprise(idx * 31 + k * 7),
      );
      // 账号：字母开头 + 数字，6-20 位，全局唯一
      const account = `gov${String.fromCharCode(97 + di)}${String(idx).padStart(4, "0")}`;
      list.push({
        id: `C${String(idx).padStart(3, "0")}`,
        account,
        name: genName(idx),
        department: dept,
        role,
        managedEnterprises: entCount,
        phone: `13${8 + (idx % 2)}${String(10000000 + (idx * 73856) % 89999999).slice(0, 8)}`,
        status: idx % 17 === 0 ? "停用" : "启用",
        enterpriseList,
      });
    }
  });
  return list;
}

const cityUsers: CityUser[] = genCityUsers();

const INITIAL_DISTRICT_USERS: DistrictUser[] = [
  { id: "D001", account: "huangpu_admin", areaName: "黄浦区", level: "区", fullName: "黄浦区商务委员会", address: "广东路357号1号楼西908室品牌经济科", owner: "周建国", cityContact: "王思源", enterpriseCount: 86, phone: "138****0011", status: "启用" },
  { id: "D002", account: "pudong_admin", areaName: "浦东新区", level: "区", fullName: "浦东新区经济和信息化委员会", address: "浦东新区世纪大道2001号5楼节能科", owner: "刘晓燕", cityContact: "王思源", enterpriseCount: 312, phone: "138****0022", status: "启用" },
  { id: "D003", account: "minhang_admin", areaName: "闵行区", level: "区", fullName: "闵行区经济委员会", address: "闵行区沪闵路6258号3号楼406室", owner: "赵宏伟", cityContact: "陈雨涵", enterpriseCount: 178, phone: "138****0033", status: "启用" },
  { id: "D004", account: "zjpark_admin", areaName: "张江高科园区", level: "园区", fullName: "上海张江高科技园区管理委员会", address: "浦东新区张江路665号科技广场B座12层", owner: "孙云飞", cityContact: "陈雨涵", enterpriseCount: 94, phone: "138****0044", status: "启用" },
  { id: "D005", account: "linkong_admin", areaName: "临港装备园区", level: "园区", fullName: "上海临港装备产业园区管委会", address: "浦东新区南汇新城环湖西二路888号", owner: "吴丹丹", cityContact: "王思源", enterpriseCount: 47, phone: "138****0055", status: "停用" },
];

const INITIAL_GROUP_USERS: GroupUser[] = [
  { id: "G001", account: "huayi_group", groupName: "华谊集团", owner: "黄志勇", address: "静安区常德路809号华谊集团大厦", cityContact: "刘鑫", subsidiaries: ["华谊化工有限公司", "华谊新材料股份", "华谊精细化学"], phone: "138****7001", status: "启用" },
  { id: "G002", account: "baowu_group", groupName: "宝武钢铁集团", owner: "马晓东", address: "宝山区富锦路885号宝武大厦A座18楼", cityContact: "陈玲凯", subsidiaries: ["宝山钢铁", "宝武特钢", "宝武不锈钢", "宝武碳业"], phone: "138****7002", status: "启用" },
  { id: "G003", account: "shdz_group", groupName: "上海电气集团", owner: "郑丽华", address: "静安区南京西路211号上海电气大厦", cityContact: "蒋伊莹", subsidiaries: ["电气重工", "电气风电", "电气输配电"], phone: "138****7003", status: "启用" },
];

export const enterpriseUsers: EnterpriseUser[] = [
  { id: "E001", account: "huayi_chem01", enterpriseName: "华谊化工有限公司", creditCode: "913100007123456789", energyLevel: "2000吨标煤及以上", industry: "化学原料和化学制品制造业", district: "金山区", owner: "顾建华", phone: "13800138001", status: "启用", cityContact: "王思源", park: "上海化学工业园", group: "华谊集团" },
  { id: "E002", account: "baoshan_steel", enterpriseName: "宝山钢铁股份有限公司", creditCode: "913100001234567890", energyLevel: "2000吨标煤及以上", industry: "黑色金属冶炼和压延加工业", district: "宝山区", owner: "胡建军", phone: "13800138002", status: "启用", cityContact: "陈雨涵", park: "宝山钢铁产业园", group: "宝武钢铁集团" },
  { id: "E003", account: "smic_fab", enterpriseName: "中芯国际集成电路", creditCode: "913100009876543210", energyLevel: "2000吨标煤及以上", industry: "计算机、通信和其他电子设备制造业", district: "浦东新区", owner: "林文博", phone: "13800138003", status: "启用", cityContact: "王思源", park: "张江高科园区", group: "—" },
  { id: "E004", account: "syp_paper", enterpriseName: "申永纸业有限公司", creditCode: "913100005566778899", energyLevel: "1000-2000吨标煤", industry: "造纸和纸制品业", district: "青浦区", owner: "梁慧敏", phone: "13800138004", status: "启用", cityContact: "陈雨涵", park: "青浦工业园", group: "—" },
  { id: "E005", account: "jh_textile", enterpriseName: "锦华纺织有限公司", creditCode: "913100003344556677", energyLevel: "1000吨标煤以下", industry: "纺织业", district: "松江区", owner: "范晓琳", phone: "13800138005", status: "停用", cityContact: "王思源", park: "松江出口加工区", group: "—" },
  { id: "E006", account: "yh_food", enterpriseName: "永和食品制造有限公司", creditCode: "913100002233445566", energyLevel: "1000吨标煤以下", industry: "食品制造业", district: "嘉定区", owner: "高明月", phone: "13800138006", status: "启用", cityContact: "陈雨涵", park: "嘉定工业区", group: "光明集团" },
  // 黄浦区 辖区企业（区管理员演示数据）
  { id: "E101", account: "hp_printing", enterpriseName: "黄浦印务集团有限公司", creditCode: "913101010001110011", energyLevel: "1000-2000吨标煤", industry: "印刷和记录媒介复制业", district: "黄浦区", owner: "陈志远", phone: "13900139001", status: "启用", cityContact: "王思源", park: "外滩金融商务区", group: "上海文化传媒集团" },
  { id: "E102", account: "hp_pharma", enterpriseName: "黄浦医药制造股份", creditCode: "913101010001110022", energyLevel: "2000吨标煤及以上", industry: "医药制造业", district: "黄浦区", owner: "苏婉清", phone: "13900139002", status: "启用", cityContact: "王思源", park: "—", group: "上药集团" },
  { id: "E103", account: "hp_textile", enterpriseName: "申城针织有限公司", creditCode: "913101010001110033", energyLevel: "1000吨标煤以下", industry: "纺织服装、服饰业", district: "黄浦区", owner: "周慧敏", phone: "13900139003", status: "启用", cityContact: "陈雨涵", park: "—", group: "—" },
  { id: "E104", account: "hp_machine", enterpriseName: "上海精密机械制造厂", creditCode: "913101010001110044", energyLevel: "1000-2000吨标煤", industry: "通用设备制造业", district: "黄浦区", owner: "李建国", phone: "13900139004", status: "启用", cityContact: "陈雨涵", park: "南外滩制造业园", group: "上海电气集团" },
  { id: "E105", account: "hp_chem", enterpriseName: "黄浦精细化工有限公司", creditCode: "913101010001110055", energyLevel: "2000吨标煤及以上", industry: "化学原料和化学制品制造业", district: "黄浦区", owner: "张文斌", phone: "13900139005", status: "启用", cityContact: "王思源", park: "—", group: "华谊集团" },
  { id: "E106", account: "hp_food", enterpriseName: "老城厢食品工业公司", creditCode: "913101010001110066", energyLevel: "1000吨标煤以下", industry: "食品制造业", district: "黄浦区", owner: "钱明珠", phone: "13900139006", status: "启用", cityContact: "陈雨涵", park: "—", group: "光明集团" },
  { id: "E107", account: "hp_print2", enterpriseName: "外滩印刷厂", creditCode: "913101010001110077", energyLevel: "1000吨标煤以下", industry: "印刷和记录媒介复制业", district: "黄浦区", owner: "黄文翰", phone: "13900139007", status: "停用", cityContact: "王思源", park: "—", group: "—" },
  { id: "E108", account: "hp_paper", enterpriseName: "黄浦造纸有限责任公司", creditCode: "913101010001110088", energyLevel: "1000-2000吨标煤", industry: "造纸和纸制品业", district: "黄浦区", owner: "孙佳怡", phone: "13900139008", status: "启用", cityContact: "陈雨涵", park: "—", group: "—" },
  { id: "E109", account: "hp_metal", enterpriseName: "申江有色金属加工", creditCode: "913101010001110099", energyLevel: "2000吨标煤及以上", industry: "有色金属冶炼和压延加工业", district: "黄浦区", owner: "罗振华", phone: "13900139009", status: "启用", cityContact: "王思源", park: "南外滩制造业园", group: "—" },
  { id: "E110", account: "hp_glass", enterpriseName: "上海玻璃制品厂", creditCode: "913101010001110100", energyLevel: "1000吨标煤以下", industry: "非金属矿物制品业", district: "黄浦区", owner: "韩雪梅", phone: "13900139010", status: "启用", cityContact: "陈雨涵", park: "—", group: "—" },
  { id: "E111", account: "hp_pharma2", enterpriseName: "申城生物制药", creditCode: "913101010001110111", energyLevel: "1000-2000吨标煤", industry: "医药制造业", district: "黄浦区", owner: "赵瑞祥", phone: "13900139011", status: "启用", cityContact: "王思源", park: "—", group: "上药集团" },
  { id: "E112", account: "hp_furniture", enterpriseName: "黄浦家具制造有限公司", creditCode: "913101010001110122", energyLevel: "1000吨标煤以下", industry: "家具制造业", district: "黄浦区", owner: "马思齐", phone: "13900139012", status: "启用", cityContact: "陈雨涵", park: "—", group: "—" },
];

// ===== 工具函数 =====

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
const CREDIT_CODE_RE = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;

// ===== 企业标签规则 =====
// 1. 区下属：由所属区/园区/集团管理，无市级中心对口人
// 2. "百千家"、通信业：市级重点对接的大型用能企业，由中心对口人对接
export type EnterpriseTag = "区下属" | "\"百千家\"、通信业";

export function getEnterpriseTag(e: Pick<EnterpriseUser, "energyLevel" | "industry">): EnterpriseTag {
  const isKey =
    e.energyLevel === "2000吨标煤及以上" ||
    e.industry.includes("通信") ||
    e.industry.includes("电子");
  return isKey ? "\"百千家\"、通信业" : "区下属";
}

/** 业务规则：仅"百千家"、通信业的企业由中心对口人对接；区下属企业无市级对口人 */
export function getEffectiveContact(e: EnterpriseUser): string {
  return getEnterpriseTag(e) === "区下属" ? "—" : e.cityContact ?? "—";
}

export function EnterpriseTagBadge({ tag }: { tag: EnterpriseTag }) {
  const isKey = tag !== "区下属";
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-normal whitespace-nowrap",
        isKey
          ? "border-primary/40 text-primary bg-primary/5"
          : "border-muted-foreground/30 text-muted-foreground bg-muted/30",
      )}
    >
      {tag}
    </Badge>
  );
}

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

  // 市管理员子标签 & 下钻
  const [cityTab, setCityTab] = useState<"users" | "district" | "park" | "group" | "enterprise">("users");
  const [drillDistrict, setDrillDistrict] = useState<DistrictUser | null>(null);
  const [drillGroup, setDrillGroup] = useState<GroupUser | null>(null);

  // 组织（市管账号-用户账号-组织）维护
  const [departments, setDepartments] = useState<string[]>(CITY_DEPARTMENTS);
  const [users, setUsers] = useState<CityUser[]>(cityUsers);
  const [districtUsers, setDistrictUsers] = useState<DistrictUser[]>(INITIAL_DISTRICT_USERS);
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>(INITIAL_GROUP_USERS);
  const [entityManageOpen, setEntityManageOpen] = useState<null | "区" | "园区" | "集团">(null);
  const [orgManageOpen, setOrgManageOpen] = useState(false);
  const userCountByDept = useMemo(() => {
    const m: Record<string, number> = {};
    users.forEach((u) => {
      m[u.department] = (m[u.department] ?? 0) + 1;
    });
    return m;
  }, [users]);
  const handleAddDepartment = (name: string) => {
    const v = name.trim();
    if (!v) {
      toast({ title: "组织名称不能为空", variant: "destructive" });
      return false;
    }
    if (v.length > 30) {
      toast({ title: "组织名称不超过 30 个字符", variant: "destructive" });
      return false;
    }
    if (departments.includes(v)) {
      toast({ title: "组织名称已存在", variant: "destructive" });
      return false;
    }
    setDepartments((arr) => [...arr, v]);
    toast({ title: "已新增组织", description: v });
    return true;
  };
  const handleRenameDepartment = (oldName: string, newName: string) => {
    const v = newName.trim();
    if (!v) {
      toast({ title: "组织名称不能为空", variant: "destructive" });
      return false;
    }
    if (v === oldName) return true;
    if (v.length > 30) {
      toast({ title: "组织名称不超过 30 个字符", variant: "destructive" });
      return false;
    }
    if (departments.includes(v)) {
      toast({ title: "组织名称已存在", variant: "destructive" });
      return false;
    }
    setDepartments((arr) => arr.map((d) => (d === oldName ? v : d)));
    setUsers((arr) =>
      arr.map((u) => (u.department === oldName ? { ...u, department: v } : u)),
    );
    if (deptFilter === oldName) setDeptFilter(v);
    toast({ title: "已重命名组织", description: `${oldName} → ${v}` });
    return true;
  };
  const handleDeleteDepartment = (name: string) => {
    if ((userCountByDept[name] ?? 0) > 0) {
      toast({
        title: "无法删除",
        description: `「${name}」下仍有 ${userCountByDept[name]} 个账号，请先迁移或删除`,
        variant: "destructive",
      });
      return false;
    }
    setDepartments((arr) => arr.filter((d) => d !== name));
    if (deptFilter === name) setDeptFilter("all");
    toast({ title: "已删除组织", description: name });
    return true;
  };

  // 区/园区/集团 增删改（市管账号）
  const entityList = useMemo<string[]>(() => {
    if (entityManageOpen === "区") return districtUsers.filter((d) => d.level === "区").map((d) => d.areaName);
    if (entityManageOpen === "园区") return districtUsers.filter((d) => d.level === "园区").map((d) => d.areaName);
    if (entityManageOpen === "集团") return groupUsers.map((g) => g.groupName);
    return [];
  }, [entityManageOpen, districtUsers, groupUsers]);
  const entityUsageCount = useMemo<Record<string, number>>(() => {
    const m: Record<string, number> = {};
    if (entityManageOpen === "区") {
      enterpriseUsers.forEach((e) => { m[e.district] = (m[e.district] ?? 0) + 1; });
    } else if (entityManageOpen === "园区") {
      enterpriseUsers.forEach((e) => { if (e.park) m[e.park] = (m[e.park] ?? 0) + 1; });
    } else if (entityManageOpen === "集团") {
      enterpriseUsers.forEach((e) => { if (e.group) m[e.group] = (m[e.group] ?? 0) + 1; });
    }
    return m;
  }, [entityManageOpen]);
  const handleAddEntity = (name: string): boolean => {
    const v = name.trim();
    if (!v) { toast({ title: "名称不能为空", variant: "destructive" }); return false; }
    if (v.length > 30) { toast({ title: "名称不超过 30 个字符", variant: "destructive" }); return false; }
    if (entityList.includes(v)) { toast({ title: "名称已存在", variant: "destructive" }); return false; }
    if (entityManageOpen === "集团") {
      const id = `G${String(groupUsers.length + 1).padStart(3, "0")}`;
      setGroupUsers((arr) => [
        ...arr,
        { id, account: `group_${id.toLowerCase()}`, groupName: v, owner: "—", address: "—", cityContact: "—", subsidiaries: [], phone: "—", status: "启用" },
      ]);
    } else if (entityManageOpen === "区" || entityManageOpen === "园区") {
      const id = `D${String(districtUsers.length + 1).padStart(3, "0")}`;
      const lvl = entityManageOpen;
      setDistrictUsers((arr) => [
        ...arr,
        { id, account: `area_${id.toLowerCase()}`, areaName: v, level: lvl, fullName: v, address: "—", owner: "—", cityContact: "—", enterpriseCount: 0, phone: "—", status: "启用" },
      ]);
    }
    toast({ title: `已新增${entityManageOpen}`, description: v });
    return true;
  };
  const handleRenameEntity = (oldName: string, newName: string): boolean => {
    const v = newName.trim();
    if (!v) { toast({ title: "名称不能为空", variant: "destructive" }); return false; }
    if (v === oldName) return true;
    if (v.length > 30) { toast({ title: "名称不超过 30 个字符", variant: "destructive" }); return false; }
    if (entityList.includes(v)) { toast({ title: "名称已存在", variant: "destructive" }); return false; }
    if (entityManageOpen === "集团") {
      setGroupUsers((arr) => arr.map((g) => (g.groupName === oldName ? { ...g, groupName: v } : g)));
    } else if (entityManageOpen === "区" || entityManageOpen === "园区") {
      setDistrictUsers((arr) => arr.map((d) => (d.areaName === oldName ? { ...d, areaName: v, fullName: d.fullName === oldName ? v : d.fullName } : d)));
    }
    toast({ title: `已重命名${entityManageOpen}`, description: `${oldName} → ${v}` });
    return true;
  };
  const handleDeleteEntity = (name: string): boolean => {
    const used = entityUsageCount[name] ?? 0;
    if (used > 0) {
      toast({ title: "无法删除", description: `「${name}」下仍有 ${used} 家企业，请先迁移`, variant: "destructive" });
      return false;
    }
    if (entityManageOpen === "集团") {
      setGroupUsers((arr) => arr.filter((g) => g.groupName !== name));
    } else if (entityManageOpen === "区" || entityManageOpen === "园区") {
      setDistrictUsers((arr) => arr.filter((d) => d.areaName !== name));
    }
    toast({ title: `已删除${entityManageOpen}`, description: name });
    return true;
  };

  const currentRoleLabel = ROLE_OPTIONS.find((r) => r.value === view)?.label ?? "";


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

      {/* 区管理员：仅展示本账号信息 + 辖区企业列表 */}
      {view === "district_admin" && (
        <DistrictSelfView
          self={districtUsers.find((d) => d.level === "区") ?? districtUsers[0]}
          enterprises={enterpriseUsers}
          onChangePwd={(acc) => {
            setPwdTarget(acc);
            setPwdOpen(true);
          }}
        />
      )}

      {/* 园区管理员：仅展示本账号信息 + 园区企业列表 */}
      {view === "park_admin" && (
        <DistrictSelfView
          level="园区"
          self={districtUsers.find((d) => d.level === "园区") ?? districtUsers[0]}
          enterprises={enterpriseUsers}
          onChangePwd={(acc) => {
            setPwdTarget(acc);
            setPwdOpen(true);
          }}
        />
      )}

      {/* 集团管理员：仅展示本账号信息 + 集团企业列表 */}
      {view === "group_admin" && (() => {
        const g = groupUsers[0];
        const groupSelf: DistrictUser = {
          id: g.id,
          account: g.account,
          areaName: g.groupName,
          level: "区",
          fullName: g.groupName,
          address: g.address,
          owner: g.owner,
          cityContact: g.cityContact,
          enterpriseCount: enterpriseUsers.filter((e) => e.group === g.groupName).length,
          phone: g.phone,
          status: g.status,
        };
        return (
          <DistrictSelfView
            level="集团"
            self={groupSelf}
            enterprises={enterpriseUsers}
            onChangePwd={(acc) => {
              setPwdTarget(acc);
              setPwdOpen(true);
            }}
          />
        );
      })()}

      {/* 企业管理员：仅展示本企业信息 */}
      {view === "enterprise_admin" && (
        <EnterpriseSelfView
          self={enterpriseUsers[0]}
          onChangePwd={(acc) => {
            setPwdTarget(acc);
            setPwdOpen(true);
          }}
        />
      )}

      {/* 市管理员：下钻查看某区/园区/集团下属企业（同区/集团管理员视角） */}
      {view === "city_admin" && drillDistrict && (
        <div className="mb-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => setDrillDistrict(null)}
          >
            ← 返回{drillDistrict.level === "园区" ? "园区列表" : "区列表"}
          </Button>
        </div>
      )}
      {view === "city_admin" && drillDistrict && (
        <DistrictSelfView
          level={drillDistrict.level}
          self={drillDistrict}
          enterprises={enterpriseUsers}
          onChangePwd={(acc) => {
            setPwdTarget(acc);
            setPwdOpen(true);
          }}
        />
      )}
      {view === "city_admin" && drillGroup && !drillDistrict && (() => {
        const g = drillGroup;
        const groupSelf: DistrictUser = {
          id: g.id,
          account: g.account,
          areaName: g.groupName,
          level: "区",
          fullName: g.groupName,
          address: g.address,
          owner: g.owner,
          cityContact: g.cityContact,
          enterpriseCount: enterpriseUsers.filter((e) => e.group === g.groupName).length,
          phone: g.phone,
          status: g.status,
        };
        return (
          <>
            <div className="mb-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => setDrillGroup(null)}
              >
                ← 返回集团列表
              </Button>
            </div>
            <DistrictSelfView
              level="集团"
              self={groupSelf}
              enterprises={enterpriseUsers}
              onChangePwd={(acc) => {
                setPwdTarget(acc);
                setPwdOpen(true);
              }}
            />
          </>
        );
      })()}

      {/* 市管理员主面板（未下钻时） */}
      {view === "city_admin" && !drillDistrict && !drillGroup && (
      <Card className="border-border/60">
        <CardContent className="p-0">
          {/* 子标签 */}
          <div className="flex items-center gap-1 border-b border-border px-4 pt-3">
            {[
              { v: "users", label: "用户账号" },
              { v: "district", label: "区列表" },
              { v: "park", label: "园区列表" },
              { v: "group", label: "集团列表" },
              { v: "enterprise", label: "企业列表" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => setCityTab(t.v as typeof cityTab)}
                className={cn(
                  "h-8 px-3 text-xs rounded-t-md border-b-2 -mb-px transition-colors",
                  cityTab === t.v
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={
                  cityTab === "users"
                    ? "搜索账号 / 名称 / 负责人"
                    : cityTab === "enterprise"
                    ? "搜索企业名称 / 信用代码 / 负责人"
                    : "搜索名称 / 账号 / 负责人"
                }
                className="h-8 w-64 pl-8 text-xs"
              />
            </div>
            {cityTab === "users" && (
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
            )}
            {cityTab === "users" && (
              <>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue placeholder="组织" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部组织</SelectItem>
                    {departments.map((d) => (
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
                  按组织分组
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => setOrgManageOpen(true)}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  管理组织
                </Button>
              </>
            )}
            {(cityTab === "district" || cityTab === "park" || cityTab === "group") && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() =>
                  setEntityManageOpen(
                    cityTab === "district" ? "区" : cityTab === "park" ? "园区" : "集团",
                  )
                }
              >
                <Briefcase className="h-3.5 w-3.5" />
                管理{cityTab === "district" ? "区" : cityTab === "park" ? "园区" : "集团"}
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
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
                新建账号
              </Button>
            </div>
          </div>

          {/* 表格区 */}
          <div className="overflow-x-auto">
            {cityTab === "users" && (
              <CityTable
                rows={users.filter(
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
            {(cityTab === "district" || cityTab === "park") && (
              <DistrictTable
                rows={districtUsers.filter(
                  (r) =>
                    r.level === (cityTab === "park" ? "园区" : "区") &&
                    (!keyword ||
                      r.areaName.includes(keyword) ||
                      r.account.includes(keyword) ||
                      r.owner.includes(keyword)),
                )}
                level={cityTab === "park" ? "园区" : "区"}
                onChangePwd={(acc) => {
                  setPwdTarget(acc);
                  setPwdOpen(true);
                }}
                onDrill={(r) => setDrillDistrict(r)}
              />
            )}
            {cityTab === "group" && (
              <GroupTable
                rows={groupUsers.filter(
                  (r) =>
                    !keyword ||
                    r.groupName.includes(keyword) ||
                    r.account.includes(keyword) ||
                    r.owner.includes(keyword),
                )}
                onChangePwd={(acc) => {
                  setPwdTarget(acc);
                  setPwdOpen(true);
                }}
                onDrill={(r) => setDrillGroup(r)}
              />
            )}
            {cityTab === "enterprise" && (
              <EnterpriseTable
                rows={enterpriseUsers.filter(
                  (e) =>
                    !keyword ||
                    e.enterpriseName.includes(keyword) ||
                    e.creditCode.includes(keyword) ||
                    e.owner.includes(keyword),
                )}
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
              共 {
                cityTab === "users" ? users.length :
                cityTab === "district" ? districtUsers.filter((r) => r.level === "区").length :
                cityTab === "park" ? districtUsers.filter((r) => r.level === "园区").length :
                cityTab === "group" ? groupUsers.length :
                enterpriseUsers.length
              } 条 · 当前视图：{currentRoleLabel}
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
      )}

      <ChangePasswordDialog
        open={pwdOpen}
        onOpenChange={setPwdOpen}
        accountName={pwdTarget}
      />
      <CreateEnterpriseDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EnterpriseListDialog user={entListUser} editable={view === "city_admin"} onOpenChange={(o) => !o && setEntListUser(null)} />
      <OrganizationManageDialog
        open={orgManageOpen}
        onOpenChange={setOrgManageOpen}
        departments={departments}
        userCountByDept={userCountByDept}
        onAdd={handleAddDepartment}
        onRename={handleRenameDepartment}
        onDelete={handleDeleteDepartment}
      />
      <EntityManageDialog
        kind={entityManageOpen}
        items={entityList}
        usageCount={entityUsageCount}
        usageNoun="家企业"
        onOpenChange={(o) => !o && setEntityManageOpen(null)}
        onAdd={handleAddEntity}
        onRename={handleRenameEntity}
        onDelete={handleDeleteEntity}
      />
    </AppLayout>
  );
}

function tableCount(v: ViewRole) {
  switch (v) {
    case "city_admin":
      return cityUsers.length;
    case "district_admin":
      return INITIAL_DISTRICT_USERS.filter((r) => r.level === "区").length;
    case "park_admin":
      return INITIAL_DISTRICT_USERS.filter((r) => r.level === "园区").length;
    case "group_admin":
      return INITIAL_GROUP_USERS.length;
    case "enterprise_admin":
      return enterpriseUsers.length;
  }
}

function EnterpriseTable({
  rows,
  onChangePwd,
}: {
  rows: EnterpriseUser[];
  onChangePwd?: (acc: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="h-9 text-xs w-[60px]">序号</TableHead>
          <TableHead className="h-9 text-xs">企业名称</TableHead>
          <TableHead className="h-9 text-xs">统一社会信用代码</TableHead>
          <TableHead className="h-9 text-xs">行业分类</TableHead>
          <TableHead className="h-9 text-xs">标签</TableHead>
          <TableHead className="h-9 text-xs">对口人</TableHead>
          <TableHead className="h-9 text-xs">所属区</TableHead>
          <TableHead className="h-9 text-xs">所属园区</TableHead>
          <TableHead className="h-9 text-xs">所属集团</TableHead>
          <TableHead className="h-9 text-xs">联系人</TableHead>
          <TableHead className="h-9 text-xs">联系电话</TableHead>
          <TableHead className="h-9 text-xs">状态</TableHead>
          {onChangePwd && <TableHead className="h-9 text-xs text-right">操作</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={onChangePwd ? 13 : 12} className="text-center text-xs text-muted-foreground py-8">
              暂无企业数据
            </TableCell>
          </TableRow>
        ) : (
          rows.map((e, idx) => (
            <TableRow key={e.id} className="text-xs">
              <TableCell className="py-2 text-muted-foreground">{idx + 1}</TableCell>
              <TableCell className="py-2 font-medium">
                <Link
                  to={`/enterprise-detail/${encodeURIComponent(e.enterpriseName)}`}
                  className="text-primary hover:underline"
                >
                  {e.enterpriseName}
                </Link>
              </TableCell>
              <TableCell className="py-2 font-mono text-muted-foreground">{e.creditCode}</TableCell>
              <TableCell className="py-2">{e.industry}</TableCell>
              <TableCell className="py-2"><EnterpriseTagBadge tag={getEnterpriseTag(e)} /></TableCell>
              <TableCell className="py-2">{getEffectiveContact(e)}</TableCell>
              <TableCell className="py-2">{e.district}</TableCell>
              <TableCell className="py-2 text-muted-foreground">{e.park ?? "—"}</TableCell>
              <TableCell className="py-2 text-muted-foreground">{e.group ?? "—"}</TableCell>
              <TableCell className="py-2">{e.owner}</TableCell>
              <TableCell className="py-2 font-mono text-muted-foreground">{e.phone}</TableCell>
              <TableCell className="py-2"><StatusBadge status={e.status} subtle /></TableCell>
              {onChangePwd && (
                <TableCell className="py-2">
                  <ActionButtons account={e.account} status={e.status} onChangePwd={onChangePwd} />
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

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
  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
            <MoreHorizontal className="h-3.5 w-3.5" />
            更多
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem className="text-xs gap-2">
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs gap-2"
            onClick={() => onChangePwd(account)}
          >
            <KeyRound className="h-3.5 w-3.5" />
            修改密码
          </DropdownMenuItem>
          {disableLocked ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DropdownMenuItem disabled className="text-xs gap-2">
                      {status === "启用" ? (
                        <ShieldOff className="h-3.5 w-3.5" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      {status === "启用" ? "禁用" : "启用"}
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs max-w-xs">
                  {disableLockedReason ?? "无操作权限"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <DropdownMenuItem
              className="text-xs gap-2"
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
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        {!groupByDepartment && <TableHead className="h-9 text-xs">所属组织</TableHead>}
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

function DistrictSelfView({
  self,
  enterprises,
  onChangePwd,
  level = "区",
}: {
  self: DistrictUser;
  enterprises: EnterpriseUser[];
  onChangePwd: (acc: string) => void;
  level?: "区" | "园区" | "集团";
}) {
  const isPark = level === "园区";
  const isGroup = level === "集团";
  const areaLabel = isGroup ? "集团名称" : isPark ? "园区名称" : "行政区划";
  const listTitle = isGroup ? "集团企业列表" : isPark ? "园区企业列表" : "辖区企业列表";
  const countLabel = isGroup ? "集团企业数量" : isPark ? "园区企业数量" : "辖区企业数量";

  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // 可编辑的本账号信息（前端态）
  const [editing, setEditing] = useState(false);
  const [info, setInfo] = useState({
    account: self.account,
    areaName: self.areaName,
    owner: self.owner,
    cityContact: self.cityContact,
    phone: self.phone.replace(/\*+/, (m) => "8".repeat(m.length)),
  });
  const [draft, setDraft] = useState(info);

  // 范围内企业：区按 district；园区按 park；集团按 group
  const inScope = useMemo(
    () =>
      enterprises.filter((e) =>
        isGroup
          ? e.group === info.areaName
          : isPark
          ? e.park === info.areaName
          : e.district === info.areaName,
      ),
    [enterprises, info.areaName, isPark, isGroup],
  );
  const filtered = useMemo(
    () =>
      inScope.filter(
        (e) =>
          !kw ||
          e.enterpriseName.includes(kw) ||
          e.creditCode.includes(kw) ||
          e.owner.includes(kw),
      ),
    [inScope, kw],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const startEdit = () => {
    setDraft(info);
    setEditing(true);
  };
  const cancelEdit = () => {
    setDraft(info);
    setEditing(false);
  };
  const saveEdit = () => {
    setInfo(draft);
    setEditing(false);
    toast({ title: "已保存", description: "本账号信息已更新" });
  };

  const fields: { key: keyof typeof info; label: string }[] = [
    { key: "account", label: "账号" },
    { key: "areaName", label: areaLabel },
    { key: "owner", label: "负责人" },
    { key: "cityContact", label: "中心对口人" },
    { key: "phone", label: "联系电话" },
  ];

  return (
    <div className="space-y-4">
      {/* 本账号信息 */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              本账号信息
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={cancelEdit}>
                    <X className="h-3.5 w-3.5" />
                    取消
                  </Button>
                  <Button size="sm" className="h-7 text-xs gap-1" onClick={saveEdit}>
                    <Check className="h-3.5 w-3.5" />
                    保存
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onChangePwd(info.account)}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    修改密码
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={startEdit}>
                    <Pencil className="h-3.5 w-3.5" />
                    编辑信息
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 px-4 py-4 text-xs">
            {fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <span className="text-muted-foreground text-[11px]">{f.label}</span>
                {editing ? (
                  <Input
                    value={draft[f.key]}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                    className="h-8 text-xs"
                  />
                ) : (
                  <span className="text-foreground">{info[f.key]}</span>
                )}
              </div>
            ))}
            <InfoItem label={countLabel} value={`${inScope.length} 家`} />
          </div>
        </CardContent>
      </Card>

      {/* 辖区企业列表 */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            <div className="text-sm font-medium">
              {listTitle}
              <span className="ml-2 text-xs text-muted-foreground">
                共 {filtered.length} 家
              </span>
            </div>
            <div className="ml-auto relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={kw}
                onChange={(e) => {
                  setKw(e.target.value);
                  setPage(1);
                }}
                placeholder="搜索企业名称 / 信用代码 / 负责人"
                className="h-8 w-72 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 text-xs w-[60px]">序号</TableHead>
                  <TableHead className="h-9 text-xs">企业名称</TableHead>
                  <TableHead className="h-9 text-xs">统一社会信用代码</TableHead>
                  <TableHead className="h-9 text-xs">行业分类</TableHead>
                  <TableHead className="h-9 text-xs">标签</TableHead>
                  <TableHead className="h-9 text-xs">联系人</TableHead>
                  <TableHead className="h-9 text-xs">联系电话</TableHead>
                  <TableHead className="h-9 text-xs">中心对口人</TableHead>
                  {!isPark && <TableHead className="h-9 text-xs">园区</TableHead>}
                  {!isGroup && <TableHead className="h-9 text-xs">集团</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10 - (isPark ? 1 : 0) - (isGroup ? 1 : 0)} className="text-center text-xs text-muted-foreground py-8">
                      暂无企业数据
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRows.map((e, idx) => (
                    <TableRow key={e.id} className="text-xs">
                      <TableCell className="py-2 text-muted-foreground">
                        {(curPage - 1) * PAGE_SIZE + idx + 1}
                      </TableCell>
                      <TableCell className="py-2 font-medium">
                        <Link
                          to={`/enterprise-detail/${encodeURIComponent(e.enterpriseName)}`}
                          className="text-primary hover:underline"
                        >
                          {e.enterpriseName}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2 font-mono text-muted-foreground">
                        {e.creditCode}
                      </TableCell>
                      <TableCell className="py-2">{e.industry}</TableCell>
                      <TableCell className="py-2"><EnterpriseTagBadge tag={getEnterpriseTag(e)} /></TableCell>
                      <TableCell className="py-2">{e.owner}</TableCell>
                      <TableCell className="py-2 font-mono">{e.phone.replace(/\*+/, (m) => "8".repeat(m.length))}</TableCell>
                      <TableCell className="py-2">{getEffectiveContact(e)}</TableCell>
                      {!isPark && <TableCell className="py-2 text-muted-foreground">{e.park ?? "—"}</TableCell>}
                      {!isGroup && <TableCell className="py-2 text-muted-foreground">{e.group ?? "—"}</TableCell>}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
            <span>共 {filtered.length} 条</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={curPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <span className="px-2">
                {curPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={curPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
function DistrictTable({
  rows,
  level,
  onChangePwd,
  onDrill,
}: {
  rows: DistrictUser[];
  level: "区" | "园区";
  onChangePwd: (acc: string) => void;
  onDrill?: (r: DistrictUser) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="h-9 text-xs">账号</TableHead>
          <TableHead className="h-9 text-xs">{level === "区" ? "区县名称" : "园区名称"}</TableHead>
          <TableHead className="h-9 text-xs">单位全称</TableHead>
          <TableHead className="h-9 text-xs">地址</TableHead>
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
            <TableCell className="py-2 font-medium">
              {onDrill ? (
                <button
                  onClick={() => onDrill(r)}
                  className="text-primary hover:underline"
                >
                  {r.areaName}
                </button>
              ) : (
                r.areaName
              )}
            </TableCell>
            <TableCell className="py-2 max-w-[180px] whitespace-normal break-words">{r.fullName}</TableCell>
            <TableCell className="py-2 max-w-[200px] text-muted-foreground whitespace-pre-wrap break-all">{r.address}</TableCell>
            <TableCell className="py-2">{r.owner}</TableCell>
            <TableCell className="py-2 text-muted-foreground">{r.cityContact}</TableCell>
            <TableCell className="py-2 text-right font-mono">
              {onDrill ? (
                <button
                  onClick={() => onDrill(r)}
                  className="text-primary hover:underline"
                >
                  {r.enterpriseCount}
                </button>
              ) : (
                r.enterpriseCount
              )}
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

function GroupTable({
  rows,
  onChangePwd,
  onDrill,
}: {
  rows: GroupUser[];
  onChangePwd: (acc: string) => void;
  onDrill?: (r: GroupUser) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead className="h-9 text-xs">账号</TableHead>
          <TableHead className="h-9 text-xs">集团名称</TableHead>
          <TableHead className="h-9 text-xs">集团负责人</TableHead>
          <TableHead className="h-9 text-xs">地址</TableHead>
          <TableHead className="h-9 text-xs">中心对口人</TableHead>
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
            <TableCell className="py-2 font-medium">
              {onDrill ? (
                <button
                  onClick={() => onDrill(r)}
                  className="text-primary hover:underline"
                >
                  {r.groupName}
                </button>
              ) : (
                r.groupName
              )}
            </TableCell>
            <TableCell className="py-2">{r.owner}</TableCell>
            <TableCell className="py-2 max-w-[200px] text-muted-foreground whitespace-pre-wrap break-all">{r.address}</TableCell>
            <TableCell className="py-2 text-muted-foreground">{r.cityContact}</TableCell>
            <TableCell className="py-2">
              {onDrill ? (
                <button
                  onClick={() => onDrill(r)}
                  className="text-primary hover:underline tabular-nums"
                >
                  {r.subsidiaries.length} 家
                </button>
              ) : (
                <div className="flex flex-wrap gap-1 max-w-md">
                  {r.subsidiaries.slice(0, 3).map((s) => (
                    <Link
                      key={s}
                      to={`/enterprise-detail/${encodeURIComponent(s)}`}
                    >
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors"
                      >
                        {s}
                      </Badge>
                    </Link>
                  ))}
                  {r.subsidiaries.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      +{r.subsidiaries.length - 3}
                    </Badge>
                  )}
                </div>
              )}
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

// ===== 企业管理员：本企业信息视图 =====

interface EnterpriseProfile {
  // 基础
  creditCode: string;
  enterpriseName: string;
  enterpriseType: string;
  monthlyReportIndustry: string;
  industry: string;
  energyTypes: string[];
  productName: string;
  unitProductEnergy: string;
  // 对口人
  cityContact: { name: string; phone: string };
  districtContact: { name: string; phone: string };
  parkContact: { name: string; phone: string };
  groupContact: { name: string; phone: string };
  // 联系
  address: string;
  zipCode: string;
  officePhone: string;
  fax: string;
  email: string;
  registerDate: string;
  registerCapital: string;
  legalRep: string;
  contactPerson: string;
  contactPhone: string;
  // 归属
  park: string;
  domain: string;
  isCentralEnterprise: boolean;
  centralGroup: string;
  group: string;
  // 能源管理
  energyLevel: string;
  isWanjia: boolean;
  isKeyEnergyUser: boolean;
  enableObsoleteMgmt: boolean;
  energyMgmtOrg: string;
  hasEnergyControlCenter: boolean;
  hasEnergyMgmtCert: boolean;
  energyMgmtCertDate: string;
  energyMgmtCertOrg: string;
  energyMgmtCode: string;
  // 标签
  tags: string[];
}

const SAMPLE_PROFILE: EnterpriseProfile = {
  creditCode: "913100007123456789",
  enterpriseName: "华谊化工有限公司",
  enterpriseType: "非能源加工转换工业企业",
  monthlyReportIndustry: "化工",
  industry: "化学原料和化学制品制造业（C26）",
  energyTypes: ["电力", "天然气", "蒸汽", "原煤"],
  productName: "聚氯乙烯（PVC）树脂",
  unitProductEnergy: "0.42 吨标煤/吨产品",
  cityContact: { name: "王思源", phone: "021-23110001" },
  districtContact: { name: "周建国", phone: "021-63095500" },
  parkContact: { name: "张志强", phone: "021-67891234" },
  groupContact: { name: "黄志勇", phone: "021-52375555" },
  address: "上海市金山区上海化学工业园区芳甸路 1088 号",
  zipCode: "201507",
  officePhone: "021-67896000",
  fax: "021-67896001",
  email: "service@huayichem.com",
  registerDate: "1998-06-18",
  registerCapital: "186,000.00",
  legalRep: "顾建华",
  contactPerson: "陈思敏",
  contactPhone: "13800138001",
  park: "上海化学工业园",
  domain: "石油化工",
  isCentralEnterprise: false,
  centralGroup: "—",
  group: "华谊集团",
  energyLevel: "2000吨标煤及以上",
  isWanjia: true,
  isKeyEnergyUser: true,
  enableObsoleteMgmt: true,
  energyMgmtOrg: "能源与环保管理部",
  hasEnergyControlCenter: true,
  hasEnergyMgmtCert: true,
  energyMgmtCertDate: "2022-09-15",
  energyMgmtCertOrg: "中国质量认证中心（CQC）",
  energyMgmtCode: "JN-SH-3101-0086",
  tags: ["重点用能单位", "万家企业", "石化龙头", "ISO50001", "市级节能示范"],
};

interface DeptRow {
  id: number;
  type: "部门" | "子项目";
  name: string;
  product: string;
}
const SAMPLE_DEPTS: DeptRow[] = [
  { id: 1, type: "部门", name: "聚氯乙烯一车间", product: "PVC 树脂" },
  { id: 2, type: "部门", name: "聚氯乙烯二车间", product: "PVC 树脂" },
  { id: 3, type: "子项目", name: "氯碱装置", product: "烧碱、氯气" },
  { id: 4, type: "部门", name: "动力车间", product: "蒸汽、压缩空气" },
  { id: 5, type: "部门", name: "污水处理站", product: "—" },
  { id: 6, type: "子项目", name: "余热回收装置", product: "蒸汽" },
];

interface PersonRow {
  id: number;
  name: string;
  dept: string;
  role: string;
  isHead: boolean;
  isLeader: boolean;
  isManager: boolean;
  phone: string;
  position: string;
  title: string;
  email: string;
  experience: string;
  filingDate: string;
}
const SAMPLE_PEOPLE: PersonRow[] = [
  { id: 1, name: "顾建华", dept: "总经办", role: "企业管理员", isHead: true, isLeader: true, isManager: true, phone: "13800138001", position: "总经理", title: "高级工程师", email: "guhua@huayichem.com", experience: "28 年", filingDate: "2020-03-12" },
  { id: 2, name: "陈思敏", dept: "能源与环保管理部", role: "能源管理岗", isHead: false, isLeader: true, isManager: true, phone: "13700137002", position: "部门经理", title: "高级工程师", email: "chensm@huayichem.com", experience: "16 年", filingDate: "2020-03-12" },
  { id: 3, name: "李文斌", dept: "能源与环保管理部", role: "碳排放管理岗", isHead: false, isLeader: false, isManager: true, phone: "13600136003", position: "主管", title: "工程师", email: "liwb@huayichem.com", experience: "9 年", filingDate: "2022-07-08" },
  { id: 4, name: "周慧敏", dept: "动力车间", role: "能源管理员", isHead: false, isLeader: false, isManager: false, phone: "13500135004", position: "班组长", title: "工程师", email: "zhouhm@huayichem.com", experience: "12 年", filingDate: "2021-11-20" },
];

interface CertRow {
  id: number;
  name: string;
  type: "能源管理岗位证书" | "碳排放管理岗位证书";
  certNo: string;
  issuer: string;
  issueDate: string;
}
const SAMPLE_CERTS: CertRow[] = [
  { id: 1, name: "陈思敏", type: "能源管理岗位证书", certNo: "NYGL-2021-031245", issuer: "中国节能协会", issueDate: "2021-05-18" },
  { id: 2, name: "李文斌", type: "碳排放管理岗位证书", certNo: "TPGL-2022-008812", issuer: "中国质量认证中心", issueDate: "2022-08-22" },
  { id: 3, name: "周慧敏", type: "能源管理岗位证书", certNo: "NYGL-2022-019987", issuer: "中国节能协会", issueDate: "2022-04-09" },
];

export function EnterpriseSelfView({
  self,
  onChangePwd,
}: {
  self: EnterpriseUser;
  onChangePwd: (acc: string) => void;
}) {
  const profile = SAMPLE_PROFILE;
  const [editing, setEditing] = useState(false);

  const YesNo = ({ v }: { v: boolean }) => (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-normal",
        v
          ? "border-emerald-500/40 text-emerald-600 bg-emerald-500/5"
          : "border-muted-foreground/30 text-muted-foreground bg-muted/20",
      )}
    >
      {v ? "是" : "否"}
    </Badge>
  );

  const Section = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 text-sm font-medium">
          {icon}
          {title}
        </div>
        <div className="px-4 py-4">{children}</div>
      </CardContent>
    </Card>
  );

  const Field = ({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className={cn("text-foreground text-xs", mono && "font-mono")}>{value}</span>
    </div>
  );

  const ContactBlock = ({ title, name, phone }: { title: string; name: string; phone: string }) => (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground mb-1.5">{title}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{name}</span>
        <span className="text-xs font-mono text-muted-foreground">{phone}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 顶部：账号 + 操作 */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{profile.enterpriseName}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  账号：<span className="font-mono">{self.account}</span> · 信用代码：
                  <span className="font-mono">{profile.creditCode}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={self.status} />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => onChangePwd(self.account)}
              >
                <KeyRound className="h-3.5 w-3.5" />
                修改密码
              </Button>
              {editing ? (
                <>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditing(false)}>
                    <X className="h-3.5 w-3.5" />
                    取消
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setEditing(false);
                      toast({ title: "已保存", description: "本企业信息已更新" });
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                    保存
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  编辑信息
                </Button>
              )}
            </div>
          </div>
          {/* 标签条 */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
            <Tag className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            <span className="text-[11px] text-muted-foreground mr-1">企业标签</span>
            {profile.tags.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="text-[11px] font-normal border-primary/30 text-primary bg-primary/5"
              >
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="h-9">
          <TabsTrigger value="basic" className="text-xs">基础信息</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs">联系与对口人</TabsTrigger>
          <TabsTrigger value="energy" className="text-xs">能源管理</TabsTrigger>
          <TabsTrigger value="dept" className="text-xs">部门</TabsTrigger>
          <TabsTrigger value="people" className="text-xs">人员与岗位</TabsTrigger>
        </TabsList>

        {/* 基础信息 */}
        <TabsContent value="basic" className="space-y-4 mt-3">
          <Section icon={<Building2 className="h-4 w-4 text-primary" />} title="企业基础信息">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              <Field label="统一社会信用代码" value={profile.creditCode} mono />
              <Field label="企业名称" value={profile.enterpriseName} />
              <Field label="所属行业" value={profile.industry} />
              <Field label="所属领域" value={profile.domain} />
              <Field label="所属区" value={self.district} />
              <Field label="工业园区" value={profile.park} />
              <Field label="所属集团" value={profile.group} />
              <Field
                label="是否央企"
                value={<YesNo v={profile.isCentralEnterprise} />}
              />
              
              <Field label="法人代表" value={profile.legalRep} />
              <Field label="注册日期" value={profile.registerDate} />
              <Field label="注册资本（万元）" value={profile.registerCapital} mono />
            </div>
          </Section>

          <Section icon={<Zap className="h-4 w-4 text-primary" />} title="能源品种与产品">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
              <Field label="企业类型" value={profile.enterpriseType} />
              <Field label="温报行业类型" value={profile.monthlyReportIndustry} />
              <div className="md:col-span-1">
                <span className="text-muted-foreground text-[11px]">能源品种</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {profile.energyTypes.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="text-[11px] font-normal border-amber-500/40 text-amber-600 bg-amber-500/5"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <Field label="产品名称" value={profile.productName} />
              <Field label="单位产品能耗" value={profile.unitProductEnergy} mono />
            </div>
          </Section>
        </TabsContent>

        {/* 联系与对口人 */}
        <TabsContent value="contact" className="space-y-4 mt-3">
          <Section icon={<UsersIcon className="h-4 w-4 text-primary" />} title="对口人信息">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ContactBlock title="中心对口人" name={profile.cityContact.name} phone={profile.cityContact.phone} />
              <ContactBlock title="区对口人" name={profile.districtContact.name} phone={profile.districtContact.phone} />
              <ContactBlock title="园区对口人" name={profile.parkContact.name} phone={profile.parkContact.phone} />
              <ContactBlock title="集团对口人" name={profile.groupContact.name} phone={profile.groupContact.phone} />
            </div>
          </Section>

          <Section icon={<Briefcase className="h-4 w-4 text-primary" />} title="企业联系方式">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
              <div className="md:col-span-3">
                <Field label="地址" value={profile.address} />
              </div>
              <Field label="邮编" value={profile.zipCode} mono />
              <Field label="联系电话（区号）" value={profile.officePhone} mono />
              <Field label="传真" value={profile.fax} mono />
              <Field label="电子邮箱" value={profile.email} />
              <Field label="联系人" value={profile.contactPerson} />
              <Field label="联系人电话" value={profile.contactPhone} mono />
            </div>
          </Section>
        </TabsContent>

        {/* 能源管理 */}
        <TabsContent value="energy" className="space-y-4 mt-3">
          <Section icon={<Zap className="h-4 w-4 text-primary" />} title="能源管理基本属性">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              <Field
                label="能耗级别"
                value={
                  <Badge
                    variant="outline"
                    className="text-[11px] font-normal border-amber-500/50 text-amber-600 bg-amber-500/5"
                  >
                    {profile.energyLevel}
                  </Badge>
                }
              />
              <Field label="是否万家" value={<YesNo v={profile.isWanjia} />} />
              <Field label="是否为重点用能单位" value={<YesNo v={profile.isKeyEnergyUser} />} />
              <Field
                label="是否启用淘汰设备工艺管理"
                value={<YesNo v={profile.enableObsoleteMgmt} />}
              />
              <Field label="能源管理机构名称" value={profile.energyMgmtOrg} />
              <Field
                label="是否建设能源管控中心"
                value={<YesNo v={profile.hasEnergyControlCenter} />}
              />
              <Field label="节能管理编码" value={profile.energyMgmtCode} mono />
            </div>
          </Section>

          <Section icon={<Award className="h-4 w-4 text-primary" />} title="能源管理体系认证">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
              <Field
                label="是否通过能源管理体系认证"
                value={<YesNo v={profile.hasEnergyMgmtCert} />}
              />
              <Field label="认证时间" value={profile.energyMgmtCertDate} />
              <Field label="认证机构" value={profile.energyMgmtCertOrg} />
            </div>
          </Section>
        </TabsContent>

        {/* 部门 */}
        <TabsContent value="dept" className="mt-3">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="text-sm font-medium">
                  部门列表
                  <span className="ml-2 text-xs text-muted-foreground">共 {SAMPLE_DEPTS.length} 项</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    新建子项目
                  </Button>
                  <Button size="sm" className="h-7 text-xs gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    新建部门
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-xs w-[60px]">序号</TableHead>
                    <TableHead className="h-9 text-xs">部门类型</TableHead>
                    <TableHead className="h-9 text-xs">部门名称</TableHead>
                    <TableHead className="h-9 text-xs">产品</TableHead>
                    <TableHead className="h-9 text-xs text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_DEPTS.map((d, i) => (
                    <TableRow key={d.id} className="text-xs">
                      <TableCell className="py-2 text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-normal",
                            d.type === "部门"
                              ? "border-blue-500/40 text-blue-600 bg-blue-500/5"
                              : "border-purple-500/40 text-purple-600 bg-purple-500/5",
                          )}
                        >
                          {d.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 font-medium">{d.name}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{d.product}</TableCell>
                      <TableCell className="py-2 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <Pencil className="h-3.5 w-3.5" />
                          编辑
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                          删除
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 人员与岗位 */}
        <TabsContent value="people" className="space-y-4 mt-3">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="text-sm font-medium">
                  人员列表
                  <span className="ml-2 text-xs text-muted-foreground">共 {SAMPLE_PEOPLE.length} 人</span>
                </div>
                <Button size="sm" className="h-7 text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  新增人员
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="h-9 text-xs w-[56px]">序号</TableHead>
                      <TableHead className="h-9 text-xs">姓名</TableHead>
                      <TableHead className="h-9 text-xs">部门</TableHead>
                      <TableHead className="h-9 text-xs">角色</TableHead>
                      <TableHead className="h-9 text-xs">岗位标识</TableHead>
                      <TableHead className="h-9 text-xs">电话</TableHead>
                      <TableHead className="h-9 text-xs">职务 / 职称</TableHead>
                      <TableHead className="h-9 text-xs">邮箱</TableHead>
                      <TableHead className="h-9 text-xs whitespace-nowrap">工作经验</TableHead>
                      <TableHead className="h-9 text-xs whitespace-nowrap">备案日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_PEOPLE.map((p, i) => (
                      <TableRow key={p.id} className="text-xs">
                        <TableCell className="py-2 text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="py-2 font-medium">{p.name}</TableCell>
                        <TableCell className="py-2">{p.dept}</TableCell>
                        <TableCell className="py-2">{p.role}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {p.isHead && (
                              <Badge variant="outline" className="text-[10px] font-normal border-primary/40 text-primary bg-primary/5">
                                主管
                              </Badge>
                            )}
                            {p.isLeader && (
                              <Badge variant="outline" className="text-[10px] font-normal border-emerald-500/40 text-emerald-600 bg-emerald-500/5">
                                负责人
                              </Badge>
                            )}
                            {p.isManager && (
                              <Badge variant="outline" className="text-[10px] font-normal border-blue-500/40 text-blue-600 bg-blue-500/5">
                                管理人员
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 font-mono">{p.phone}</TableCell>
                        <TableCell className="py-2 whitespace-nowrap">
                          {p.position}
                          <span className="text-muted-foreground"> / {p.title}</span>
                        </TableCell>
                        <TableCell className="py-2 text-muted-foreground">{p.email}</TableCell>
                        <TableCell className="py-2 whitespace-nowrap">{p.experience}</TableCell>
                        <TableCell className="py-2 whitespace-nowrap text-muted-foreground">{p.filingDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Award className="h-4 w-4 text-primary" />
                  岗位备案 · 证书登记
                  <span className="ml-1 text-xs text-muted-foreground">共 {SAMPLE_CERTS.length} 项</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  登记证书
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-9 text-xs w-[56px]">序号</TableHead>
                    <TableHead className="h-9 text-xs">姓名</TableHead>
                    <TableHead className="h-9 text-xs">证书类型</TableHead>
                    <TableHead className="h-9 text-xs">证书编号</TableHead>
                    <TableHead className="h-9 text-xs">发证机构</TableHead>
                    <TableHead className="h-9 text-xs whitespace-nowrap">发证日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_CERTS.map((c, i) => (
                    <TableRow key={c.id} className="text-xs">
                      <TableCell className="py-2 text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="py-2 font-medium">{c.name}</TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-normal",
                            c.type === "能源管理岗位证书"
                              ? "border-amber-500/40 text-amber-600 bg-amber-500/5"
                              : "border-emerald-500/40 text-emerald-600 bg-emerald-500/5",
                          )}
                        >
                          {c.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 font-mono text-muted-foreground">{c.certNo}</TableCell>
                      <TableCell className="py-2">{c.issuer}</TableCell>
                      <TableCell className="py-2 whitespace-nowrap text-muted-foreground">{c.issueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
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

// ===== 新建账号弹窗 =====

type AccountType = "city" | "district" | "park" | "group" | "enterprise";

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "city", label: "市" },
  { value: "district", label: "区" },
  { value: "park", label: "园区" },
  { value: "group", label: "集团" },
  { value: "enterprise", label: "企业" },
];

// 各账号类型对应的"组织"候选（来源：现有系统数据）
const ORG_OPTIONS_BY_TYPE: Record<AccountType, string[]> = {
  city: CITY_DEPARTMENTS,
  district: INITIAL_DISTRICT_USERS.filter((d) => d.level === "区").map((d) => d.areaName),
  park: INITIAL_DISTRICT_USERS.filter((d) => d.level === "园区").map((d) => d.areaName),
  group: INITIAL_GROUP_USERS.map((g) => g.groupName),
  enterprise: enterpriseUsers.map((e) => e.enterpriseName),
};

const INDUSTRY_OPTIONS = [
  "化学原料和化学制品制造业",
  "黑色金属冶炼和压延加工业",
  "计算机、通信和其他电子设备制造业",
  "造纸和纸制品业",
  "纺织业",
  "食品制造业",
  "电力、热力生产和供应业",
  "通用设备制造业",
  "汽车制造业",
  "医药制造业",
];

const ENERGY_LEVEL_OPTIONS = [
  "2000吨标煤及以上",
  "1000-2000吨标煤",
  "1000吨标煤以下",
];

const ENTERPRISE_TAG_OPTIONS = ["区下属", "「百千家」、通信业"];

const CITY_CONTACT_OPTIONS = Array.from(
  new Set(cityUsers.filter((u) => u.role === "对口人").map((u) => u.name)),
).slice(0, 30);

function CreateEnterpriseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [organization, setOrganization] = useState("");
  const [roleType, setRoleType] = useState<"管理员" | "对口人">("管理员");
  const [creditCode, setCreditCode] = useState("");
  const [enterpriseName, setEnterpriseName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState(genRandomPassword());

  // 各列表特有字段
  const [personName, setPersonName] = useState(""); // 用户账号-姓名
  const [phone, setPhone] = useState(""); // 通用-手机号
  const [unitFullName, setUnitFullName] = useState(""); // 区/园区-单位全称
  const [address, setAddress] = useState(""); // 区/园区/集团-地址
  const [owner, setOwner] = useState(""); // 区/园区/集团/企业-负责人
  const [cityContact, setCityContact] = useState(""); // 区/园区/集团-中心对口人
  const [subsidiaries, setSubsidiaries] = useState(""); // 集团-下属企业（逗号分隔）
  const [industry, setIndustry] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");
  const [entDistrict, setEntDistrict] = useState("");
  const [entPark, setEntPark] = useState("");
  const [entGroup, setEntGroup] = useState("");
  const [entTag, setEntTag] = useState<string>("");

  const isEnterprise = accountType === "enterprise";
  const isCity = accountType === "city";
  const isDistrict = accountType === "district";
  const isPark = accountType === "park";
  const isGroup = accountType === "group";

  const phoneValid = phone.length === 0 || /^1[3-9]\d{9}$/.test(phone);
  const enterpriseCityContact =
    entTag === "区下属" ? "—" : entTag ? cityContact || "（请选择中心对口人）" : "";

  const codeValid = CREDIT_CODE_RE.test(creditCode);
  const accountFormatValid = /^(?=.*[A-Za-z])[A-Za-z0-9]{6,20}$/.test(account);
  const takenAccounts = useMemo(
    () =>
      new Set<string>([
        ...cityUsers.map((u) => u.account.toLowerCase()),
        ...INITIAL_DISTRICT_USERS.map((u) => u.account.toLowerCase()),
        ...INITIAL_GROUP_USERS.map((u) => u.account.toLowerCase()),
        ...enterpriseUsers.map((u) => u.account.toLowerCase()),
      ]),
    [],
  );
  const accountUnique = account.length === 0 || !takenAccounts.has(account.toLowerCase());
  const accountValid = accountFormatValid && accountUnique;

  const reset = () => {
    setAccountType("");
    setOrganization("");
    setRoleType("管理员");
    setCreditCode("");
    setEnterpriseName("");
    setAccount("");
    setPassword(genRandomPassword());
    setPersonName("");
    setPhone("");
    setUnitFullName("");
    setAddress("");
    setOwner("");
    setCityContact("");
    setSubsidiaries("");
    setIndustry("");
    setEnergyLevel("");
    setEntDistrict("");
    setEntPark("");
    setEntGroup("");
    setEntTag("");
  };

  const orgOptions = accountType ? ORG_OPTIONS_BY_TYPE[accountType] : [];

  const ORG_LABEL_BY_TYPE: Record<AccountType, string> = {
    city: "组织",
    district: "行政区划",
    park: "园区",
    group: "集团",
    enterprise: "",
  };
  const orgLabel = accountType ? ORG_LABEL_BY_TYPE[accountType] : "组织";

  const districtOptions = INITIAL_DISTRICT_USERS.filter((d) => d.level === "区").map((d) => d.areaName);
  const parkOptions = INITIAL_DISTRICT_USERS.filter((d) => d.level === "园区").map((d) => d.areaName);
  const groupOptions = INITIAL_GROUP_USERS.map((g) => g.groupName);

  const canSubmit =
    !!accountType &&
    (isEnterprise || !!organization) &&
    accountValid &&
    phoneValid &&
    (isCity ? personName.trim().length > 0 : true) &&
    (isDistrict || isPark
      ? unitFullName.trim().length > 0 && owner.trim().length > 0
      : true) &&
    (isGroup ? owner.trim().length > 0 : true) &&
    (!isEnterprise ||
      (codeValid &&
        enterpriseName.trim().length > 0 &&
        !!industry &&
        !!energyLevel &&
        !!entDistrict &&
        !!entTag &&
        (entTag === "区下属" || !!cityContact)));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4 text-primary" />
            新建账号
          </DialogTitle>
          <DialogDescription className="text-xs">
            创建后系统自动下发初始密码，账号管理员首次登录需修改
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* 账号类型 */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              账号 <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {ACCOUNT_TYPE_OPTIONS.map((opt) => {
                const active = accountType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setAccountType(opt.value);
                      setOrganization("");
                      setRoleType(opt.value === "city" ? "管理员" : "管理员");
                    }}
                    className={cn(
                      "h-8 px-3 rounded-md border text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 组织 / 行政区划 / 园区 / 集团（企业类型不展示） */}
          {accountType && !isEnterprise && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                {orgLabel} <span className="text-destructive">*</span>
              </Label>
              <Select value={organization} onValueChange={setOrganization}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={`请选择${orgLabel}`} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {orgOptions.map((o) => (
                    <SelectItem key={o} value={o} className="text-sm">
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 角色：仅市级时可选；其他默认为管理员 */}
          {accountType && (
            <div className="space-y-1.5">
              <Label className="text-xs">
                角色 <span className="text-destructive">*</span>
              </Label>
              {isCity ? (
                <Select
                  value={roleType}
                  onValueChange={(v) => setRoleType(v as "管理员" | "对口人")}
                  disabled={!organization}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={organization ? "请选择角色" : "请先选择组织"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="管理员" className="text-sm">管理员</SelectItem>
                    <SelectItem value="对口人" className="text-sm">对口人</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value="管理员"
                  readOnly
                  className="h-9 text-sm bg-muted/40"
                />
              )}
            </div>
          )}

          {/* 用户账号(市)：姓名 + 手机号 */}
          {isCity && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  姓名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="请输入真实姓名"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">手机号</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="11 位手机号，用于接收通知"
                  maxLength={11}
                  className="h-9 font-mono text-sm"
                />
                {!phoneValid && (
                  <p className="text-[11px] text-destructive">✗ 手机号格式不正确</p>
                )}
              </div>
            </>
          )}

          {/* 区 / 园区：单位全称 + 地址 + 负责人 + 手机号 + 中心对口人 */}
          {(isDistrict || isPark) && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  单位全称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={unitFullName}
                  onChange={(e) => setUnitFullName(e.target.value)}
                  placeholder={isPark ? "如：上海张江高科技园区管理委员会" : "如：浦东新区经济和信息化委员会"}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    负责人 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="请输入"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">手机号</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11 位手机号"
                    maxLength={11}
                    className="h-9 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">地址</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="详细办公地址"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">中心对口人</Label>
                <Select value={cityContact} onValueChange={setCityContact}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="请选择市级中心对口人" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CITY_CONTACT_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 集团：负责人 + 手机号 + 地址 + 中心对口人 + 下属企业 */}
          {isGroup && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    负责人 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="请输入"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">手机号</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11 位手机号"
                    maxLength={11}
                    className="h-9 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">地址</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="集团总部地址"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">中心对口人</Label>
                <Select value={cityContact} onValueChange={setCityContact}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="请选择市级中心对口人" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CITY_CONTACT_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">下属企业</Label>
                <Input
                  value={subsidiaries}
                  onChange={(e) => setSubsidiaries(e.target.value)}
                  placeholder="多个企业以逗号分隔，可稍后维护"
                  className="h-9 text-sm"
                />
              </div>
            </>
          )}

          {/* 企业专属字段 */}
          {isEnterprise && (
            <>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    行业分类 <span className="text-destructive">*</span>
                  </Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {INDUSTRY_OPTIONS.map((i) => (
                        <SelectItem key={i} value={i} className="text-sm">{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    能耗等级 <span className="text-destructive">*</span>
                  </Label>
                  <Select value={energyLevel} onValueChange={setEnergyLevel}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENERGY_LEVEL_OPTIONS.map((e) => (
                        <SelectItem key={e} value={e} className="text-sm">{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    所属区 <span className="text-destructive">*</span>
                  </Label>
                  <Select value={entDistrict} onValueChange={setEntDistrict}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d} className="text-sm">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">所属园区</Label>
                  <Select value={entPark} onValueChange={(v) => setEntPark(v === "__clear__" ? "" : v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="可选" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="__clear__" className="text-sm text-muted-foreground">— 清空 —</SelectItem>
                      {parkOptions.map((p) => (
                        <SelectItem key={p} value={p} className="text-sm">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">所属集团</Label>
                  <Select value={entGroup} onValueChange={(v) => setEntGroup(v === "__clear__" ? "" : v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="可选" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="__clear__" className="text-sm text-muted-foreground">— 清空 —</SelectItem>
                      {groupOptions.map((g) => (
                        <SelectItem key={g} value={g} className="text-sm">{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">企业负责人</Label>
                  <Input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="如：顾建华"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">联系电话</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="11 位手机号"
                    maxLength={11}
                    className="h-9 font-mono text-sm"
                  />
                </div>
              </div>

              {/* 标签 + 对口人（联动） */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  标签 <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {ENTERPRISE_TAG_OPTIONS.map((t) => {
                    const active = entTag === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setEntTag(t);
                          if (t === "区下属") setCityContact("");
                        }}
                        className={cn(
                          "h-8 px-3 rounded-md border text-xs transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">
                  对口人{entTag !== "区下属" && entTag && <span className="text-destructive"> *</span>}
                </Label>
                {entTag === "区下属" ? (
                  <Input value="—" readOnly className="h-9 text-sm bg-muted/40" />
                ) : (
                  <Select value={cityContact} onValueChange={setCityContact} disabled={!entTag}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={entTag ? "请选择中心对口人" : "请先选择标签"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {CITY_CONTACT_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c} className="text-sm">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-[11px] text-muted-foreground">
                  「区下属」企业无对口人；「百千家」、通信业企业由所选中心对口人对接
                </p>
              </div>
            </>
          )}

          {/* 账户名 */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              账户名 <span className="text-destructive">*</span>
            </Label>
            <Input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="6-20 位，字母或字母数字组合，不分大小写"
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
              {account.length === 0
                ? "规则：长度 6-20 位，字母或字母数字组合，不分大小写，且系统唯一"
                : !accountFormatValid
                  ? "✗ 格式不符合：长度 6-20 位，仅允许字母或字母+数字组合，且至少含一个字母"
                  : !accountUnique
                    ? "✗ 该账号已被占用，请更换"
                    : "✓ 账号格式正确，系统唯一"}
            </p>
          </div>

          {/* 默认密码 */}
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
            disabled={!canSubmit}
            onClick={() => {
              const typeLabel = ACCOUNT_TYPE_OPTIONS.find((o) => o.value === accountType)?.label;
              const subject = isEnterprise
                ? enterpriseName
                : isCity
                  ? personName
                  : isGroup
                    ? owner
                    : owner || unitFullName;
              toast({
                title: "账号创建成功",
                description: `${typeLabel}${organization ? ` · ${organization}` : ""}${subject ? ` · ${subject}` : ""} · ${account}`,
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

function EnterpriseListDialog({
  user,
  onOpenChange,
  editable = false,
}: {
  user: CityUser | null;
  onOpenChange: (open: boolean) => void;
  editable?: boolean;
}) {
  const open = !!user;
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const [list, setList] = useState<EnterpriseLite[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", creditCode: "", owner: "", phone: "" });
  const [confirmDel, setConfirmDel] = useState<EnterpriseLite | null>(null);

  const userId = user?.id ?? "";
  useMemo(() => {
    setKw("");
    setPage(1);
    setList(user?.enterpriseList ?? []);
  }, [userId]);

  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return list;
    return list.filter((e) => e.name.toLowerCase().includes(k));
  }, [list, kw]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const toggleDisable = (e: EnterpriseLite) => {
    setList((arr) =>
      arr.map((x) =>
        x.creditCode === e.creditCode ? { ...x, disabled: !x.disabled } : x,
      ),
    );
    toast({
      title: e.disabled ? "已启用对口企业" : "已禁用对口企业",
      description: e.name,
    });
  };

  const removeEnterprise = (e: EnterpriseLite) => {
    setList((arr) => arr.filter((x) => x.creditCode !== e.creditCode));
    toast({ title: "已删除对口企业", description: e.name });
    setConfirmDel(null);
  };

  const submitAdd = () => {
    if (!addForm.name.trim() || !addForm.creditCode.trim()) {
      toast({ title: "请填写企业名称与统一社会信用代码", variant: "destructive" });
      return;
    }
    if (list.some((x) => x.creditCode === addForm.creditCode)) {
      toast({ title: "该企业已在对口列表中", variant: "destructive" });
      return;
    }
    setList((arr) => [
      { ...addForm, disabled: false },
      ...arr,
    ]);
    toast({ title: "已新增对口企业", description: addForm.name });
    setAddOpen(false);
    setAddForm({ name: "", creditCode: "", owner: "", phone: "" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <SheetTitle className="text-base">对口企业管理</SheetTitle>
          <SheetDescription className="text-xs">
            {user ? (
              <>
                <span className="text-foreground font-medium">{user.name}</span>
                <span className="mx-1 text-muted-foreground">·</span>
                <span className="text-muted-foreground">{user.department}</span>
                <span className="mx-1 text-muted-foreground">·</span>
                <span className="text-muted-foreground">{user.role}</span>
              </>
            ) : null}
          </SheetDescription>
          <div className="flex items-center gap-1.5 pt-1">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">对接范围</span>
            <EnterpriseTagBadge tag={"\"百千家\"、通信业"} />
            <span className="text-[11px] text-muted-foreground">
              · 区下属企业不在中心对口人对接范围
            </span>
          </div>
        </SheetHeader>

        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={kw}
              onChange={(e) => {
                setKw(e.target.value);
                setPage(1);
              }}
              placeholder="按企业名称模糊检索"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            共 <span className="font-mono text-foreground">{filtered.length.toLocaleString()}</span> 家
            {kw && (
              <>
                <span className="mx-1">/</span>
                总 <span className="font-mono text-foreground">{list.length.toLocaleString()}</span>
              </>
            )}
          </span>
          {editable && (
            <Button size="sm" className="h-8 text-xs gap-1" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              新增对口企业
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="h-9 text-xs w-12">#</TableHead>
                <TableHead className="h-9 text-xs">企业名称</TableHead>
                <TableHead className="h-9 text-xs">统一社会信用代码</TableHead>
                <TableHead className="h-9 text-xs">企业负责人</TableHead>
                <TableHead className="h-9 text-xs">联系电话</TableHead>
                {editable && <TableHead className="h-9 text-xs text-right">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={editable ? 6 : 5} className="text-center text-xs text-muted-foreground py-8">
                    暂无匹配的企业
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((e, i) => (
                  <TableRow key={e.creditCode + i} className="text-xs">
                    <TableCell className="py-2 font-mono text-muted-foreground tabular-nums">
                      {(curPage - 1) * PAGE_SIZE + i + 1}
                    </TableCell>
                    <TableCell className="py-2 text-foreground">
                      <Link
                        to={`/enterprise-detail/${encodeURIComponent(e.name)}`}
                        className="text-primary hover:underline"
                      >
                        {e.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2 font-mono text-muted-foreground">
                      {e.creditCode}
                    </TableCell>
                    <TableCell className="py-2">{e.owner}</TableCell>
                    <TableCell className="py-2 font-mono text-muted-foreground">
                      {e.phone}
                    </TableCell>
                    {editable && (
                      <TableCell className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                          onClick={() => setConfirmDel(e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          删除
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="px-5 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            第 <span className="font-mono text-foreground">{curPage}</span> / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={curPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={curPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              下一页
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-2">
              <Download className="h-3.5 w-3.5" />
              导出
            </Button>
          </div>
        </div>

        {/* 新增对口企业 */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">新增对口企业</DialogTitle>
              <DialogDescription className="text-xs">
                为 <span className="text-foreground font-medium">{user?.name}</span> 关联一家对口企业
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-1">
              <div className="space-y-1.5">
                <Label className="text-xs">企业名称<span className="text-destructive ml-0.5">*</span></Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="请输入企业全称"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">统一社会信用代码<span className="text-destructive ml-0.5">*</span></Label>
                <Input
                  value={addForm.creditCode}
                  onChange={(e) => setAddForm((f) => ({ ...f, creditCode: e.target.value.toUpperCase() }))}
                  placeholder="18 位统一社会信用代码"
                  maxLength={18}
                  className="h-9 text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">企业负责人</Label>
                  <Input
                    value={addForm.owner}
                    onChange={(e) => setAddForm((f) => ({ ...f, owner: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">联系电话</Label>
                  <Input
                    value={addForm.phone}
                    onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setAddOpen(false)}>
                取消
              </Button>
              <Button size="sm" onClick={submitAdd}>
                确认新增
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认 */}
        <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">删除对口企业</DialogTitle>
              <DialogDescription className="text-xs">
                确认从 <span className="text-foreground font-medium">{user?.name}</span> 的对口列表中移除
                <span className="text-foreground font-medium"> {confirmDel?.name}</span>？此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setConfirmDel(null)}>
                取消
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => confirmDel && removeEnterprise(confirmDel)}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}


// ===== 组织维护弹窗（市管账号专用） =====
function OrganizationManageDialog({
  open,
  onOpenChange,
  departments,
  userCountByDept,
  onAdd,
  onRename,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  departments: string[];
  userCountByDept: Record<string, number>;
  onAdd: (name: string) => boolean;
  onRename: (oldName: string, newName: string) => boolean;
  onDelete: (name: string) => boolean;
}) {
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  // 关闭时重置
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setNewName("");
      setEditingName(null);
      setDraftName("");
      setConfirmDel(null);
    }
    onOpenChange(o);
  };

  const startEdit = (name: string) => {
    setEditingName(name);
    setDraftName(name);
  };
  const submitEdit = (oldName: string) => {
    if (onRename(oldName, draftName)) {
      setEditingName(null);
      setDraftName("");
    }
  };

  const submitAdd = () => {
    if (onAdd(newName)) {
      setNewName("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">管理组织</DialogTitle>
            <DialogDescription className="text-xs">
              市管账号下「用户账号-组织」的新增、重命名、删除。删除前需确保该组织下无账号。
            </DialogDescription>
          </DialogHeader>

          {/* 新增 */}
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="新增组织名称（如：节能处-政策法规科）"
              maxLength={30}
              className="h-8 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitAdd();
                }
              }}
            />
            <Button size="sm" className="h-8 text-xs gap-1" onClick={submitAdd}>
              <Plus className="h-3.5 w-3.5" />
              新增
            </Button>
          </div>

          {/* 列表 */}
          <ScrollArea className="max-h-[420px] -mx-1 px-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 text-xs w-12">#</TableHead>
                  <TableHead className="h-9 text-xs">组织名称</TableHead>
                  <TableHead className="h-9 text-xs w-24">账号数</TableHead>
                  <TableHead className="h-9 text-xs text-right w-44">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                      暂无组织
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((d, i) => {
                    const count = userCountByDept[d] ?? 0;
                    const isEditing = editingName === d;
                    return (
                      <TableRow key={d} className="text-xs">
                        <TableCell className="py-2 font-mono text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="py-2">
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={draftName}
                              onChange={(e) => setDraftName(e.target.value)}
                              maxLength={30}
                              className="h-7 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  submitEdit(d);
                                } else if (e.key === "Escape") {
                                  setEditingName(null);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-foreground">{d}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 font-mono text-muted-foreground tabular-nums">
                          {count}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => setEditingName(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                                取消
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => submitEdit(d)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                保存
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => startEdit(d)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                重命名
                              </Button>
                              <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={count > 0}
                                        className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                                        onClick={() => setConfirmDel(d)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        删除
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {count > 0 && (
                                    <TooltipContent side="left" className="text-xs max-w-xs">
                                      该组织下仍有 {count} 个账号，请先迁移或删除
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">删除组织</DialogTitle>
            <DialogDescription className="text-xs">
              确认删除组织「<span className="text-foreground font-medium">{confirmDel}</span>」？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setConfirmDel(null)}>
              取消
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              onClick={() => {
                if (confirmDel && onDelete(confirmDel)) {
                  setConfirmDel(null);
                }
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EntityManageDialog({
  kind,
  items,
  usageCount,
  usageNoun,
  onOpenChange,
  onAdd,
  onRename,
  onDelete,
}: {
  kind: null | "区" | "园区" | "集团";
  items: string[];
  usageCount: Record<string, number>;
  usageNoun: string;
  onOpenChange: (o: boolean) => void;
  onAdd: (name: string) => boolean;
  onRename: (oldName: string, newName: string) => boolean;
  onDelete: (name: string) => boolean;
}) {
  const open = !!kind;
  const [newName, setNewName] = useState("");
  const [editingName, setEditingName] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setNewName("");
      setEditingName(null);
      setDraftName("");
      setConfirmDel(null);
    }
    onOpenChange(o);
  };

  const submitAdd = () => {
    if (onAdd(newName)) setNewName("");
  };
  const submitEdit = (oldName: string) => {
    if (onRename(oldName, draftName)) {
      setEditingName(null);
      setDraftName("");
    }
  };

  const placeholder =
    kind === "区"
      ? "新增区名称（如：徐汇区）"
      : kind === "园区"
      ? "新增园区名称（如：金桥经开区）"
      : "新增集团名称（如：光明集团）";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">管理{kind}</DialogTitle>
            <DialogDescription className="text-xs">
              市管账号下「{kind}」的新增、重命名、删除。删除前需确保该{kind}下无关联企业。
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={placeholder}
              maxLength={30}
              className="h-8 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitAdd();
                }
              }}
            />
            <Button size="sm" className="h-8 text-xs gap-1" onClick={submitAdd}>
              <Plus className="h-3.5 w-3.5" />
              新增
            </Button>
          </div>

          <ScrollArea className="max-h-[420px] -mx-1 px-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="h-9 text-xs w-12">#</TableHead>
                  <TableHead className="h-9 text-xs">名称</TableHead>
                  <TableHead className="h-9 text-xs w-28">关联{usageNoun}</TableHead>
                  <TableHead className="h-9 text-xs text-right w-44">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                      暂无{kind}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((name, i) => {
                    const count = usageCount[name] ?? 0;
                    const isEditing = editingName === name;
                    return (
                      <TableRow key={name} className="text-xs">
                        <TableCell className="py-2 font-mono text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="py-2">
                          {isEditing ? (
                            <Input
                              autoFocus
                              value={draftName}
                              onChange={(e) => setDraftName(e.target.value)}
                              maxLength={30}
                              className="h-7 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  submitEdit(name);
                                } else if (e.key === "Escape") {
                                  setEditingName(null);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-foreground">{name}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 font-mono text-muted-foreground tabular-nums">{count}</TableCell>
                        <TableCell className="py-2 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => setEditingName(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                                取消
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => submitEdit(name)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                保存
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => {
                                  setEditingName(name);
                                  setDraftName(name);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                重命名
                              </Button>
                              <TooltipProvider delayDuration={150}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={count > 0}
                                        className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                                        onClick={() => setConfirmDel(name)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        删除
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  {count > 0 && (
                                    <TooltipContent side="left" className="text-xs max-w-xs">
                                      该{kind}下仍有 {count} {usageNoun}，请先迁移
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleOpenChange(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">删除{kind}</DialogTitle>
            <DialogDescription className="text-xs">
              确认删除{kind}「<span className="text-foreground font-medium">{confirmDel}</span>」？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setConfirmDel(null)}>
              取消
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              onClick={() => {
                if (confirmDel && onDelete(confirmDel)) setConfirmDel(null);
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
