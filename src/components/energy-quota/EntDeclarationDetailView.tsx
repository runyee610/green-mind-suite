import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Upload,
  FileText,
  FileImage,
  FileSpreadsheet,
  Building2,
  Factory,
  Droplets,
  Zap,
  Gauge,
  ClipboardList,
  Target,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  FileSignature,
  Image as ImageIcon,
  X,
  Clock,
  MessageSquare,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { QuotaDetail } from "@/components/energy-quota/quotaData";
import { cn } from "@/lib/utils";

const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

type MonthArr = number[]; // length 12

interface UploadedFile {
  name: string;
  type: "image" | "pdf" | "excel";
  size: string;
}

interface PlantData {
  id: string;
  // 基本情况（企业自填部分）
  productName: string;
  plantName: string;
  startYear: string;
  designCapacity: string; // 数值
  designCapacityUnit: string; // 单位，如 万m³/日
  // 产品产量
  waterTotal: MonthArr;       // 自来水总制水量（千立方米）
  deepProcess: MonthArr;      // 深度处理工艺制水量
  sludgeProcess: MonthArr;    // 污泥处理工艺制水量
  productionFiles: UploadedFile[];
  productionSourceDesc: string; // 数据来源说明（必填）
  // 能源消耗
  elecBill: MonthArr;         // 电费账单总量（万kWh）
  external: MonthArr;         // 外供（万kWh）
  energyFiles: UploadedFile[];
  energySourceDesc: string;   // 数据来源说明（必填）
  // 出厂水压力
  avgPressure: string;        // 兆帕
  pressureFiles: UploadedFile[];
  pressureSourceDesc: string; // 数据来源说明（必填）
}

// 默认折标系数（来自后台）
const COEF_EQUIV = 0.404;     // 等价值 kgce/kWh
const COEF_EQUAL = 0.1229;    // 当量值 kgce/kWh

const emptyMonth = (): MonthArr => Array(12).fill(0);

const newPlant = (idx: number): PlantData => ({
  id: `p${Date.now()}_${idx}`,
  productName: "自来水制水",
  plantName: "",
  startYear: "",
  designCapacity: "",
  designCapacityUnit: "万m³/日",
  waterTotal: emptyMonth(),
  deepProcess: emptyMonth(),
  sludgeProcess: emptyMonth(),
  productionFiles: [],
  productionSourceDesc: "",
  elecBill: emptyMonth(),
  external: emptyMonth(),
  energyFiles: [],
  energySourceDesc: "",
  avgPressure: "",
  pressureFiles: [],
  pressureSourceDesc: "",
});

const seedPlant: PlantData = {
  id: "p_demo_1",
  productName: "自来水制水",
  plantName: "宝山月浦水厂",
  startYear: "1998",
  designCapacity: "60",
  waterTotal: [3120, 2980, 3300, 3450, 3680, 3920, 4100, 4080, 3850, 3620, 3380, 3210],
  deepProcess: [800, 760, 880, 920, 990, 1050, 1100, 1090, 1020, 970, 900, 850],
  sludgeProcess: [120, 110, 130, 140, 150, 160, 170, 168, 155, 145, 135, 125],
  productionFiles: [{ name: "2025年制水量统计.xlsx", type: "excel", size: "186 KB" }],
  elecBill: [52.3, 50.1, 55.4, 58.2, 62.0, 66.4, 69.8, 69.2, 65.0, 61.2, 56.8, 53.6],
  external: [2.1, 2.0, 2.2, 2.3, 2.4, 2.6, 2.8, 2.7, 2.5, 2.4, 2.2, 2.1],
  energyFiles: [{ name: "电费账单汇总-2025.pdf", type: "pdf", size: "1.2 MB" }],
  avgPressure: "0.32",
  pressureFiles: [{ name: "出厂水压力监测照片.jpg", type: "image", size: "980 KB" }],
};

const sum12 = (a: MonthArr) => a.reduce((s, v) => s + (Number(v) || 0), 0);
const fmt = (n: number, d = 2) => Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }) : "—";
const safeDiv = (a: number, b: number) => b > 0 ? a / b : 0;

const fileIcon = (t: UploadedFile["type"]) => t === "image" ? FileImage : t === "excel" ? FileSpreadsheet : FileText;

interface Props {
  detail: QuotaDetail;
  onBack: () => void;
  mode?: "edit" | "audit";
}

