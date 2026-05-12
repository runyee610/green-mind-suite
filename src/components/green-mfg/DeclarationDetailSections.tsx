import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building2, ClipboardCheck, Download, Eye, FileSignature, FileText, Image as ImageIcon, ListChecks, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EVALUATION_INDICATORS, EVALUATION_TOTAL_SCORE, EMPTY_PRODUCT_ENERGY_ENTRY, PLATFORM_FUNCTION_OPTIONS, type IndicatorRow, type ProductEnergyEntry } from "./evaluationIndicators";
import { Checkbox } from "@/components/ui/checkbox";
import { INDUSTRY_TREE, ALL_INDUSTRIES, getSubIndustries, getIndustryType } from "./data";

export type DetailMode = "ent" | "gov" | "view";

export interface EnterpriseBasicInfo {
  factoryName: string;
  address: string;
  industry: string;
  subIndustry: string;
  nonKeySubIndustry?: string;
  statBureauCode: string;
  unitNature: "国有央企" | "国有其它" | "合资企业" | "民营企业" | "外资企业";
  contactDept: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  processIntro: string;
  greenDevIntro: string;
}

export const MOCK_ENTERPRISE_BASIC: EnterpriseBasicInfo = {
  factoryName: "上海华普电缆有限公司",
  address: "上海市 上海市 闵行区 上海市闵行区光华路2800号",
  industry: "机械行业",
  subIndustry: "电线电缆",
  nonKeySubIndustry: "",
  statBureauCode: "3831",
  unitNature: "国有其它",
  contactDept: "总师办",
  contactName: "杨帆",
  contactPhone: "15800399640",
  contactEmail: "yangfan9@shanghai-electric.com",
  processIntro:
    "上海华普电缆有限公司是上海电气输配电集团有限公司控股国有企业。主要产品涵盖35kV及以下高低压电力电缆、架空线、阻燃耐火电缆等十几种4000余规格。公司主要生产工艺包括：拉丝、绞线、挤塑、交联、屏蔽、成缆、铠装等。公司先后通过了ISO9001、ISO14001、OHSAS18001、ISO50001体系认证，中国国家强制性产品CCC认证，拥有多项国家级专利技术，具备领先行业的专业技术和雄厚的科研实力，公司生产的35kV及以下交联聚乙烯绝缘电力电缆荣获“上海名牌”产品称号。",
  greenDevIntro:
    "华普注重资源投入，在能源方面，持续对设施设备进行改造更新，近五年内陆续完成变频空调改造、空压机更换、挤塑机升级、叉车油改电、成缆机汰换、测偏仪引进等项目，2025年完成光伏发电项目。\n在资源方面，企业通过工艺技改，实现了在保证产品质量的情况下，有效减少铜材使用量。同时企业在重点用能设备、能源上线安装了计量表具，实现对每个生产工序的能耗统计分析，据此定期优化更新生产设备。\n华普电缆响应国家绿色低碳转型发展趋势和要求，开发新型环保产品-PP电缆，相较于传统电缆，PP电缆在生产时耗能更小且不产生交联副产物，PP料可全部回收利用，减少了电缆的生产成本，同时大幅降低环境影响，是未来电缆产品的发展方向。",
};

const UNIT_NATURE_OPTIONS: EnterpriseBasicInfo["unitNature"][] = [
  "国有央企",
  "国有其它",
  "合资企业",
  "民营企业",
  "外资企业",
];

export const EMPTY_ENTERPRISE_BASIC: EnterpriseBasicInfo = {
  factoryName: "",
  address: "",
  industry: "",
  subIndustry: "",
  nonKeySubIndustry: "",
  statBureauCode: "",
  unitNature: "民营企业",
  contactDept: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  processIntro: "",
  greenDevIntro: "",
};

