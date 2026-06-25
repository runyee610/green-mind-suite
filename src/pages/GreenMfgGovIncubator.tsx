import { useMemo, useState } from "react";
import {
  Search,
  Sprout,
  Filter,
  Flame,
  TrendingUp,
  Trash2,
  ArrowUpCircle,
  Plus,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ALL_INDUSTRIES } from "@/components/green-mfg/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ========== 培育库 Mock 数据 ==========
type IncubateLevel = "市级" | "区级";
type IncubateStage = "入库登记" | "诊断评估" | "整改提升" | "复评预审" | "晋级出库" | "退库";
type EnergyTag = "重点用能单位" | "10亿+非重点规上";
type Ownership = "国有" | "民营" | "外资" | "中外合资";
type GreenType = "绿色工厂" | "绿色供应链" | "绿色工厂、绿色供应链";

const DISTRICTS = ["浦东新区", "闵行区", "嘉定区", "金山区", "宝山区", "青浦区", "奉贤区", "松江区", "徐汇区", "杨浦区"];
const OWNERSHIPS: Ownership[] = ["国有", "民营", "外资", "中外合资"];
const GREEN_TYPES: GreenType[] = ["绿色工厂", "绿色供应链", "绿色工厂、绿色供应链"];
const ENERGY_TAGS: EnergyTag[] = ["重点用能单位", "10亿+非重点规上"];

interface IncubateRecord {
  id: string;
  name: string;
  creditCode: string;
  district: string;
  industry: string;
  subIndustry?: string;
  level: IncubateLevel;
  energyTag: EnergyTag;
  outputValue: number | null;
  energyConsumption: number;
  carbonIntensity: number;
  score: number;
  prevScore: number;
  stage: IncubateStage;
  enterDate: string;
  reviewer: string;
  nextAction: string;
  improvement: number;
  ownership: Ownership;
  greenType: GreenType;
  contactName: string;
  contactPhone: string;
}

