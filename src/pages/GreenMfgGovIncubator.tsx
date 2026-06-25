import { useMemo, useState } from "react";
import {
  Search,
  Sprout,
  Filter,
  Flame,
  TrendingUp,
  Trash2,
  ArrowUpCircle,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
type GreenType = "绿色工厂" | "绿色供应链管理" | "绿色工厂、绿色供应链管理";

interface IncubateRecord {
  id: string;
  name: string;
  creditCode: string;
  district: string;
  industry: string;
  subIndustry?: string;
  level: IncubateLevel;
  energyTag: EnergyTag;
  outputValue: number | null; // 万元
  energyConsumption: number; // 吨标煤
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
  { id: "INC-2025-001", name: "上海石化化工新材料分公司", creditCode: "91310116MA1H23ABC4", district: "金山区", industry: "石化化工行业", subIndustry: "煤制烯烃", level: "市级", energyTag: "重点用能单位", outputValue: 89500, energyConsumption: 36800, carbonIntensity: 1.42, score: 64, prevScore: 58, stage: "整改提升", enterDate: "2025-08-15", reviewer: "金山区生态局", nextAction: "11 月底前完成余热回收改造", improvement: 6, ownership: "国有", greenType: "绿色工厂", contactName: "王欣玮", contactPhone: "138****1712" },
  { id: "INC-2025-002", name: "宝钢轧辊（上海）有限公司", creditCode: "91310113MA1H23BC02", district: "宝山区", industry: "钢铁行业", subIndustry: "短流程钢铁企业", level: "市级", energyTag: "重点用能单位", outputValue: 156200, energyConsumption: 52400, carbonIntensity: 1.18, score: 71, prevScore: 62, stage: "复评预审", enterDate: "2025-06-20", reviewer: "市经信委", nextAction: "等待 12 月专家组复评打分", improvement: 9, ownership: "国有", greenType: "绿色工厂", contactName: "韩淑哲", contactPhone: "139****3325" },
  { id: "INC-2025-003", name: "中微半导体设备(上海)股份有限公司", creditCode: "91310115MA1K0DEF56", district: "浦东新区", industry: "电子行业", subIndustry: "集成电路", level: "市级", energyTag: "10亿+非重点规上", outputValue: 134000, energyConsumption: 8900, carbonIntensity: 0.32, score: 76, prevScore: 68, stage: "复评预审", enterDate: "2025-05-10", reviewer: "浦东经委", nextAction: "AI 预审已通过，进入晋级公示", improvement: 8, ownership: "民营", greenType: "绿色工厂、绿色供应链管理", contactName: "刘海洋", contactPhone: "137****8824" },
  { id: "INC-2025-004", name: "上海延锋汽车饰件系统有限公司", creditCode: "91310115MA1K38AUTO2", district: "嘉定区", industry: "机械行业", subIndustry: "汽车整车", level: "区级", energyTag: "10亿+非重点规上", outputValue: 218000, energyConsumption: 6200, carbonIntensity: 0.18, score: 68, prevScore: 60, stage: "诊断评估", enterDate: "2025-09-02", reviewer: "嘉定区经委", nextAction: "AI 智能体出具诊断报告中", improvement: 8, ownership: "中外合资", greenType: "绿色工厂、绿色供应链管理", contactName: "张冠宇", contactPhone: "135****1899" },
  { id: "INC-2025-005", name: "上海华谊新材料有限公司", creditCode: "91310116MA1H23HUAYI", district: "金山区", industry: "石化化工行业", subIndustry: "涂料", level: "区级", energyTag: "重点用能单位", outputValue: null, energyConsumption: 21300, carbonIntensity: 0.96, score: 59, prevScore: 55, stage: "整改提升", enterDate: "2025-07-28", reviewer: "金山区经委", nextAction: "VOCs 治理方案待审定", improvement: 4, ownership: "民营", greenType: "绿色工厂", contactName: "干俊杰", contactPhone: "136****9803" },
  { id: "INC-2025-006", name: "上海联影医疗科技股份有限公司", creditCode: "91310115MA1K38UIH01", district: "嘉定区", industry: "电子行业", subIndustry: "显示器件", level: "市级", energyTag: "10亿+非重点规上", outputValue: 312000, energyConsumption: 5800, carbonIntensity: 0.12, score: 82, prevScore: 73, stage: "晋级出库", enterDate: "2024-11-12", reviewer: "市经信委", nextAction: "已颁发市级绿色工厂证书", improvement: 9, ownership: "民营", greenType: "绿色工厂", contactName: "张心雨", contactPhone: "138****8952" },
  { id: "INC-2025-007", name: "上海三菱电梯有限公司", creditCode: "91310112MA1H23MITS1", district: "闵行区", industry: "机械行业", subIndustry: "电机", level: "市级", energyTag: "10亿+非重点规上", outputValue: 187600, energyConsumption: 7400, carbonIntensity: 0.22, score: 78, prevScore: 70, stage: "复评预审", enterDate: "2025-04-18", reviewer: "闵行区生态局", nextAction: "等待 12 月市级评审", improvement: 8, ownership: "中外合资", greenType: "绿色工厂", contactName: "付开杰", contactPhone: "139****9299" },
  { id: "INC-2025-008", name: "上海某印染织造有限公司", creditCode: "91310118MA1J23DYE01", district: "青浦区", industry: "纺织行业", subIndustry: "印染", level: "区级", energyTag: "重点用能单位", outputValue: 42300, energyConsumption: 14600, carbonIntensity: 1.58, score: 48, prevScore: 50, stage: "退库", enterDate: "2024-09-10", reviewer: "青浦区生态局", nextAction: "改进无成效，已退库下年度重新自评价", improvement: -2, ownership: "国有", greenType: "绿色工厂", contactName: "陈鑫雨", contactPhone: "137****1823" },
  { id: "INC-2025-009", name: "上海某轻工日化股份有限公司", creditCode: "91310120MA1A23QG001", district: "奉贤区", industry: "轻工行业", subIndustry: "家用电器", level: "区级", energyTag: "10亿+非重点规上", outputValue: 108200, energyConsumption: 4800, carbonIntensity: 0.16, score: 66, prevScore: 58, stage: "入库登记", enterDate: "2025-10-08", reviewer: "奉贤区经委", nextAction: "完成入库材料归档，待诊断", improvement: 8, ownership: "国有", greenType: "绿色供应链管理", contactName: "王飞", contactPhone: "135****8315" },
];

const energyTagBadge = (t: EnergyTag) =>
  t === "重点用能单位"
    ? "border-orange-400/40 bg-orange-400/10 text-orange-600 dark:text-orange-300"
    : "border-emerald-400/40 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300";

export default function GreenMfgGovIncubator() {
  const [data, setData] = useState<IncubateRecord[]>(INITIAL_INCUBATE_DATA);
  const [viewLevel, setViewLevel] = useState<IncubateLevel>("区级");
  const [keyword, setKeyword] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [energyFilter, setEnergyFilter] = useState<"all" | EnergyTag>("all");

  const [removeTarget, setRemoveTarget] = useState<IncubateRecord | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<IncubateRecord | null>(null);

  const scopeData = useMemo(() => data.filter((r) => r.level === viewLevel), [data, viewLevel]);

  const rows = useMemo(
    () =>
      scopeData.filter((r) => {
        const k = keyword.trim();
        if (k && !r.name.includes(k) && !r.creditCode.includes(k)) return false;
        if (industryFilter !== "all" && r.industry !== industryFilter) return false;
        if (energyFilter !== "all" && r.energyTag !== energyFilter) return false;
        return true;
      }),
    [scopeData, keyword, industryFilter, energyFilter],
  );

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    setData((prev) => prev.filter((r) => r.id !== removeTarget.id));
    toast.success(`已将「${removeTarget.name}」从培育库中退库`);
    setRemoveTarget(null);
  }

  function handlePromoteConfirm() {
    if (!promoteTarget) return;
    setData((prev) => prev.map((r) => (r.id === promoteTarget.id ? { ...r, level: "市级" } : r)));
    toast.success(`已将「${promoteTarget.name}」推荐到市级培育库`);
    setPromoteTarget(null);
  }

  return (
    <AppLayout
      title="绿色工厂梯度培育"
      subtitle="梯度培育库的跟踪与管理"
      headerActions={
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["区级", "市级"] as IncubateLevel[]).map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setViewLevel(lv)}
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
              <Select value={energyFilter} onValueChange={(v) => setEnergyFilter(v as typeof energyFilter)}>
                <SelectTrigger className="h-8 w-44 text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="企业类型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="重点用能单位">重点用能单位</SelectItem>
                  <SelectItem value="10亿+非重点规上">10亿+非重点规上</SelectItem>
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="h-8 w-36 text-xs"><Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="行业" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行业</SelectItem>
                  {ALL_INDUSTRIES.map((n) => (<SelectItem key={n} value={n}>{n}</SelectItem>))}
                </SelectContent>
              </Select>
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
                      {viewLevel === "区级" && (
                        <Button size="sm" variant="outline" className="h-7 text-primary hover:text-primary" onClick={() => setPromoteTarget(r)}>
                          <ArrowUpCircle className="mr-1 h-3 w-3" />推荐到市级
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
            <AlertDialogTitle>确认推荐到市级培育库？</AlertDialogTitle>
            <AlertDialogDescription>
              即将把「{promoteTarget?.name}」从区级培育库推荐至市级培育库，市级专家将进行后续评审。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromoteConfirm}>
              <ArrowUpCircle className="mr-1 h-4 w-4" />确认推荐
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

void Sprout;