export function EnterpriseBasicInfoCard({
  data = MOCK_ENTERPRISE_BASIC,
  editable = false,
  onChange,
}: {
  data?: EnterpriseBasicInfo;
  editable?: boolean;
  onChange?: (next: EnterpriseBasicInfo) => void;
}) {
  const update = (patch: Partial<EnterpriseBasicInfo>) => onChange?.({ ...data, ...patch });
  const text = (v: string, placeholder: string, key?: keyof EnterpriseBasicInfo) =>
    editable ? (
      <Input
        value={v}
        placeholder={placeholder}
        className="h-8 text-sm"
        onChange={(e) => key && update({ [key]: e.target.value } as Partial<EnterpriseBasicInfo>)}
      />
    ) : (
      <span>{v || <span className="text-muted-foreground">—</span>}</span>
    );
  const area = (v: string, placeholder: string, rows = 4, key?: keyof EnterpriseBasicInfo) =>
    editable ? (
      <Textarea
        value={v}
        placeholder={placeholder}
        rows={rows}
        className="text-sm"
        onChange={(e) => key && update({ [key]: e.target.value } as Partial<EnterpriseBasicInfo>)}
      />
    ) : (
      <p className="whitespace-pre-line text-sm leading-relaxed">
        {v || <span className="text-muted-foreground">—</span>}
      </p>
    );

  return (
    <Card id="basic-info" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <Building2 className="mr-1 inline h-4 w-4" />一、企业基本信息表
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <Row label="工厂名称" value={text(data.factoryName, "请填写工厂名称", "factoryName")} />
          <Row label="通讯地址" value={text(data.address, "请填写通讯地址", "address")} />
          <Row
            label="所属行业"
            value={
              editable ? (
                <Select
                  value={data.industry}
                  onValueChange={(v) => update({ industry: v, subIndustry: "" })}
                >
                  <SelectTrigger className="h-8 w-56 text-sm"><SelectValue placeholder="请选择所属行业" /></SelectTrigger>
                  <SelectContent>
                    {ALL_INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span>{data.industry || <span className="text-muted-foreground">—</span>}</span>
              )
            }
          />
          <Row
            label="细分行业"
            value={
              editable ? (
                <Select
                  value={data.subIndustry}
                  onValueChange={(v) => update({ subIndustry: v })}
                  disabled={!data.industry}
                >
                  <SelectTrigger className="h-8 w-56 text-sm">
                    <SelectValue placeholder={data.industry ? "请选择细分行业" : "请先选择所属行业"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getSubIndustries(data.industry).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span>{data.subIndustry || <span className="text-muted-foreground">—</span>}</span>
              )
            }
          />
          <Row
            label="非重点细分行业（当企业细分行业是非重点行业时请填写）"
            value={text(data.nonKeySubIndustry || "", "选填", "nonKeySubIndustry")}
          />
          <Row
            label="按照企业主导产业类型填写统计局四位代码（只填写1个代码）"
            value={
              editable ? (
                <Input
                  value={data.statBureauCode}
                  placeholder="如：3831"
                  className="h-8 w-40 font-mono text-sm"
                  onChange={(e) => update({ statBureauCode: e.target.value })}
                />
              ) : (
                <span className="font-mono">
                  {data.statBureauCode || <span className="text-muted-foreground">—</span>}
                </span>
              )
            }
          />
          <Row
            label="单位性质"
            value={
              <div className="flex flex-wrap gap-3 text-xs">
                {UNIT_NATURE_OPTIONS.map((opt) => {
                  const checked = data.unitNature === opt;
                  return (
                    <label
                      key={opt}
                      onClick={() => editable && update({ unitNature: opt })}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        checked ? "text-foreground" : "text-muted-foreground",
                        editable && "cursor-pointer",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                          checked ? "border-primary" : "border-muted-foreground/40",
                        )}
                      >
                        {checked && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </span>
                      {opt}
                    </label>
                  );
                })}
              </div>
            }
          />
          <Row label="申报工作联系部门" value={text(data.contactDept, "如：总师办", "contactDept")} />
          <Row
            label="联系人"
            value={
              editable ? (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={data.contactName}
                    placeholder="联系人姓名"
                    className="h-8 text-sm"
                    onChange={(e) => update({ contactName: e.target.value })}
                  />
                  <Input
                    value={data.contactPhone}
                    placeholder="联系电话"
                    className="h-8 font-mono text-sm"
                    onChange={(e) => update({ contactPhone: e.target.value })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <span>{data.contactName || <span className="text-muted-foreground">—</span>}</span>
                  <span className="text-xs text-muted-foreground">
                    联系电话：
                    <span className="ml-1 font-mono text-foreground">
                      {data.contactPhone || "—"}
                    </span>
                  </span>
                </div>
              )
            }
          />
          <Row
            label="联系邮箱"
            value={
              editable ? (
                <Input
                  value={data.contactEmail}
                  placeholder="example@company.com"
                  className="h-8 font-mono text-sm"
                  onChange={(e) => update({ contactEmail: e.target.value })}
                />
              ) : (
                <span className="font-mono">
                  {data.contactEmail || <span className="text-muted-foreground">—</span>}
                </span>
              )
            }
          />
          <Row
            label="企业工艺情况简介（200字）"
            value={area(data.processIntro, "请简要介绍企业主要工艺情况，不超过200字", 4, "processIntro")}
            multiline
          />
          <Row
            label="企业绿色发展情况简要介绍（500字）"
            value={area(data.greenDevIntro, "请简要介绍企业绿色发展情况，不超过500字", 6, "greenDevIntro")}
            multiline
            last
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  multiline,
  last,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[200px_1fr] md:grid-cols-[280px_1fr]",
        !last && "border-b border-border/60",
      )}
    >
      <div className="border-r border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        {label}
      </div>
      <div className={cn("px-3 py-2.5 text-sm", multiline && "py-3")}>{value}</div>
    </div>
  );
}

export interface BasicRequirementItem {
  no: number;
  requirement: React.ReactNode;
  conform: "是" | "否" | null;
  proofs: string[]; // PDF 文件名列表
  proofRequirement: React.ReactNode;
}