export const INITIAL_INCUBATE_DATA: IncubateRecord[] = [
  { id: "INC-2025-001", name: "上海石化化工新材料分公司", creditCode: "91310116MA1H23ABC4", district: "金山区", industry: "石化化工行业", subIndustry: "煤制烯烃", level: "市级", energyTag: "重点用能单位", outputValue: 89500, energyConsumption: 36800, carbonIntensity: 1.42, score: 64, prevScore: 58, stage: "整改提升", enterDate: "2025-08-15", reviewer: "金山区生态局", nextAction: "11 月底前完成余热回收改造", improvement: 6, ownership: "国有", greenType: "绿色工厂", contactName: "王欣玮", contactPhone: "13822221712" },
  { id: "INC-2025-002", name: "宝钢轧辊（上海）有限公司", creditCode: "91310113MA1H23BC02", district: "宝山区", industry: "钢铁行业", subIndustry: "短流程钢铁企业", level: "市级", energyTag: "重点用能单位", outputValue: 156200, energyConsumption: 52400, carbonIntensity: 1.18, score: 71, prevScore: 62, stage: "复评预审", enterDate: "2025-06-20", reviewer: "市经信委", nextAction: "等待 12 月专家组复评打分", improvement: 9, ownership: "国有", greenType: "绿色工厂", contactName: "韩淑哲", contactPhone: "13822221712" },
  { id: "INC-2025-003", name: "中微半导体设备(上海)股份有限公司", creditCode: "91310115MA1K0DEF56", district: "浦东新区", industry: "电子行业", subIndustry: "集成电路", level: "市级", energyTag: "10亿+非重点规上", outputValue: 134000, energyConsumption: 8900, carbonIntensity: 0.32, score: 76, prevScore: 68, stage: "复评预审", enterDate: "2025-05-10", reviewer: "浦东经委", nextAction: "AI 预审已通过，进入晋级公示", improvement: 8, ownership: "民营", greenType: "绿色工厂、绿色供应链", contactName: "刘海洋", contactPhone: "13822221712" },
  { id: "INC-2025-004", name: "上海延锋汽车饰件系统有限公司", creditCode: "91310115MA1K38AUTO2", district: "嘉定区", industry: "机械行业", subIndustry: "汽车整车", level: "区级", energyTag: "10亿+非重点规上", outputValue: 218000, energyConsumption: 6200, carbonIntensity: 0.18, score: 68, prevScore: 60, stage: "诊断评估", enterDate: "2025-09-02", reviewer: "嘉定区经委", nextAction: "AI 智能体出具诊断报告中", improvement: 8, ownership: "中外合资", greenType: "绿色工厂、绿色供应链", contactName: "张冠宇", contactPhone: "13822221712" },
  { id: "INC-2025-005", name: "上海华谊新材料有限公司", creditCode: "91310116MA1H23HUAYI", district: "金山区", industry: "石化化工行业", subIndustry: "涂料", level: "区级", energyTag: "重点用能单位", outputValue: null, energyConsumption: 21300, carbonIntensity: 0.96, score: 59, prevScore: 55, stage: "整改提升", enterDate: "2025-07-28", reviewer: "金山区经委", nextAction: "VOCs 治理方案待审定", improvement: 4, ownership: "民营", greenType: "绿色工厂", contactName: "干俊杰", contactPhone: "13822221712" },
  { id: "INC-2025-006", name: "上海联影医疗科技股份有限公司", creditCode: "91310115MA1K38UIH01", district: "嘉定区", industry: "电子行业", subIndustry: "显示器件", level: "市级", energyTag: "10亿+非重点规上", outputValue: 312000, energyConsumption: 5800, carbonIntensity: 0.12, score: 82, prevScore: 73, stage: "晋级出库", enterDate: "2024-11-12", reviewer: "市经信委", nextAction: "已颁发市级绿色工厂证书", improvement: 9, ownership: "民营", greenType: "绿色工厂", contactName: "张心雨", contactPhone: "13822221712" },
  { id: "INC-2025-007", name: "上海三菱电梯有限公司", creditCode: "91310112MA1H23MITS1", district: "闵行区", industry: "机械行业", subIndustry: "电机", level: "市级", energyTag: "10亿+非重点规上", outputValue: 187600, energyConsumption: 7400, carbonIntensity: 0.22, score: 78, prevScore: 70, stage: "复评预审", enterDate: "2025-04-18", reviewer: "闵行区生态局", nextAction: "等待 12 月市级评审", improvement: 8, ownership: "中外合资", greenType: "绿色工厂", contactName: "付开杰", contactPhone: "13822221712" },
  { id: "INC-2025-008", name: "上海某印染织造有限公司", creditCode: "91310118MA1J23DYE01", district: "青浦区", industry: "纺织行业", subIndustry: "印染", level: "区级", energyTag: "重点用能单位", outputValue: 42300, energyConsumption: 14600, carbonIntensity: 1.58, score: 48, prevScore: 50, stage: "退库", enterDate: "2024-09-10", reviewer: "青浦区生态局", nextAction: "改进无成效，已退库下年度重新自评价", improvement: -2, ownership: "国有", greenType: "绿色工厂", contactName: "陈鑫雨", contactPhone: "13822221712" },
  { id: "INC-2025-009", name: "上海某轻工日化股份有限公司", creditCode: "91310120MA1A23QG001", district: "奉贤区", industry: "轻工行业", subIndustry: "家用电器", level: "区级", energyTag: "10亿+非重点规上", outputValue: 108200, energyConsumption: 4800, carbonIntensity: 0.16, score: 66, prevScore: 58, stage: "入库登记", enterDate: "2025-10-08", reviewer: "奉贤区经委", nextAction: "完成入库材料归档，待诊断", improvement: 8, ownership: "国有", greenType: "绿色供应链", contactName: "王飞", contactPhone: "13822221712" },
];