export function EntDeclarationDetailView({ detail, onBack, mode = "edit" }: Props) {
  const readOnly = mode === "audit";
  const [tab, setTab] = useState("basic");
  const [plants, setPlants] = useState<PlantData[]>([seedPlant]);
  const [activePlantIdx, setActivePlantIdx] = useState(0);

  // 审批弹窗（仅政府侧审核模式使用）
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [rejectErr, setRejectErr] = useState(false);

  const submitReject = () => {
    if (!rejectComment.trim()) {
      setRejectErr(true);
      toast.error("驳回时必须填写审批意见");
      return;
    }
    toast.success("已驳回，审批意见已发送至企业");
    setRejectOpen(false);
    setRejectComment("");
    setRejectErr(false);
  };
  const submitApprove = () => {
    toast.success("审批通过，企业状态已更新为「已完成」");
    setApproveOpen(false);
    setApproveComment("");
  };

  // 限额报告字段（复用历史填报）
  const [reportBasicDesc, setReportBasicDesc] = useState(
    "本企业为中外合资经营企业，主要产品为自来水制水，包含取水、混凝、沉淀、过滤、消毒、清水池、二级泵房等工艺工序。能源计量器具按照 GB 17167 配备至三级，电能、水量计量数据接入 SCADA 系统。",
  );
  const [reportEnergyDesc, setReportEnergyDesc] = useState("");
  const [reportProcessDesc, setReportProcessDesc] = useState("");
  const [reportProcessImages, setReportProcessImages] = useState<UploadedFile[]>([]);
  const [reportCalcDesc, setReportCalcDesc] = useState("");
  const [reportMeterConfirmed, setReportMeterConfirmed] = useState(false);
  const [reportFinalConfirmed, setReportFinalConfirmed] = useState(false);

  const updatePlant = (idx: number, patch: Partial<PlantData>) => {
    setPlants((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const updateMonth = (idx: number, key: keyof PlantData, m: number, val: string) => {
    setPlants((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const arr = [...(p[key] as MonthArr)];
        arr[m] = Number(val) || 0;
        return { ...p, [key]: arr };
      }),
    );
  };

  const addPlant = () => {
    setPlants((p) => [...p, newPlant(p.length + 1)]);
    setActivePlantIdx(plants.length);
    toast.success("已新增水厂");
  };

  const removePlant = (idx: number) => {
    if (plants.length === 1) {
      toast.error("至少保留一个水厂");
      return;
    }
    setPlants((p) => p.filter((_, i) => i !== idx));
    setActivePlantIdx(Math.max(0, idx - 1));
    toast.success("已删除水厂");
  };

  const addFile = (idx: number, key: "productionFiles" | "energyFiles" | "pressureFiles", accept: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const type: UploadedFile["type"] = ext === "pdf" ? "pdf" : ["xls", "xlsx"].includes(ext) ? "excel" : "image";
      const newFile: UploadedFile = { name: f.name, type, size: `${(f.size / 1024).toFixed(0)} KB` };
      setPlants((prev) =>
        prev.map((p, i) =>
          i === idx ? { ...p, [key]: [...(p[key] as UploadedFile[]), newFile] } : p,
        ),
      );
      toast.success(`已上传 ${f.name}`);
    };
    input.click();
  };

  const removeFile = (idx: number, key: "productionFiles" | "energyFiles" | "pressureFiles", fname: string) => {
    setPlants((prev) =>
      prev.map((p, i) =>
        i === idx ? { ...p, [key]: (p[key] as UploadedFile[]).filter((f) => f.name !== fname) } : p,
      ),
    );
  };

  const handleSave = () => toast.success("草稿已保存");
  const handleSubmit = () => {
    // 必填校验
    for (let i = 0; i < plants.length; i++) {
      const p = plants[i];
      if (!p.plantName) return toast.error(`第 ${i + 1} 个水厂未填写名称`);
      if (sum12(p.waterTotal) <= 0) return toast.error(`${p.plantName} 自来水总制水量必填`);
      if (sum12(p.elecBill) <= 0) return toast.error(`${p.plantName} 电费账单总量必填`);
      if (sum12(p.external) <= 0) return toast.error(`${p.plantName} 外供数据必填`);
      if (!p.avgPressure) return toast.error(`${p.plantName} 出厂水平均压力必填`);
    }
    if (!reportBasicDesc.trim()) return toast.error("限额报告：企业基本情况说明必填");
    if (!reportEnergyDesc.trim()) return toast.error("限额报告：全厂能源消耗情况说明必填");
    if (!reportProcessDesc.trim() && reportProcessImages.length === 0)
      return toast.error("限额报告：工艺说明必填（文字或图片）");
    if (!reportCalcDesc.trim()) return toast.error("限额报告：单位产品能耗计算结果说明必填");
    if (!reportMeterConfirmed) return toast.error("请阅读并确认能源计量器具配备情况");
    if (!reportFinalConfirmed) return toast.error("请阅读并确认报告真实性声明");
    toast.success("已提交至政府侧审核");
  };

  const TAB_ORDER = ["basic", "production", "energy", "pressure", "summary", "result", "report"];
  const goNext = () => {
    const i = TAB_ORDER.indexOf(tab);
    if (i < TAB_ORDER.length - 1) setTab(TAB_ORDER[i + 1]);
  };
  const goPrev = () => {
    const i = TAB_ORDER.indexOf(tab);
    if (i > 0) setTab(TAB_ORDER[i - 1]);
  };

  // 汇总与对标
  const summary = useMemo(
    () =>
      plants.map((p, i) => {
        const elecTotal = sum12(p.elecBill);
        const externalTotal = sum12(p.external);
        const netElec = elecTotal - externalTotal; // 万kWh
        const water = sum12(p.waterTotal);
        const deep = sum12(p.deepProcess);
        const sludge = sum12(p.sludgeProcess);
        const pressure = Number(p.avgPressure) || 0;

        // 单位换算：万kWh / 千立方米 → kWh/km³ 乘 10000
        const calc = water > 0 ? (netElec * 10000) / water : 0;
        const dRatio = safeDiv(deep, water);
        const sRatio = safeDiv(sludge, water);
        const limit = 168 * (1 + 0.35 * dRatio + 0.066 * sRatio) + 400 * (pressure - 0.3);
        const access = 144 * (1 + 0.4 * dRatio + 0.077 * sRatio) + 380 * (pressure - 0.3);
        const advance = 138 * (1 + 0.43 * dRatio + 0.08 * sRatio) + 350 * (pressure - 0.3);

        return {
          idx: i + 1,
          name: p.plantName || `水厂 ${i + 1}`,
          netElec,
          water,
          deep,
          sludge,
          pressure,
          calc,
          limit,
          access,
          advance,
        };
      }),
    [plants],
  );

  const activePlant = plants[activePlantIdx];

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <Card className="panel">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{detail.enterpriseName}</h2>
              {readOnly ? (
                <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">待审核</Badge>
              ) : (
                <Badge variant="outline" className="border-info/40 bg-info/10 text-info">填报中</Badge>
              )}
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {detail.creditCode} · {detail.industry} · 限额周期 {detail.cyclePeriod}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {detail.records && detail.records.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />审批记录
                    <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">{detail.records.length}</Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[420px] max-h-[480px] overflow-y-auto p-4">
                  <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />审批记录轴
                  </p>
                  <ol className="relative space-y-3 border-l border-border/60 pl-4">
                    {detail.records.map((r, i) => (
                      <li key={i} className="relative">
                        <span
                          className={cn(
                            "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
                            r.action === "驳回"
                              ? "bg-destructive"
                              : r.action === "通过"
                              ? "bg-success"
                              : r.action === "提交"
                              ? "bg-warning"
                              : "bg-secondary",
                          )}
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            {r.operator} <span className="text-muted-foreground">@{r.account}</span>
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 text-[10px]",
                              r.action === "驳回"
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : r.action === "通过"
                                ? "border-success/40 bg-success/10 text-success"
                                : "border-secondary/40 bg-secondary/10 text-secondary",
                            )}
                          >
                            {r.action}
                          </Badge>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{r.time}</p>
                        {r.comment && <p className="mt-1 rounded bg-muted/40 p-2 text-xs text-foreground/80">{r.comment}</p>}
                      </li>
                    ))}
                  </ol>
                </PopoverContent>
              </Popover>
            )}
            {readOnly ? (
              <>
                <Button variant="destructive" size="sm" onClick={() => setRejectOpen(true)}>
                  <ShieldX className="mr-1 h-4 w-4" />驳回
                </Button>
                <Button size="sm" onClick={() => setApproveOpen(true)} className="bg-success text-success-foreground hover:bg-success/90">
                  <ShieldCheck className="mr-1 h-4 w-4" />通过
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-1 h-4 w-4" />保存
                </Button>
                <Button size="sm" onClick={handleSubmit}>
                  <Send className="mr-1 h-4 w-4" />提交审核
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1 h-4 w-4" />返回列表
            </Button>
          </div>
        </CardContent>
      </Card>


      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 bg-muted/40 p-1">
          <TabsTrigger value="basic" className="text-sm"><Building2 className="mr-1 h-4 w-4" />企业基本情况</TabsTrigger>
          <TabsTrigger value="production" className="text-sm"><Droplets className="mr-1 h-4 w-4" />产品产量</TabsTrigger>
          <TabsTrigger value="energy" className="text-sm"><Zap className="mr-1 h-4 w-4" />能源消耗</TabsTrigger>
          <TabsTrigger value="pressure" className="text-sm"><Gauge className="mr-1 h-4 w-4" />出厂水压力</TabsTrigger>
          <TabsTrigger value="summary" className="text-sm"><ClipboardList className="mr-1 h-4 w-4" />情况汇总</TabsTrigger>
          <TabsTrigger value="result" className="text-sm"><Target className="mr-1 h-4 w-4" />结果对标</TabsTrigger>
          <TabsTrigger value="report" className="text-sm"><FileSignature className="mr-1 h-4 w-4" />限额报告</TabsTrigger>
        </TabsList>

        {/* === 一、企业基本情况 === */}
        <TabsContent value="basic" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <Card className="panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">默认信息</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <ReadField label="企业名称" value={detail.enterpriseName} />
              <ReadField label="单位类型" value="中外合资经营企业" />
              <ReadField label="统一社会信用代码" value={detail.creditCode} mono />
              <ReadField label="所属行业分类" value="水的生产和供应业" />
              <ReadField label="主要产品类型" value="自来水制水" />
              <ReadField label="主要消耗能源品种" value="电力" />
            </CardContent>
          </Card>

          {/* 多水厂卡片 */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground mx-[11px]">水厂明细</h3>
            <Button size="sm" variant="outline" onClick={addPlant}>
              <Plus className="mr-1 h-4 w-4" />新增水厂
            </Button>
          </div>
          <div className="grid gap-3">
            {plants.map((p, i) => (
              <Card key={p.id} className="panel">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Factory className="h-4 w-4 text-primary" />
                    水厂 {i + 1}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removePlant(i)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />移除
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <FormField label="主要产品名称" required>
                    <Input
                      value={p.productName}
                      onChange={(e) => updatePlant(i, { productName: e.target.value })}
                      placeholder="如：自来水制水"
                    />
                  </FormField>
                  <FormField label="自来水厂名称" required>
                    <Input
                      value={p.plantName}
                      onChange={(e) => updatePlant(i, { plantName: e.target.value })}
                      placeholder="请输入水厂名称"
                    />
                  </FormField>
                  <FormField label="投入使用年代">
                    <Input
                      value={p.startYear}
                      onChange={(e) => updatePlant(i, { startYear: e.target.value })}
                      placeholder="如：1998"
                    />
                  </FormField>
                  <FormField label="设计产能">
                    <Input
                      type="number"
                      value={p.designCapacity}
                      onChange={(e) => updatePlant(i, { designCapacity: e.target.value })}
                      placeholder="如：60"
                    />
                  </FormField>
                </CardContent>
              </Card>
            ))}
          </div>
        </fieldset>
        </TabsContent>

        {/* === 二、产品产量计算 === */}
        <TabsContent value="production" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <PlantSwitcher plants={plants} active={activePlantIdx} onChange={setActivePlantIdx} />
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Droplets className="h-4 w-4 text-primary" />
                {activePlant.plantName || `水厂 ${activePlantIdx + 1}`} · 产品产量（千立方米）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductionTransposedTable
                cols={[
                  { label: "自来水总制水量", required: true, key: "waterTotal" },
                  { label: "深度处理工艺制水量", key: "deepProcess" },
                  { label: "污泥处理工艺制水量", key: "sludgeProcess" },
                ]}
                plant={activePlant}
                onChange={(key, m, v) => updateMonth(activePlantIdx, key, m, v)}
                unit="千立方米"
              />
              <FileUploader
                title="产量证明材料"
                accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                files={activePlant.productionFiles}
                onAdd={() => addFile(activePlantIdx, "productionFiles", ".xlsx,.xls,.pdf,.png,.jpg,.jpeg")}
                onRemove={(n) => removeFile(activePlantIdx, "productionFiles", n)}
                hint="支持 Excel / 图片 / PDF"
              />
            </CardContent>
          </Card>
        </fieldset>
        </TabsContent>

        {/* === 三、能源消耗实物量 === */}
        <TabsContent value="energy" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <PlantSwitcher plants={plants} active={activePlantIdx} onChange={setActivePlantIdx} />
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                {activePlant.plantName || `水厂 ${activePlantIdx + 1}`} · 能源消耗实物量（万kWh）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductionTransposedTable
                cols={[
                  { label: "电费账单总量", required: true, key: "elecBill" },
                  { label: "外供（转卖给其他企业）", required: true, key: "external" },
                ]}
                plant={activePlant}
                onChange={(key, m, v) => updateMonth(activePlantIdx, key, m, v)}
                unit="万kWh"
                summary={{
                  label: "总计（电费账单合计 - 外供合计）",
                  value: sum12(activePlant.elecBill) - sum12(activePlant.external),
                }}
              />

              {/* 折标系数与综合能耗 */}
              <div className="grid gap-3 md:grid-cols-4">
                <ReadField label="电力折标系数（等价值）" value={`${COEF_EQUIV} kgce/kWh`} mono />
                <ReadField label="电力折标系数（当量值）" value={`${COEF_EQUAL} kgce/kWh`} mono />
                <ReadField
                  label="综合能耗（等价值，吨标煤）"
                  value={fmt((sum12(activePlant.elecBill) - sum12(activePlant.external)) * 10000 * COEF_EQUIV / 1000, 2)}
                  mono
                  highlight
                />
                <ReadField
                  label="综合能耗（当量值，吨标煤）"
                  value={fmt((sum12(activePlant.elecBill) - sum12(activePlant.external)) * 10000 * COEF_EQUAL / 1000, 2)}
                  mono
                  highlight
                />
              </div>

              <FileUploader
                title="能源消耗证明材料"
                accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                files={activePlant.energyFiles}
                onAdd={() => addFile(activePlantIdx, "energyFiles", ".xlsx,.xls,.pdf,.png,.jpg,.jpeg")}
                onRemove={(n) => removeFile(activePlantIdx, "energyFiles", n)}
                hint="支持 Excel / 图片 / PDF"
              />
            </CardContent>
          </Card>
        </fieldset>
        </TabsContent>

        {/* === 四、出厂水压力 === */}
        <TabsContent value="pressure" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <PlantSwitcher plants={plants} active={activePlantIdx} onChange={setActivePlantIdx} />
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4 text-primary" />
                {activePlant.plantName || `水厂 ${activePlantIdx + 1}`} · 出厂水压力
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="出厂水平均压力（兆帕 MPa）" required>
                <Input
                  type="number"
                  step="0.01"
                  value={activePlant.avgPressure}
                  onChange={(e) => updatePlant(activePlantIdx, { avgPressure: e.target.value })}
                  placeholder="如：0.32"
                  className="max-w-xs"
                />
              </FormField>
              <FileUploader
                title="出厂水压力证明材料"
                accept=".png,.jpg,.jpeg"
                files={activePlant.pressureFiles}
                onAdd={() => addFile(activePlantIdx, "pressureFiles", ".png,.jpg,.jpeg")}
                onRemove={(n) => removeFile(activePlantIdx, "pressureFiles", n)}
                hint="仅支持图片格式"
              />
            </CardContent>
          </Card>
        </fieldset>
        </TabsContent>

        {/* === 五、情况汇总表 === */}
        <TabsContent value="summary" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="h-4 w-4 text-primary" />情况汇总
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">序号</TableHead>
                    <TableHead>自来水厂名称</TableHead>
                    <TableHead className="text-right">制水总耗电量(万kWh)</TableHead>
                    <TableHead className="text-right">自来水总制水量(千m³)</TableHead>
                    <TableHead className="text-right">深度处理(千m³)</TableHead>
                    <TableHead className="text-right">污泥处理(千m³)</TableHead>
                    <TableHead className="text-right">出厂水平均压力(MPa)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((s) => (
                    <TableRow key={s.idx}>
                      <TableCell className="font-mono text-xs">{s.idx}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(s.netElec)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(s.water)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(s.deep)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(s.sludge)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{fmt(s.pressure, 2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">指标计算</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">序号</TableHead>
                    <TableHead>水厂</TableHead>
                    <TableHead>指标</TableHead>
                    <TableHead className="text-right w-28">数值</TableHead>
                    <TableHead className="text-xs">计算公式</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((s) => {
                    const rows = [
                      { label: "计算值", value: s.calc, formula: "制水总耗电量 / 自来水总制水量", highlight: true },
                      { label: "限定值", value: s.limit, formula: "168×(1+0.35·深度/总+0.066·污泥/总)+400×(压力-0.3)" },
                      { label: "准入值", value: s.access, formula: "144×(1+0.4·深度/总+0.077·污泥/总)+380×(压力-0.3)" },
                      { label: "先进值", value: s.advance, formula: "138×(1+0.43·深度/总+0.08·污泥/总)+350×(压力-0.3)" },
                    ];
                    return rows.map((r, i) => (
                      <TableRow key={`${s.idx}-${r.label}`}>
                        {i === 0 ? (
                          <>
                            <TableCell rowSpan={4} className="font-mono text-xs align-top">{s.idx}</TableCell>
                            <TableCell rowSpan={4} className="font-medium align-top">{s.name}</TableCell>
                          </>
                        ) : null}
                        <TableCell className="text-sm">{r.label}</TableCell>
                        <TableCell className={cn("text-right font-mono text-xs", r.highlight && "text-primary font-semibold")}>{fmt(r.value)}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">{r.formula}</TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
              <p className="mt-2 text-xs text-muted-foreground">单位：kWh/km³</p>
            </CardContent>
          </Card>
        </fieldset>
        </TabsContent>

        {/* === 六、结果对标 === */}
        <TabsContent value="result" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <Card className="panel">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />结果对标
                </CardTitle>
                {(() => {
                  const allAdvance = summary.length > 0 && summary.every((s) => s.calc <= s.advance);
                  const allAccess = summary.length > 0 && summary.every((s) => s.calc <= s.access);
                  const allLimit = summary.length > 0 && summary.every((s) => s.calc <= s.limit);
                  const label = allAdvance
                    ? "达到先进值"
                    : allAccess
                    ? "达到准入值"
                    : allLimit
                    ? "达到限定值"
                    : "未达标";
                  const cls = allAdvance
                    ? "border-success/40 bg-success/10 text-success"
                    : allAccess
                    ? "border-info/40 bg-info/10 text-info"
                    : allLimit
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-destructive/40 bg-destructive/10 text-destructive";
                  return (
                    <Badge variant="outline" className={cn("font-medium", cls)}>
                      {label}
                    </Badge>
                  );
                })()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-14 text-center">序号</TableHead>
                      <TableHead>自来水厂名称</TableHead>
                      <TableHead>指标名称</TableHead>
                      <TableHead className="w-24">指标单位</TableHead>
                      <TableHead className="text-right">计算值</TableHead>
                      <TableHead className="text-right">限定值</TableHead>
                      <TableHead className="text-right">准入值</TableHead>
                      <TableHead className="text-right">先进值</TableHead>
                      <TableHead className="w-24 text-center">评判准则</TableHead>
                      <TableHead className="w-20 text-center">结论</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.map((s) => {
                      const passLimit = s.calc <= s.limit;
                      return (
                        <TableRow key={s.idx}>
                          <TableCell className="text-center font-mono text-xs">{s.idx}</TableCell>
                          <TableCell className="text-sm font-medium">{s.name}</TableCell>
                          <TableCell className="text-sm">可比自来水制水单位产品电耗</TableCell>
                          <TableCell className="font-mono text-xs">kWh/km³</TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-primary">{fmt(s.calc)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmt(s.limit)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmt(s.access)}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{fmt(s.advance)}</TableCell>
                          <TableCell className="text-center font-mono text-sm">≤</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-medium",
                                passLimit
                                  ? "border-success/40 bg-success/10 text-success"
                                  : "border-destructive/40 bg-destructive/10 text-destructive",
                              )}
                            >
                              {passLimit ? "合格" : "不合格"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </fieldset>
        </TabsContent>

        {/* === 七、限额报告 === */}
        <TabsContent value="report" className="space-y-4">
          <fieldset disabled={readOnly} className="contents">
          <Card className="panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSignature className="h-4 w-4 text-primary" />限额报告
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                请逐项填写或确认以下内容，提交后将与填报数据一并送审。
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 一、企业基本情况 */}
              <ReportSection index="一" title="企业基本情况" required note="若企业有过往填写记录，已自动复用，可在此基础上修改。">
                <Textarea
                  value={reportBasicDesc}
                  onChange={(e) => setReportBasicDesc(e.target.value)}
                  placeholder="文字说明：企业的主要产品；生产工艺和工序；能源计量情况。以及其他希望说明的情况"
                  className="min-h-[120px]"
                />
              </ReportSection>

              {/* 二、全厂能源消耗情况 */}
              <ReportSection index="二" title="全厂能源消耗情况" required>
                <Textarea
                  value={reportEnergyDesc}
                  onChange={(e) => setReportEnergyDesc(e.target.value)}
                  placeholder="请说明全厂能源消耗情况，包括各品种能源消耗量、构成、同比变化及主要原因等"
                  className="min-h-[100px]"
                />
              </ReportSection>

              {/* 三、工艺说明 */}
              <ReportSection index="三" title="工艺说明" required note="支持图片或文字（至少其一）。">
                <Textarea
                  value={reportProcessDesc}
                  onChange={(e) => setReportProcessDesc(e.target.value)}
                  placeholder="贴上从原料进厂到成品入库全过程的用能单元及工序工艺流程示意图以及工艺说明"
                  className="min-h-[100px]"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = () => {
                        const f = input.files?.[0];
                        if (!f) return;
                        setReportProcessImages((prev) => [
                          ...prev,
                          { name: f.name, type: "image", size: `${(f.size / 1024).toFixed(0)} KB` },
                        ]);
                        toast.success(`已上传 ${f.name}`);
                      };
                      input.click();
                    }}
                  >
                    <ImageIcon className="mr-1 h-4 w-4" />上传工艺流程图
                  </Button>
                  <span className="text-xs text-muted-foreground">已上传 {reportProcessImages.length} 张</span>
                </div>
                {reportProcessImages.length > 0 && (
                  <div className="space-y-1.5">
                    {reportProcessImages.map((f) => (
                      <div key={f.name} className="flex items-center justify-between rounded border border-border/40 bg-muted/20 px-3 py-1.5 text-xs">
                        <span className="flex items-center gap-2">
                          <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                          {f.name}
                          <span className="text-muted-foreground">· {f.size}</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            setReportProcessImages((prev) => prev.filter((x) => x.name !== f.name))
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ReportSection>

              {/* 四、单位产品能耗情况 */}
              <ReportSection index="四" title="单位产品能耗情况" required>
                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">1. 计算过程（根据填报数据自动生成）</p>
                    <div className="overflow-hidden rounded-md border border-border/60">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>水厂</TableHead>
                            <TableHead className="text-right">净电耗(万kWh)</TableHead>
                            <TableHead className="text-right">总制水量(km³)</TableHead>
                            <TableHead className="text-right">单位产品电耗(kWh/km³)</TableHead>
                            <TableHead>计算公式</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.map((s) => (
                            <TableRow key={s.idx}>
                              <TableCell className="font-mono text-xs">{s.idx}</TableCell>
                              <TableCell className="text-sm">{s.name}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{fmt(s.netElec)}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{fmt(s.water)}</TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold text-primary">{fmt(s.calc)}</TableCell>
                              <TableCell className="font-mono text-[11px] text-muted-foreground">
                                (净电耗 × 10000) ÷ 总制水量 = ({fmt(s.netElec)} × 10000) ÷ {fmt(s.water)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">2. 计算结果说明 <span className="text-destructive">*</span></p>
                    <Textarea
                      value={reportCalcDesc}
                      onChange={(e) => setReportCalcDesc(e.target.value)}
                      placeholder="请结合上述计算过程，说明单位产品能耗水平、与限定值/准入值/先进值的对比情况及结论"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </ReportSection>

              {/* 五、企业能源计量器具配备情况 */}
              <ReportSection index="五" title="企业能源计量器具配备情况">
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm leading-relaxed text-foreground">
                  企业对照《用能单位能源计量器具配备和管理通则》（GB 17167），自查了进出用能单位、进出主要次级用能单位、主要用能设备三级能源计量器具配备和管理情况，基本符合规定要求。
                </div>
                <label className="flex items-start gap-2 pt-1 text-sm">
                  <Checkbox
                    checked={reportMeterConfirmed}
                    onCheckedChange={(v) => setReportMeterConfirmed(v === true)}
                    className="mt-0.5"
                  />
                  <span>本企业已阅读并确认上述能源计量器具配备情况描述属实。</span>
                </label>
              </ReportSection>

              {/* 结尾声明 */}
              <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
                <p className="text-sm text-foreground">
                  本报告真实、可靠，如报告中的信息与实际情况不符，本企业将承担相应的法律责任。
                </p>
                <label className="mt-2 flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={reportFinalConfirmed}
                    onCheckedChange={(v) => setReportFinalConfirmed(v === true)}
                    className="mt-0.5"
                  />
                  <span>本企业已阅读并确认上述声明，同意提交本报告。</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </fieldset>
        </TabsContent>

        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={tab === TAB_ORDER[0]}>
            <ChevronLeft className="mr-1 h-4 w-4" />上一步
          </Button>
          <span className="text-xs text-muted-foreground">
            第 {TAB_ORDER.indexOf(tab) + 1} / {TAB_ORDER.length} 步
          </span>
          {tab === TAB_ORDER[TAB_ORDER.length - 1] ? (
            readOnly ? (
              <span className="text-xs text-muted-foreground">已到末页</span>
            ) : (
              <Button size="sm" onClick={handleSubmit}>
                <Send className="mr-1 h-4 w-4" />提交审核
              </Button>
            )
          ) : (
            <Button size="sm" onClick={goNext}>
              下一步<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </Tabs>

      {/* 驳回弹窗 */}
      <Dialog open={rejectOpen} onOpenChange={(o) => { setRejectOpen(o); if (!o) setRejectErr(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive"><ShieldX className="mr-2 inline h-5 w-5" />驳回审批</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">驳回意见将发送至企业填报人。<span className="text-destructive">必填</span>。</p>
            <Textarea
              value={rejectComment}
              onChange={(e) => { setRejectComment(e.target.value); if (e.target.value.trim()) setRejectErr(false); }}
              placeholder="请详细说明驳回原因（如：单位产品能耗高于限额，需补充能源审计报告等）"
              rows={5}
              className={cn(rejectErr && "border-destructive ring-2 ring-destructive/30")}
            />
            {rejectErr && (
              <p className="text-xs text-destructive">
                <MessageSquare className="mr-1 inline h-3 w-3" />驳回时必须填写审批意见
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={submitReject}>确认驳回</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 通过弹窗 */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-success"><ShieldCheck className="mr-2 inline h-5 w-5" />审批通过</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">确认通过后，企业状态将变更为「已完成」并锁定数据。审批意见可选。</p>
            <Textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="审批意见（选填）" rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>取消</Button>
            <Button onClick={submitApprove} className="bg-success text-success-foreground hover:bg-success/90">确认通过</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== 子组件 =====

function ReadField({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-sm", mono && "font-mono text-xs", highlight && "font-semibold text-primary")}>{value || "—"}</p>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function PlantSwitcher({ plants, active, onChange }: { plants: PlantData[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-muted/20 px-3 py-2">
      <span className="text-xs text-muted-foreground">选择水厂：</span>
      {plants.map((p, i) => (
        <button
          key={p.id}
          onClick={() => onChange(i)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition",
            i === active
              ? "border-primary bg-primary/10 text-primary font-semibold"
              : "border-border/60 bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          <Factory className="h-3 w-3" />
          {p.plantName || `水厂 ${i + 1}`}
        </button>
      ))}
    </div>
  );
}

interface MonthlyRow {
  label: string;
  required?: boolean;
  key: keyof PlantData;
}

interface ExtraSummaryRow {
  label: string;
  values: MonthArr;
  isCompactSummary?: boolean;
  summaryValue?: number;
}

function MonthlyTable({
  rows,
  plant,
  onChange,
  unit,
  extraRows,
}: {
  rows: MonthlyRow[];
  plant: PlantData;
  onChange: (key: keyof PlantData, m: number, v: string) => void;
  unit: string;
  extraRows?: ExtraSummaryRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="sticky left-0 z-10 min-w-[180px] bg-muted/40 font-semibold">指标 ({unit})</TableHead>
            {MONTHS.map((m) => (
              <TableHead key={m} className="min-w-[80px] text-center text-xs">{m}</TableHead>
            ))}
            <TableHead className="min-w-[100px] text-center text-xs font-semibold text-primary">合计</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const arr = plant[r.key] as MonthArr;
            return (
              <TableRow key={r.key as string}>
                <TableCell className="sticky left-0 z-10 bg-background text-sm font-medium">
                  {r.label}
                  {r.required && <span className="ml-0.5 text-destructive">*</span>}
                </TableCell>
                {arr.map((v, m) => (
                  <TableCell key={m} className="p-1">
                    <Input
                      type="number"
                      value={v || ""}
                      onChange={(e) => onChange(r.key, m, e.target.value)}
                      className="h-8 text-right font-mono text-xs"
                    />
                  </TableCell>
                ))}
                <TableCell className="bg-primary/5 text-right font-mono text-xs font-semibold text-primary">
                  {fmt(sum12(arr))}
                </TableCell>
              </TableRow>
            );
          })}
          {extraRows?.map((r, i) => (
            <TableRow key={`extra-${i}`} className="bg-warning/5">
              <TableCell className="sticky left-0 z-10 bg-warning/5 text-sm font-semibold text-warning">
                {r.label}
              </TableCell>
              <TableCell colSpan={12} className="text-center text-xs text-muted-foreground">
                自动计算
              </TableCell>
              <TableCell className="text-right font-mono text-xs font-semibold text-warning">
                {fmt(r.summaryValue ?? 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProductionTransposedTable({
  cols,
  plant,
  onChange,
  unit,
  summary,
}: {
  cols: MonthlyRow[];
  plant: PlantData;
  onChange: (key: keyof PlantData, m: number, v: string) => void;
  unit: string;
  summary?: { label: string; value: number };
}) {
  const handlePaste = (key: keyof PlantData, startMonth: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const parts = text.split(/[\t\n\r,;]+/).map((s) => s.trim()).filter((s) => s !== "");
    if (parts.length <= 1) return;
    e.preventDefault();
    parts.forEach((v, i) => {
      const m = startMonth + i;
      if (m < 12 && !isNaN(Number(v))) onChange(key, m, v);
    });
  };

  return (
    <div className="overflow-x-auto rounded-md border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="sticky left-0 z-10 min-w-[80px] bg-muted/40 font-semibold">月份 ({unit})</TableHead>
            {cols.map((c) => (
              <TableHead key={c.key as string} className="min-w-[140px] text-center text-xs">
                {c.label}
                {c.required && <span className="ml-0.5 text-destructive">*</span>}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {MONTHS.map((m, mi) => (
            <TableRow key={m}>
              <TableCell className="sticky left-0 z-10 bg-background text-sm font-medium">{m}</TableCell>
              {cols.map((c) => {
                const arr = plant[c.key] as MonthArr;
                return (
                  <TableCell key={c.key as string} className="p-1">
                    <Input
                      type="number"
                      value={arr[mi] || ""}
                      onChange={(e) => onChange(c.key, mi, e.target.value)}
                      onPaste={handlePaste(c.key, mi)}
                      placeholder={mi === 0 ? "可粘贴1-12月" : ""}
                      className="h-8 text-right font-mono text-xs"
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          <TableRow className="bg-primary/5 hover:bg-primary/5">
            <TableCell className="sticky left-0 z-10 bg-primary/5 text-sm font-semibold text-primary">合计</TableCell>
            {cols.map((c) => (
              <TableCell key={c.key as string} className="text-right font-mono text-xs font-semibold text-primary">
                {fmt(sum12(plant[c.key] as MonthArr))}
              </TableCell>
            ))}
          </TableRow>
          {summary ? (
            <TableRow className="bg-warning/5 hover:bg-warning/5">
              <TableCell className="sticky left-0 z-10 bg-warning/5 text-sm font-semibold text-warning">
                {summary.label}
              </TableCell>
              <TableCell colSpan={cols.length} className="text-right font-mono text-xs font-semibold text-warning">
                {fmt(summary.value)}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}

function FileUploader({
  title,
  accept,
  files,
  onAdd,
  onRemove,
  hint,
}: {
  title: string;
  accept: string;
  files: UploadedFile[];
  onAdd: () => void;
  onRemove: (n: string) => void;
  hint: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border/60 bg-muted/10 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Upload className="mr-1 h-4 w-4" />上传
        </Button>
      </div>
      {files.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">暂无上传文件</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => {
            const Icon = fileIcon(f.type);
            return (
              <div key={f.name} className="flex items-center gap-2 rounded-md border border-border/40 bg-background p-2">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{f.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{f.size}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onRemove(f.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, pass, calc }: { label: string; value: number; pass: boolean; calc: number }) {
  return (
    <TableRow>
      <TableCell className="text-sm">{label}</TableCell>
      <TableCell className="font-mono text-xs">kWh/km³</TableCell>
      <TableCell className="text-right font-mono text-xs">{fmt(value)}</TableCell>
      <TableCell className="text-center text-xs">
        <span className="font-mono">{fmt(calc)} ≤ {fmt(value)}</span>
      </TableCell>
      <TableCell className="text-center">
        {pass ? (
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
            <CheckCircle2 className="mr-0.5 h-3 w-3" />达标
          </Badge>
        ) : (
          <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive">
            <XCircle className="mr-0.5 h-3 w-3" />未达
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

function ReportSection({
  index,
  title,
  required,
  note,
  children,
}: {
  index: string;
  title: string;
  required?: boolean;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground">{index}、{title}</span>
        {required && <span className="text-xs text-destructive">必填</span>}
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