export const MOCK_BASIC_REQUIREMENTS: BasicRequirementItem[] = [
  {
    no: 1,
    requirement: (
      <div className="space-y-1.5 text-sm leading-relaxed">
        <p>工厂应依法设立，近三年无下列情况：</p>
        <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
          <li>未正常经营生产（工商注销、连续停产 12 个月以上、被市场监督管理部门列入经营异常名单且未被移出等）；</li>
          <li>发生安全（含网络安全、数据安全）、质量、环境污染等事故以及偷漏税等违法违规行为；</li>
          <li>被动态调整出绿色制造名单；</li>
          <li>在国务院及有关部委相关督查工作中被发现存在严重问题；</li>
          <li>被列入工业节能监察整改名单且未按要求完成整改；</li>
          <li>企业被列为失信被执行人。</li>
        </ul>
      </div>
    ),
    conform: "是",
    proofs: ["中国执行信息网截图.pdf", "信用中国_上海华普电缆有限公司.pdf", "2021营业执照正本.pdf"],
    proofRequirement: (
      <div className="space-y-1 text-xs leading-relaxed">
        <p>包括但不限于：</p>
        <p>1. 企业营业执照；</p>
        <p>2. 信用中国、国家企业信用信息公示系统无违法违规相关页面截图；</p>
        <p>
          3. 中国执行信息公开网（
          <a
            href="https://zxgk.court.gov.cn"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            https://zxgk.court.gov.cn
          </a>
          ）被执行人信息查询页面截图。
        </p>
      </div>
    ),
  },
  {
    no: 2,
    requirement: (
      <p className="text-sm leading-relaxed">
        工厂应明确绿色制造相关管理层职责，制定绿色低碳发展中长期规划及年度量化目标。
      </p>
    ),
    conform: "是",
    proofs: [
      "绿色采购管理准则.pdf",
      "组织结构图.png",
      "绿色绩效考核方案.pdf",
      "【盖章版】上海华普电缆有限公司绿色发展规划（2025-2027年）-251027.pdf",
    ],
    proofRequirement: (
      <div className="space-y-1 text-xs leading-relaxed">
        <p>包括但不限于：</p>
        <p>1. 绿色工厂管理组织架构及职责分配相关制度文件；</p>
        <p>2. 经批准的工厂绿色低碳发展中长期规划；</p>
        <p>3. 规划中有关评价年的年度目标，评价年的年度目标、指标和实施方案及其达成统计。</p>
      </div>
    ),
  },
  {
    no: 3,
    requirement: (
      <p className="text-sm leading-relaxed">
        工厂按照 GB/T 19001、GB/T 23331、GB/T 24001、GB/T 45001 或相关行业适用的其他标准建立、实施、保持并持续改进质量、环境、能源和职业健康安全管理体系。
      </p>
    ),
    conform: "是",
    proofs: [
      "四体系管理评审资料.pdf",
      "现行体系文件总目录.pdf",
      "QM-01质量管理手册20251110_扫描版.pdf",
      "ESM-01环境和职业健康安全管理手册20250904.pdf",
      "EnMS-01能源管理手册20251016确认.pdf",
    ],
    proofRequirement: (
      <div className="space-y-1 text-xs leading-relaxed">
        <p>包括但不限于：</p>
        <p>1. 管理体系手册；</p>
        <p>2. 体系文件清单；</p>
        <p>3. 评价年体系内审及管理评审报告。</p>
      </div>
    ),
  },
];