const energyTagBadge = (t: EnergyTag) =>
  t === "重点用能单位"
    ? "border-orange-400/40 bg-orange-400/10 text-orange-600 dark:text-orange-300"
    : "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300";

function maskPhone(p: string) {
  if (!/^\d{11}$/.test(p)) return p;
  return `${p.slice(0, 3)}****${p.slice(7)}`;
}

interface AddFormState {
  name: string;
  creditCode: string;
  district: string;
  industry: string;
  ownership: Ownership | "";
  greenType: GreenType | "";
  energyTag: EnergyTag | "";
  level: IncubateLevel;
  outputValue: string;
  energyConsumption: string;
  contactName: string;
  contactPhone: string;
}

function emptyForm(level: IncubateLevel): AddFormState {
  return {
    name: "",
    creditCode: "",
    district: "",
    industry: "",
    ownership: "",
    greenType: "",
    energyTag: "",
    level,
    outputValue: "",
    energyConsumption: "",
    contactName: "",
    contactPhone: "",
  };
}

export default function GreenMfgGovIncubator() {
  const [data, setData] = useState<IncubateRecord[]>(INITIAL_INCUBATE_DATA);
  const [viewLevel, setViewLevel] = useState<IncubateLevel>("区级");
  const [keyword, setKeyword] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [energyFilter, setEnergyFilter] = useState<"all" | "绿色工厂" | "绿色供应链">("all");
  const [tierFilter, setTierFilter] = useState<"all" | IncubateLevel>("all");

  const [removeTarget, setRemoveTarget] = useState<IncubateRecord | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<IncubateRecord | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<AddFormState>(() => emptyForm("区级"));

  const scopeData = useMemo(() => {
    if (viewLevel === "市级") return data.filter((r) => r.level === "市级");
    // 区级视角
    if (tierFilter === "all") return data;
    return data.filter((r) => r.level === tierFilter);
  }, [data, viewLevel, tierFilter]);

  const rows = useMemo(
    () =>
      scopeData.filter((r) => {
        const k = keyword.trim();
        if (k && !r.name.includes(k) && !r.creditCode.includes(k)) return false;
        if (industryFilter !== "all" && r.industry !== industryFilter) return false;
                if (energyFilter !== "all") {
                  if (energyFilter === "绿色工厂" && !r.greenType.includes("绿色工厂")) return false;
                  if (energyFilter === "绿色供应链" && !r.greenType.includes("绿色供应链管理")) return false;
                }
        return true;
      }),
    [scopeData, keyword, industryFilter, energyFilter],
  );

  function handleSwitchView(lv: IncubateLevel) {
    setViewLevel(lv);
    if (lv === "市级") setTierFilter("all");
  }

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    setData((prev) => prev.filter((r) => r.id !== removeTarget.id));
    toast.success(`已将「${removeTarget.name}」从培育库中退库`);
    setRemoveTarget(null);
  }

  function handlePromoteConfirm() {
    if (!promoteTarget) return;
    setData((prev) => prev.map((r) => (r.id === promoteTarget.id ? { ...r, level: "市级" } : r)));
    toast.success(`已将「${promoteTarget.name}」升入市级梯队`);
    setPromoteTarget(null);
  }

  function openAdd() {
    setForm(emptyForm(viewLevel));
    setAddOpen(true);
  }

  function handleAddSubmit() {
    const required: Array<[keyof AddFormState, string]> = [
      ["name", "企业名称"],
      ["creditCode", "统一社会信用代码"],
      ["district", "所属区"],
      ["industry", "行业"],
      ["ownership", "企业性质"],
      ["greenType", "类型"],
      ["energyTag", "企业类型"],
      ["energyConsumption", "综合能耗"],
      ["contactName", "联系人"],
      ["contactPhone", "联系方式"],
    ];
    for (const [k, label] of required) {
      if (!String(form[k] ?? "").trim()) {
        toast.error(`请填写${label}`);
        return;
      }
    }
    if (form.creditCode.length !== 18) {
      toast.error("统一社会信用代码需 18 位");
      return;
    }
    if (!/^\d{11}$/.test(form.contactPhone)) {
      toast.error("联系方式需为 11 位手机号");
      return;
    }
    const energy = Number(form.energyConsumption);
    if (Number.isNaN(energy) || energy < 0) {
      toast.error("综合能耗需为数字");
      return;
    }
    const output = form.outputValue.trim() === "" ? null : Number(form.outputValue);
    if (output !== null && (Number.isNaN(output) || output < 0)) {
      toast.error("产值需为数字");
      return;
    }

    const maxNum = data.reduce((m, r) => {
      const n = Number(r.id.split("-").pop());
      return Number.isFinite(n) && n > m ? n : m;
    }, 0);
    const newId = `INC-2025-${String(maxNum + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().slice(0, 10);

    const newRecord: IncubateRecord = {
      id: newId,
      name: form.name.trim(),
      creditCode: form.creditCode.trim(),
      district: form.district,
      industry: form.industry,
      level: form.level,
      energyTag: form.energyTag as EnergyTag,
      outputValue: output,
      energyConsumption: energy,
      carbonIntensity: 0,
      score: 0,
      prevScore: 0,
      stage: "入库登记",
      enterDate: today,
      reviewer: form.level === "市级" ? "市经信委" : `${form.district}经委`,
      nextAction: "完成入库材料归档，待诊断",
      improvement: 0,
      ownership: form.ownership as Ownership,
      greenType: form.greenType as GreenType,
      contactName: form.contactName.trim(),
      contactPhone: maskPhone(form.contactPhone.trim()),
    };
    setData((prev) => [newRecord, ...prev]);
    toast.success(`已新增「${newRecord.name}」到${form.level}梯队培育库`);
    setAddOpen(false);
  }

  return (
    <AppLayout
      title="梯度培育"
      subtitle="梯度培育库的跟踪与管理"
      headerActions={
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["区级", "市级"] as IncubateLevel[]).map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => handleSwitchView(lv)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-md transition",
                viewLevel === lv
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {lv}专家视角
            </button>
          ))}
        </div>
      }
    >
      <Card className="panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">培育企业列表 · 共 {rows.length} 家</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索企业名称" className="h-8 w-56 pl-8 text-xs" />
              </div>
              {viewLevel === "区级" && (
                <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
                  <SelectTrigger className="h-8 w-36 text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="梯队" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部梯队</SelectItem>
                    <SelectItem value="区级">区级梯队</SelectItem>
                    <SelectItem value="市级">市级梯队</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={energyFilter} onValueChange={(v) => setEnergyFilter(v as typeof energyFilter)}>
                <SelectTrigger className="h-8 w-44 text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="绿色工厂">绿色工厂</SelectItem>
                  <SelectItem value="绿色供应链">绿色供应链</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-8 w-36 text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="行业" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行业</SelectItem>
                  {ALL_INDUSTRIES.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8" onClick={openAdd}>
                <Plus className="mr-1 h-3.5 w-3.5" />新增
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-12 text-center">序号</TableHead>
                <TableHead>所属区</TableHead>
                <TableHead>企业（园区）名称</TableHead>
                <TableHead>行业</TableHead>
                <TableHead>企业性质</TableHead>
                <TableHead className="text-center">产值（万元）</TableHead>
                <TableHead className="text-center">综合能耗（当量值）（吨标煤）</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>联系人</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={r.id} className="h-12 border-border/40">
                  <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.district}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{r.name}</div>
                  </TableCell>
                  <TableCell className="text-xs">{r.industry}</TableCell>
                  <TableCell className="text-xs">{r.ownership}</TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    {r.outputValue == null ? "/" : r.outputValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{r.energyConsumption.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[11px]", energyTagBadge(r.energyTag))}>
                      {r.energyTag === "重点用能单位" ? <Flame className="mr-1 h-3 w-3" /> : <TrendingUp className="mr-1 h-3 w-3" />}
                      {r.greenType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{r.contactName}</TableCell>
                  <TableCell className="font-mono text-xs">{r.contactPhone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {viewLevel === "区级" && r.level === "区级" && (
                        <Button size="sm" variant="outline" className="h-7 text-primary hover:text-primary" onClick={() => setPromoteTarget(r)}>
                          <ArrowUpCircle className="mr-1 h-3 w-3" />升到市级梯队
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-destructive hover:text-destructive" onClick={() => setRemoveTarget(r)}>
                        <Trash2 className="mr-1 h-3 w-3" />退库
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={11} className="h-24 text-center text-xs text-muted-foreground">暂无符合条件的培育企业</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认将该企业退库？</AlertDialogTitle>
            <AlertDialogDescription>
              即将把「{removeTarget?.name}」从培育库中删除，删除后该企业将不再出现在培育列表中。该操作可恢复需重新导入。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRemoveConfirm}>
              <Trash2 className="mr-1 h-4 w-4" />确认退库
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!promoteTarget} onOpenChange={(o) => !o && setPromoteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认升入市级梯队？</AlertDialogTitle>
            <AlertDialogDescription>
              即将把「{promoteTarget?.name}」从区级梯队升入市级梯队，市级专家将进行后续评审。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromoteConfirm}>
              <ArrowUpCircle className="mr-1 h-4 w-4" />确认升级
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新增培育企业</DialogTitle>
            <DialogDescription>
              填写企业基础信息，提交后将加入{form.level}梯队培育库，初始阶段为「入库登记」。
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto pr-1">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">企业名称 <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入企业全称" className="h-9" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">统一社会信用代码 <span className="text-destructive">*</span></Label>
              <Input value={form.creditCode} onChange={(e) => setForm({ ...form, creditCode: e.target.value.toUpperCase() })} placeholder="18 位" maxLength={18} className="h-9 font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">所属区 <span className="text-destructive">*</span></Label>
              <Select value={form.district} onValueChange={(v) => setForm({ ...form, district: v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">行业 <span className="text-destructive">*</span></Label>
              <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>{ALL_INDUSTRIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">企业性质 <span className="text-destructive">*</span></Label>
              <Select value={form.ownership} onValueChange={(v) => setForm({ ...form, ownership: v as Ownership })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>{OWNERSHIPS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">类型 <span className="text-destructive">*</span></Label>
              <Select value={form.greenType} onValueChange={(v) => setForm({ ...form, greenType: v as GreenType })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>{GREEN_TYPES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">企业类型（能耗） <span className="text-destructive">*</span></Label>
              <Select value={form.energyTag} onValueChange={(v) => setForm({ ...form, energyTag: v as EnergyTag })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>{ENERGY_TAGS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">梯队 <span className="text-destructive">*</span></Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as IncubateLevel })} disabled>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="区级">区级</SelectItem>
                  <SelectItem value="市级">市级</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">默认按当前视角（{viewLevel}）入库</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">产值（万元）</Label>
              <Input type="number" value={form.outputValue} onChange={(e) => setForm({ ...form, outputValue: e.target.value })} placeholder="选填" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">综合能耗（吨标煤） <span className="text-destructive">*</span></Label>
              <Input type="number" value={form.energyConsumption} onChange={(e) => setForm({ ...form, energyConsumption: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">联系人 <span className="text-destructive">*</span></Label>
              <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">联系方式 <span className="text-destructive">*</span></Label>
              <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="11 位手机号" maxLength={11} className="h-9 font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
            <Button onClick={handleAddSubmit}><Plus className="mr-1 h-4 w-4" />确认新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

void Sprout;
