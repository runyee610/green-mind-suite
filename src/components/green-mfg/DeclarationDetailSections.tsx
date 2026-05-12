import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ClipboardCheck, FileSignature, FileText, Image as ImageIcon, ListChecks, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVALUATION_INDICATORS, EVALUATION_TOTAL_SCORE, type IndicatorRow } from "./evaluationIndicators";

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
          <Row label="所属行业" value={text(data.industry, "如：机械行业", "industry")} />
          <Row label="细分行业" value={text(data.subIndustry, "如：电线电缆", "subIndustry")} />
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
}: {
  data?: BasicRequirementItem[];
  editable?: boolean;
}) {
  return (
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
                    <li key={f} className="flex items-start gap-1.5">
                      {/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f) ? (
                        <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                      ) : (
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                      <a
                        href="#"
                        className="break-all text-primary underline-offset-2 hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        {f}
                      </a>
                    </li>
                  ))}
                  {editable && (
                    <li className="pt-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded border border-dashed border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/40"
                      >
                        <Upload className="h-3 w-3" />上传（PDF / 图片）
                      </button>
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
  );
}

function isImage(name: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

function ProofList({
  proofs,
  editable,
  emptyText = "—",
}: {
  proofs: string[];
  editable?: boolean;
  emptyText?: string;
}) {
  return (
    <ul className="space-y-1 text-xs">
      {proofs.length === 0 && !editable && (
        <li className="text-muted-foreground">{emptyText}</li>
      )}
      {proofs.map((f) => (
        <li key={f} className="flex items-start gap-1.5">
          {isImage(f) ? (
            <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
          ) : (
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          )}
          <a
            href="#"
            className="break-all text-primary underline-offset-2 hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            {f}
          </a>
        </li>
      ))}
      {editable && (
        <li className="pt-1">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-dashed border-border/60 px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/40"
          >
            <Upload className="h-3 w-3" />上传（PDF / 图片）
          </button>
        </li>
      )}
    </ul>
  );
}

const TYPE_TONE: Record<IndicatorRow["type"], string> = {
  正向定量: "border-primary/40 bg-primary/10 text-primary",
  逆向定量: "border-warning/40 bg-warning/10 text-warning",
  正向定性: "border-secondary/40 bg-secondary/10 text-secondary",
};

export function EvaluationIndicatorCard({
  data = EVALUATION_INDICATORS,
  totalScore = EVALUATION_TOTAL_SCORE,
  mode = "view",
}: {
  data?: IndicatorRow[];
  totalScore?: number;
  mode?: DetailMode;
} = {}) {
  const entEditable = mode === "ent";
  const govEditable = mode === "gov";

  return (
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
          <table className="w-full min-w-[1400px] border-collapse text-xs">
            <thead className="bg-muted/40 text-[11px] text-muted-foreground">
              <tr className="[&>th]:border-r [&>th]:border-border/60 [&>th]:px-2 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium">
                <th className="w-[80px]">一级指标</th>
                <th className="w-[44px] text-center">序号</th>
                <th className="w-[120px]">二级指标</th>
                <th className="min-w-[260px]">三级指标</th>
                <th className="w-[72px] text-center">指标类型</th>
                <th className="w-[90px] text-center">单位</th>
                <th className="w-[72px] text-center">引领值</th>
                <th className="w-[72px] text-center">基准值</th>
                <th className="w-[80px] text-center">加权参数</th>
                <th className="w-[160px]">本年度指标值</th>
                <th className="w-[160px]">证明材料（PDF/图片）</th>
                <th className="w-[180px]">审核备注（选填）</th>
                <th className="min-w-[220px]">证明材料要求</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const last = idx === data.length - 1;
                return (
                  <tr
                    key={row.no}
                    className={cn(
                      "align-top [&>td]:border-r [&>td]:border-border/60 [&>td]:px-2 [&>td]:py-2",
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
                    <td className="text-center font-mono">{row.no}</td>
                    {row.showL2 && (
                      <td rowSpan={row.l2RowSpan ?? 1} className="bg-muted/10">
                        {row.l2}
                      </td>
                    )}
                    <td className="leading-relaxed">{row.l3}</td>
                    <td className="text-center">
                      <Badge variant="outline" className={cn("h-5 text-[10px]", TYPE_TONE[row.type])}>
                        {row.type}
                      </Badge>
                    </td>
                    <td className="text-center">{row.unit}</td>
                    <td className="text-center font-mono">{row.leadValue ?? "/"}</td>
                    <td className="text-center font-mono">{row.baseValue ?? "/"}</td>
                    <td className="text-center font-mono">{row.weight ?? "/"}</td>
                    <td>
                      {entEditable ? (
                        <Textarea
                          defaultValue={row.reportValue}
                          rows={2}
                          className="min-h-[44px] resize-none text-xs"
                          placeholder="请填写"
                        />
                      ) : (
                        <span className="font-mono text-[12px] leading-relaxed">
                          {row.reportValue || <span className="text-muted-foreground">—</span>}
                        </span>
                      )}
                    </td>
                    <td>
                      <ProofList proofs={row.proofs} editable={entEditable} />
                    </td>
                    <td>
                      {govEditable ? (
                        <Textarea
                          defaultValue={row.govRemark}
                          rows={2}
                          className="min-h-[44px] resize-none text-xs"
                          placeholder="如指标值有修订，请填写修订备注，例如：该指标值由 A 修改为 B，理由是……"
                        />
                      ) : row.govRemark ? (
                        <span className="text-[12px] leading-relaxed">{row.govRemark}</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          如指标值有修订，请填写修订备注
                        </span>
                      )}
                    </td>
                    <td className="leading-relaxed text-muted-foreground">
                      {row.proofRequirement}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/30 font-medium">
                <td colSpan={12} className="px-3 py-2 text-right">
                  得分
                </td>
                <td className="px-3 py-2 font-mono text-primary">{totalScore.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AuthenticityCommitmentCard() {
  return (
    <Card id="authenticity-commitment" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <FileSignature className="mr-1 inline h-4 w-4" />四、真实性承诺
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PlaceholderBlock text="真实性承诺函（企业公章、法定代表人签章、承诺日期等）将在此呈现，待细化字段后补齐。" />
      </CardContent>
    </Card>
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
  return source.map((it) => ({ ...it, reportValue: "", proofs: [], govRemark: "" }));
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