export function BasicRequirementsCard({
  data = MOCK_BASIC_REQUIREMENTS,
  editable = false,
  onChange,
}: {
  data?: BasicRequirementItem[];
  editable?: boolean;
  onChange?: (next: BasicRequirementItem[]) => void;
}) {
  const updateItem = (no: number, patch: Partial<BasicRequirementItem>) =>
    onChange?.(data.map((it) => (it.no === no ? { ...it, ...patch } : it)));
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <>
    <Card id="basic-requirements" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <ClipboardCheck className="mr-1 inline h-4 w-4" />二、基本要求
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <div className="grid grid-cols-[48px_1fr_120px_1.1fr_1.1fr] bg-muted/40 text-xs font-medium text-muted-foreground">
            <div className="border-r border-border/60 px-3 py-2 text-center">序号</div>
            <div className="border-r border-border/60 px-3 py-2">基本要求</div>
            <div className="border-r border-border/60 px-3 py-2 text-center">是否符合要求</div>
            <div className="border-r border-border/60 px-3 py-2">证明材料（PDF / 图片）</div>
            <div className="px-3 py-2">证明材料要求</div>
          </div>
          {data.map((item, idx) => (
            <div
              key={item.no}
              className={cn(
                "grid grid-cols-[48px_1fr_120px_1.1fr_1.1fr]",
                idx !== data.length - 1 && "border-b border-border/60",
              )}
            >
              <div className="border-r border-border/60 px-3 py-3 text-center text-sm font-medium">
                {item.no}
              </div>
              <div className="border-r border-border/60 px-3 py-3">{item.requirement}</div>
              <div className="border-r border-border/60 px-3 py-3">
                <div className="flex items-center justify-center gap-3 text-xs">
                  {(["是", "否"] as const).map((opt) => {
                    const checked = item.conform === opt;
                    return (
                      <span
                        key={opt}
                        onClick={() => editable && updateItem(item.no, { conform: opt })}
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          checked ? "text-foreground" : "text-muted-foreground",
                          editable && "cursor-pointer",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                            checked
                              ? opt === "是"
                                ? "border-success"
                                : "border-destructive"
                              : "border-muted-foreground/40",
                          )}
                        >
                          {checked && (
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                opt === "是" ? "bg-success" : "bg-destructive",
                              )}
                            />
                          )}
                        </span>
                        {opt}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="border-r border-border/60 px-3 py-3">
                <ul className="space-y-1.5 text-xs">
                  {item.proofs.map((f) => (
                    <FileItem
                      key={f}
                      name={f}
                      onPreview={setPreview}
                      onRemove={
                        editable
                          ? () => updateItem(item.no, { proofs: item.proofs.filter((x) => x !== f) })
                          : undefined
                      }
                    />
                  ))}
                  {editable && (
                    <li className="pt-1">
                      <UploadButton
                        onPick={(names) =>
                          updateItem(item.no, { proofs: [...item.proofs, ...names] })
                        }
                      />
                    </li>
                  )}
                </ul>
              </div>
              <div className="px-3 py-3">{item.proofRequirement}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <FilePreviewDialog
      fileName={preview}
      open={!!preview}
      onOpenChange={(v) => !v && setPreview(null)}
    />
    </>
  );
}

function isImage(name: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

function isPdf(name: string) {
  return /\.pdf$/i.test(name);
}

function fileExt(name: string) {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : "FILE";
}

/** 示意性"下载"——前端生成一个占位文件触发浏览器下载 */
function triggerMockDownload(name: string) {
  const ext = (name.match(/\.([a-z0-9]+)$/i)?.[1] || "txt").toLowerCase();
  const isImg = /^(png|jpe?g|gif|webp|bmp|svg)$/i.test(ext);
  const blob = isImg
    ? new Blob([
        // 1x1 透明 png 占位
        Uint8Array.from(atob(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        ), (c) => c.charCodeAt(0)),
      ], { type: `image/${ext === "jpg" ? "jpeg" : ext}` })
    : new Blob([
        `这是 ${name} 的示意文件内容\n（演示环境占位，实际平台请下载真实材料）`,
      ], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success(`已下载：${name}`);
}

/** 示意性在线预览弹窗 */
export function FilePreviewDialog({
  fileName,
  open,
  onOpenChange,
}: {
  fileName: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!fileName) return null;
  const img = isImage(fileName);
  const pdf = isPdf(fileName);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {img ? (
              <ImageIcon className="h-4 w-4 text-secondary" />
            ) : (
              <FileText className="h-4 w-4 text-primary" />
            )}
            <span className="truncate">{fileName}</span>
            <Badge variant="outline" className="ml-1 text-[10px]">{fileExt(fileName)}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            在线预览（示意）— 演示环境下展示占位内容，实际平台将渲染真实文件。
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto rounded-md border border-border/60 bg-muted/30 p-4">
          {img ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="flex h-48 w-72 items-center justify-center rounded-md border border-dashed border-border/60 bg-background text-xs text-muted-foreground">
                <ImageIcon className="mr-2 h-5 w-5 opacity-60" />图片预览占位
              </div>
              <p className="text-[11px] text-muted-foreground">{fileName}</p>
            </div>
          ) : pdf ? (
            <div className="space-y-3">
              {[1, 2, 3].map((p) => (
                <div
                  key={p}
                  className="rounded-sm border border-border/60 bg-background p-4 shadow-sm"
                >
                  <div className="mb-3 text-[11px] text-muted-foreground">第 {p} / 3 页</div>
                  <div className="space-y-2">
                    <div className="h-3 w-3/5 rounded bg-muted" />
                    <div className="h-2 w-full rounded bg-muted/70" />
                    <div className="h-2 w-11/12 rounded bg-muted/70" />
                    <div className="h-2 w-10/12 rounded bg-muted/70" />
                    <div className="h-2 w-1/2 rounded bg-muted/70" />
                    <div className="my-3 h-px w-full bg-border/60" />
                    <div className="h-2 w-full rounded bg-muted/70" />
                    <div className="h-2 w-9/12 rounded bg-muted/70" />
                    <div className="h-2 w-8/12 rounded bg-muted/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-muted-foreground">
              该格式暂不支持在线预览，请下载后查看。
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button size="sm" onClick={() => triggerMockDownload(fileName)}>
            <Download className="mr-1 h-3.5 w-3.5" />下载
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 单个文件行（含图标、名称、预览、下载、可选删除） */
function FileItem({
  name,
  onPreview,
  onRemove,
}: {
  name: string;
  onPreview: (n: string) => void;
  onRemove?: () => void;
}) {
  return (
    <li className="group flex items-start gap-1.5">
      {isImage(name) ? (
        <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
      ) : (
        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      )}
      <button
        type="button"
        className="break-all text-left text-primary underline-offset-2 hover:underline"
        onClick={() => onPreview(name)}
      >
        {name}
      </button>
      <div className="ml-auto flex shrink-0 items-center gap-1 opacity-70 group-hover:opacity-100">
        <button
          type="button"
          title="下载"
          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => triggerMockDownload(name)}
        >
          <Download className="h-3 w-3" />
        </button>
        {onRemove && (
          <button
            type="button"
            className="text-[11px] text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            删除
          </button>
        )}
      </div>
    </li>
  );
}


function UploadButton({ onPick }: { onPick: (names: string[]) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-dashed border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/40">
      <Upload className="h-3 w-3" />上传（PDF / 图片）
      <input
        type="file"
        multiple
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onPick(files.map((f) => f.name));
          e.target.value = "";
        }}
      />
    </label>
  );
}

function ProofList({
  proofs,
  editable,
  emptyText = "—",
  onChange,
  onPreview,
}: {
  proofs: string[];
  editable?: boolean;
  emptyText?: string;
  onChange?: (next: string[]) => void;
  onPreview: (n: string) => void;
}) {
  return (
    <ul className="space-y-1 text-xs">
      {proofs.length === 0 && !editable && (
        <li className="text-muted-foreground">{emptyText}</li>
      )}
      {proofs.map((f) => (
        <FileItem
          key={f}
          name={f}
          onPreview={onPreview}
          onRemove={
            editable && onChange ? () => onChange(proofs.filter((x) => x !== f)) : undefined
          }
        />
      ))}
      {editable && (
        <li className="pt-1">
          <UploadButton onPick={(names) => onChange?.([...proofs, ...names])} />
        </li>
      )}
    </ul>
  );
}

const TYPE_TONE: Record<IndicatorRow["type"], string> = {
  正向定量: "border-primary/40 bg-primary/10 text-primary",
  逆向定量: "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  正向定性: "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function EvaluationIndicatorCard({
  data = EVALUATION_INDICATORS,
  totalScore = EVALUATION_TOTAL_SCORE,
  mode = "view",
  showGovRemark = true,
  onChange,
}: {
  data?: IndicatorRow[];
  totalScore?: number;
  mode?: DetailMode;
  showGovRemark?: boolean;
  onChange?: (next: IndicatorRow[]) => void;
} = {}) {
  const entEditable = mode === "ent";
  const govEditable = mode === "gov";
  const valueEditable = entEditable || govEditable;
  const updateRow = (id: string, patch: Partial<IndicatorRow>) =>
    onChange?.(data.map((it) => {
      if (it.id !== id) return it;
      const next: IndicatorRow = { ...it, ...patch };
      if (govEditable) {
        if ("reportValue" in patch && it.originalReportValue === undefined) {
          next.originalReportValue = it.reportValue ?? "";
        }
        if ("products" in patch && it.originalProducts === undefined) {
          next.originalProducts = it.products ? it.products.map((p) => ({ ...p })) : undefined;
        }
        if ("platformFunctions" in patch && it.originalPlatformFunctions === undefined) {
          next.originalPlatformFunctions = it.platformFunctions ? [...it.platformFunctions] : [];
        }
      }
      return next;
    }));
  const totalCols = showGovRemark ? 13 : 12;
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
    <Card id="evaluation-indicator" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span>
            <ListChecks className="mr-1 inline h-4 w-4" />三、评价指标表（通则）
          </span>
          <div className="flex items-center gap-2 text-xs font-normal">
            <span className="text-muted-foreground">
              得分计算：未达基准值 0 分，达到/优于引领值满分，介于二者之间按线性比例
            </span>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              得分 {totalScore.toFixed(2)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border border-border/60">
          <table className={cn("w-full border-collapse text-xs", showGovRemark ? "min-w-[1400px]" : "min-w-[1240px]")}>
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr className="[&>th]:border-r [&>th]:border-border/60 [&>th]:px-2 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium">
                <th className="w-[80px]">一级指标</th>
                <th className="w-[44px] text-center">序号</th>
                <th className="w-[120px]">二级指标</th>
                <th className="min-w-[260px]">三级指标</th>
                <th className="w-[64px] text-center">指标类型</th>
                <th className="w-[90px] text-center">单位</th>
                <th className="w-[72px] text-center">引领值</th>
                <th className="w-[72px] text-center">基准值</th>
                <th className="w-[80px] text-center">加权参数</th>
                <th className="w-[160px]">本年度指标值</th>
                <th className="w-[160px]">证明材料（PDF/图片）</th>
                {showGovRemark && <th className="w-[180px]">审核备注（选填）</th>}
                <th className="min-w-[220px]">证明材料要求</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const last = idx === data.length - 1;
                // ============= 序号 1 / 6 特殊处理：根据 hasStandard 切换填报形态 =============
                if (row.no === 1 || row.no === 6) {
                  const isWater = row.no === 6;
                  const cfg = isWater
                    ? {
                        selectorLabel: "是否有适用工业用水定额国家标准：",
                        hasOptionLabel: "有适用工业用水定额国家标准",
                        noOptionLabel: "无适用工业用水定额国家标准",
                        l3HasText:
                          "单位产品取水量（有适用工业用水定额国家标准时必选，涉及多种产品适用标准时，仅填写取水量排序前三以内的产品）",
                        l3NoText: "单位产值取水量（无适用工业用水定额国家标准时选用）",
                        unitOptions: ["m3/产品单位"],
                        leadPlaceholder: "先进值水平",
                        basePlaceholder: "通用值水平",
                        weightHeader: (
                          <>
                            加权参数
                            <br />
                            （产品取水量 m3）
                          </>
                        ),
                      }
                    : {
                        selectorLabel: "是否有适用国家强制性能源消耗限额标准：",
                        hasOptionLabel: "有适用国家强制性能源消耗限额标准",
                        noOptionLabel: "无适用国家强制性能源消耗限额标准",
                        l3HasText:
                          "单位产品综合能耗（有适用国家强制性能源消耗限额标准时必选，涉及多种产品适用标准时，仅填写综合能耗排序前三以内的产品）",
                        l3NoText: "单位产值综合能耗（无适用国家强制性能源消耗限额标准时选用）",
                        unitOptions: ["tce/产品单位", "kgce/产品单位"],
                        leadPlaceholder: "1级水平",
                        basePlaceholder: "2级水平",
                        weightHeader: (
                          <>
                            加权参数
                            <br />
                            （吨标煤）
                          </>
                        ),
                      };
                  const has = row.hasStandard ?? "无";
                  const products: ProductEnergyEntry[] = row.products?.length === 3
                    ? row.products
                    : [EMPTY_PRODUCT_ENERGY_ENTRY, EMPTY_PRODUCT_ENERGY_ENTRY, EMPTY_PRODUCT_ENERGY_ENTRY];
                  const updateProduct = (i: number, patch: Partial<ProductEnergyEntry>) => {
                    const next = products.map((p, pi) => (pi === i ? { ...p, ...patch } : p));
                    updateRow(row.id, { products: next });
                  };
                  const standardSelector = entEditable ? (
                    <Select
                      value={has}
                      onValueChange={(v) =>
                        updateRow(row.id, {
                          hasStandard: v as "有" | "无",
                          weight: v === "无" ? "8" : row.weight,
                        })
                      }
                    >
                      <SelectTrigger className="h-7 w-40 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="有">{cfg.hasOptionLabel}</SelectItem>
                        <SelectItem value="无">{cfg.noOptionLabel}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                      {has === "有" ? cfg.hasOptionLabel : cfg.noOptionLabel}
                    </Badge>
                  );
                  const formulaText = has === "有" ? (row.formulaHasStandard ?? row.formula) : row.formula;
                  const l3Cell = (
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">{cfg.selectorLabel}</span>
                        {standardSelector}
                      </div>
                      <p className="leading-relaxed">
                        {has === "有" ? cfg.l3HasText : cfg.l3NoText}
                      </p>
                      {formulaText && (
                        <div className="font-mono text-[11px] text-primary/80">公式：{formulaText}</div>
                      )}
                    </div>
                  );
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "align-top [&>td]:border-r [&>td]:border-border/60 [&>td]:px-2 [&>td]:py-2",
                        !last && "border-b border-border/60",
                      )}
                    >
                      {row.showL1 && (
                        <td rowSpan={row.l1RowSpan ?? 1} className="bg-muted/20 text-center font-medium">
                          {row.l1}
                        </td>
                      )}
                      <td className="text-center font-mono">{row.no}</td>
                      {row.showL2 && (
                        <td rowSpan={row.l2RowSpan ?? 1} className="bg-muted/10">
                          {row.l2}
                        </td>
                      )}
                      <td className="leading-relaxed">{l3Cell}</td>
                      <td className="text-center">
                        <span
                          className={cn(
                            "inline-block whitespace-normal break-words rounded-full border px-1.5 py-0.5 text-center text-[10px] leading-tight",
                            TYPE_TONE[row.type],
                          )}
                        >
                          {row.type}
                        </span>
                      </td>
                      {has === "无" ? (
                        <>
                          <td className="text-center">{row.unit}</td>
                          <td className="text-center font-mono">{row.leadValue ?? "/"}</td>
                          <td className="text-center font-mono">{row.baseValue ?? "/"}</td>
                          <td className="text-center font-mono">{row.weight ?? "8"}</td>
                          <td>
                            {valueEditable ? (
                              <div className="space-y-1">
                                <Textarea
                                  value={row.reportValue ?? ""}
                                  rows={2}
                                  className="min-h-[44px] resize-none text-xs"
                                  placeholder="请填写"
                                  onChange={(e) => updateRow(row.id, { reportValue: e.target.value })}
                                />
                                <OriginalHint original={row.originalReportValue} />
                              </div>
                            ) : (
                              <DiffValue current={row.reportValue} original={row.originalReportValue} />
                            )}
                          </td>
                          <td>
                            <ProofList
                              proofs={row.proofs}
                              editable={entEditable}
                              onChange={(next) => updateRow(row.id, { proofs: next })}
                              onPreview={setPreview}
                            />
                          </td>
                        </>
                      ) : (
                        <td colSpan={6} className="!p-0">
                          <table className="w-full border-collapse text-[11px]">
                            <thead className="bg-muted/30 text-[10px] text-muted-foreground">
                              <tr className="[&>th]:border-b [&>th]:border-r [&>th]:border-border/60 [&>th]:px-2 [&>th]:py-1.5 [&>th]:text-center [&>th]:font-medium last:[&>th]:border-r-0">
                                <th className="w-[110px]">产品名称</th>
                                <th className="w-[120px]">单位</th>
                                <th className="w-[80px]">引领值</th>
                                <th className="w-[80px]">基准值</th>
                                <th className="w-[110px]">{cfg.weightHeader}</th>
                                <th className="w-[120px]">本年度指标值</th>
                                <th>证明材料</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((p, pi) => (
                                <tr
                                  key={pi}
                                  className={cn(
                                    "align-top [&>td]:border-r [&>td]:px-2 [&>td]:py-1.5 last:[&>td]:border-r-0",
                                    pi !== products.length - 1 && "border-b border-border/40",
                                  )}
                                >
                                  <td>
                                    {entEditable ? (
                                      <Input
                                        value={p.name}
                                        placeholder={`产品${["一", "二", "三"][pi]}名称`}
                                        className="h-7 text-[11px]"
                                        onChange={(e) => updateProduct(pi, { name: e.target.value })}
                                      />
                                    ) : (
                                      <span>{p.name || <span className="text-muted-foreground">—</span>}</span>
                                    )}
                                  </td>
                                  <td>
                                    {entEditable ? (
                                      <Select
                                        value={p.unit}
                                        onValueChange={(v) => updateProduct(pi, { unit: v })}
                                      >
                                        <SelectTrigger className="h-7 text-[11px]">
                                          <SelectValue placeholder="选择单位" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {cfg.unitOptions.map((u) => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <span className="text-center font-mono">{p.unit || "—"}</span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {entEditable ? (
                                      <Input
                                        value={p.leadValue}
                                        placeholder={cfg.leadPlaceholder}
                                        className="h-7 text-center font-mono text-[11px]"
                                        onChange={(e) => updateProduct(pi, { leadValue: e.target.value })}
                                      />
                                    ) : (
                                      <span className="font-mono">{p.leadValue || "—"}</span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {entEditable ? (
                                      <Input
                                        value={p.baseValue}
                                        placeholder={cfg.basePlaceholder}
                                        className="h-7 text-center font-mono text-[11px]"
                                        onChange={(e) => updateProduct(pi, { baseValue: e.target.value })}
                                      />
                                    ) : (
                                      <span className="font-mono">{p.baseValue || "—"}</span>
                                    )}
                                  </td>
                                  <td className="text-center">
                                    {entEditable ? (
                                      <Input
                                        value={p.weight}
                                        placeholder="吨标煤"
                                        className="h-7 text-center font-mono text-[11px]"
                                        onChange={(e) => updateProduct(pi, { weight: e.target.value })}
                                      />
                                    ) : (
                                      <span className="font-mono">{p.weight || "—"}</span>
                                    )}
                                  </td>
                                  <td>
                                    {valueEditable ? (
                                      <div className="space-y-1">
                                        <Input
                                          value={p.reportValue}
                                          placeholder="请填写"
                                          className="h-7 text-center font-mono text-[11px]"
                                          onChange={(e) => updateProduct(pi, { reportValue: e.target.value })}
                                        />
                                        <OriginalHint original={row.originalProducts?.[pi]?.reportValue} small />
                                      </div>
                                    ) : (
                                      <DiffValue
                                        current={p.reportValue}
                                        original={row.originalProducts?.[pi]?.reportValue}
                                        small
                                      />
                                    )}
                                  </td>
                                  {pi === 0 && (
                                    <td rowSpan={products.length} className="align-top">
                                      <ProofList
                                        proofs={row.proofs}
                                        editable={entEditable}
                                        onChange={(next) => updateRow(row.id, { proofs: next })}
                                        onPreview={setPreview}
                                      />
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      )}
                      {showGovRemark && (
                        <td>
                          {govEditable ? (
                            <Textarea
                              value={row.govRemark ?? ""}
                              rows={2}
                              className="min-h-[44px] resize-none text-xs"
                              placeholder="如指标值有修订，请填写修订备注"
                              onChange={(e) => updateRow(row.id, { govRemark: e.target.value })}
                            />
                          ) : row.govRemark ? (
                            <span className="text-[12px] leading-relaxed">{row.govRemark}</span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">如指标值有修订，请填写修订备注</span>
                          )}
                        </td>
                      )}
                      <td className="leading-relaxed text-muted-foreground">{row.proofRequirement}</td>
                    </tr>
                  );
                }
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "align-top [&>td]:border-r [&>td]:border-border/60 [&>td]:px-2",
                      row.isSubRow ? "[&>td]:py-1" : "[&>td]:py-2",
                      !last && "border-b border-border/60",
                    )}
                  >
                    {row.showL1 && (
                      <td
                        rowSpan={row.l1RowSpan ?? 1}
                        className="bg-muted/20 text-center font-medium"
                      >
                        {row.l1}
                      </td>
                    )}
                    {(row.showNo ?? true) && (
                      <td rowSpan={row.noRowSpan ?? 1} className="text-center font-mono">
                        {row.no}
                      </td>
                    )}
                    {row.mergeL2L3 ? (
                      <td colSpan={2} className="bg-muted/10 leading-relaxed">
                        <div>{row.l3}</div>
                        {row.formula && (
                          <div className="mt-1 font-mono text-[11px] text-primary/80">公式：{row.formula}</div>
                        )}
                      </td>
                    ) : (
                      <>
                        {row.showL2 && (
                          <td rowSpan={row.l2RowSpan ?? 1} className="bg-muted/10">
                            {row.l2}
                          </td>
                        )}
                        <td className="leading-relaxed">
                          <div>{row.l3}</div>
                          {row.formula && (
                            <div className="mt-1 font-mono text-[11px] text-primary/80">公式：{row.formula}</div>
                          )}
                        </td>
                      </>
                    )}
                    <td className="text-center">
                      <span
                        className={cn(
                          "inline-block whitespace-normal break-words rounded-full border px-1.5 py-0.5 text-center text-[10px] leading-tight",
                          TYPE_TONE[row.type],
                        )}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="text-center">{row.unit}</td>
                    <td className="text-center font-mono">{row.leadValue ?? "/"}</td>
                    <td className="text-center font-mono">{row.baseValue ?? "/"}</td>
                    {(row.showWeight ?? true) && (
                      <td rowSpan={row.weightRowSpan ?? 1} className="text-center font-mono">
                        {row.weight ?? "/"}
                      </td>
                    )}
                    <td>
                      {row.id === "4" ? (
                        <PlatformFunctionsField
                          value={row.platformFunctions ?? []}
                          editable={entEditable}
                          onChange={(next) => updateRow(row.id, { platformFunctions: next, reportValue: String(next.length) })}
                        />
                      ) : row.reportOptions ? (
                        <ReportRadioField
                          options={row.reportOptions}
                          value={row.reportValue ?? ""}
                          editable={entEditable}
                          onChange={(v) => updateRow(row.id, { reportValue: v })}
                        />
                      ) : entEditable ? (
                        <Textarea
                          value={row.reportValue ?? ""}
                          rows={2}
                          className="min-h-[44px] resize-none text-xs"
                          placeholder="请填写"
                          onChange={(e) => updateRow(row.id, { reportValue: e.target.value })}
                        />
                      ) : (
                        <span className="font-mono text-[12px] leading-relaxed">
                          {row.reportValue || <span className="text-muted-foreground">—</span>}
                        </span>
                      )}
                    </td>
                    <td>
                      <ProofList
                        proofs={row.proofs}
                        editable={entEditable}
                        onChange={(next) => updateRow(row.id, { proofs: next })}
                        onPreview={setPreview}
                      />
                    </td>
                    {showGovRemark && (
                      <td>
                        {govEditable ? (
                          <Textarea
                            value={row.govRemark ?? ""}
                            rows={2}
                            className="min-h-[44px] resize-none text-xs"
                            placeholder="如指标值有修订，请填写修订备注，例如：该指标值由 A 修改为 B，理由是……"
                            onChange={(e) => updateRow(row.id, { govRemark: e.target.value })}
                          />
                        ) : row.govRemark ? (
                          <span className="text-[12px] leading-relaxed">{row.govRemark}</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            如指标值有修订，请填写修订备注
                          </span>
                        )}
                      </td>
                    )}
                    {(row.showProofReq ?? true) && (
                      <td rowSpan={row.proofReqRowSpan ?? 1} className="leading-relaxed text-muted-foreground">
                        {row.proofRequirement}
                      </td>
                    )}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/30 font-medium">
                <td colSpan={totalCols - 1} className="px-3 py-2 text-right">
                  得分
                </td>
                <td className="px-3 py-2 font-mono text-primary">{totalScore.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    <FilePreviewDialog
      fileName={preview}
      open={!!preview}
      onOpenChange={(v) => !v && setPreview(null)}
    />
    </>
  );
}

const COMMITMENT_TEMPLATE_URL = "/templates/真实性承诺-自我声明模板.docx";
const COMMITMENT_TEMPLATE_NAME = "真实性承诺-自我声明模板.docx";

export interface AuthenticityCommitmentValue {
  signedFileName?: string;
  uploadedAt?: string; // ISO
}

export function AuthenticityCommitmentCard({
  editable = false,
  value,
  onChange,
  defaultSignedFileName,
}: {
  editable?: boolean;
  value?: AuthenticityCommitmentValue;
  onChange?: (next: AuthenticityCommitmentValue) => void;
  defaultSignedFileName?: string;
} = {}) {
  // 已上传文件（受控或默认 mock）
  const signed: AuthenticityCommitmentValue =
    value ?? (defaultSignedFileName
      ? { signedFileName: defaultSignedFileName, uploadedAt: "2025-09-12T10:20:00Z" }
      : {});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onChange?.({ signedFileName: f.name, uploadedAt: new Date().toISOString() });
  };

  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
    <Card id="authenticity-commitment" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <FileSignature className="mr-1 inline h-4 w-4" />四、真实性承诺
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 步骤说明 */}
        <ol className="space-y-1.5 rounded-md border border-border/60 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
          <li>
            <span className="mr-1 font-medium text-foreground">第一步</span>
            下载《真实性承诺函（自我声明）》模板。
          </li>
          <li>
            <span className="mr-1 font-medium text-foreground">第二步</span>
            由企业法定代表人签字、加盖公司公章。
          </li>
          <li>
            <span className="mr-1 font-medium text-foreground">第三步</span>
            将签章后的文件扫描成 PDF（或 JPG / PNG），上传至本平台。
          </li>
        </ol>

        {/* 模板下载 */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/60 bg-card p-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => setPreview(COMMITMENT_TEMPLATE_NAME)}
                className="block max-w-full truncate text-left text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                {COMMITMENT_TEMPLATE_NAME}
              </button>
              <p className="text-[11px] text-muted-foreground">官方模板 · DOCX</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8" asChild>
            <a href={COMMITMENT_TEMPLATE_URL} download={COMMITMENT_TEMPLATE_NAME}>
              <Download className="mr-1 h-3.5 w-3.5" />下载模板
            </a>
          </Button>
        </div>

        {/* 签章扫描件上传 / 展示 */}
        <div className="rounded-md border border-border/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium">签章扫描件</p>
            {editable && (
              <label className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-[11px] font-medium hover:bg-accent">
                <Upload className="h-3 w-3" />
                {signed.signedFileName ? "重新上传" : "上传扫描件"}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>
            )}
          </div>
          {signed.signedFileName ? (
            <div className="flex items-center gap-3 rounded-md bg-muted/30 p-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success/10 text-success">
                {/\.(jpg|jpeg|png)$/i.test(signed.signedFileName) ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => signed.signedFileName && setPreview(signed.signedFileName)}
                  className="block max-w-full truncate text-left text-sm text-primary underline-offset-2 hover:underline"
                >
                  {signed.signedFileName}
                </button>
                {signed.uploadedAt && (
                  <p className="text-[11px] text-muted-foreground">
                    上传时间：{new Date(signed.uploadedAt).toLocaleString("zh-CN")}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="border-success/40 bg-success/10 text-[10px] text-success">
                已上传
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => signed.signedFileName && triggerMockDownload(signed.signedFileName)}
              >
                <Download className="mr-1 h-3.5 w-3.5" />下载
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
              <Upload className="h-4 w-4" />
              {editable ? "请上传已签字盖章的扫描件（PDF / JPG / PNG）" : "尚未上传签章扫描件"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    <FilePreviewDialog
      fileName={preview}
      open={!!preview}
      onOpenChange={(v) => !v && setPreview(null)}
    />
    </>
  );
}

function PlaceholderBlock({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 bg-muted/20 p-6">
      <Badge variant="outline" className="border-muted-foreground/30 text-[10px] text-muted-foreground">
        待细化
      </Badge>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

export function buildEmptyBasicRequirements(
  source: BasicRequirementItem[] = MOCK_BASIC_REQUIREMENTS,
): BasicRequirementItem[] {
  return source.map((it) => ({ ...it, conform: null, proofs: [] }));
}

export function buildEmptyIndicators(
  source: IndicatorRow[] = EVALUATION_INDICATORS,
): IndicatorRow[] {
  return source.map((it) => ({ ...it, reportValue: "", proofs: [], govRemark: "", platformFunctions: it.id === "4" ? [] : it.platformFunctions }));
}

function PlatformFunctionsField({
  value,
  editable,
  onChange,
}: {
  value: string[];
  editable: boolean;
  onChange: (next: string[]) => void;
}) {
  const toggle = (opt: string, checked: boolean) => {
    const set = new Set(value);
    if (checked) set.add(opt);
    else set.delete(opt);
    onChange(PLATFORM_FUNCTION_OPTIONS.filter((o) => set.has(o)));
  };
  if (!editable) {
    return (
      <div className="space-y-1 text-[12px] leading-relaxed">
        <div className="text-muted-foreground">已勾选 <span className="font-mono text-foreground">{value.length}</span> 项</div>
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <span key={v} className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px]">{v}</span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] text-muted-foreground">已勾选 <span className="font-mono text-foreground">{value.length}</span> 项</div>
      <div className="grid grid-cols-1 gap-1">
        {PLATFORM_FUNCTION_OPTIONS.map((opt) => {
          const checked = value.includes(opt);
          return (
            <label key={opt} className="flex cursor-pointer items-center gap-1.5 text-[12px] leading-tight">
              <Checkbox checked={checked} onCheckedChange={(c) => toggle(opt, !!c)} />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ReportRadioField({
  options,
  value,
  editable,
  onChange,
}: {
  options: string[];
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  if (!editable) {
    return (
      <span className="text-[12px] leading-relaxed">
        {value || <span className="text-muted-foreground">—</span>}
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const checked = value === opt;
        return (
          <label
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "flex cursor-pointer items-start gap-1.5 text-[12px] leading-snug",
              checked ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border",
                checked ? "border-primary" : "border-muted-foreground/40",
              )}
            >
              {checked && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </span>
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

export function DeclarationDetailSections({ mode = "view" }: { mode?: DetailMode } = {}) {
  return (
    <div className="mt-4 space-y-4">
      <EnterpriseBasicInfoCard />
      <BasicRequirementsCard editable={mode === "ent"} />
      <EvaluationIndicatorCard mode={mode} />
      <AuthenticityCommitmentCard />
    </div>
  );
}
