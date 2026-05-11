import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ClipboardCheck, FileSignature, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function EnterpriseBasicInfoCard({
  data = MOCK_ENTERPRISE_BASIC,
}: {
  data?: EnterpriseBasicInfo;
}) {
  return (
    <Card id="basic-info" className="panel scroll-mt-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <Building2 className="mr-1 inline h-4 w-4" />一、企业基本信息表
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border/60">
          <Row label="工厂名称" value={data.factoryName} />
          <Row label="通讯地址" value={data.address} />
          <Row label="所属行业" value={data.industry} />
          <Row label="细分行业" value={data.subIndustry} />
          <Row
            label="非重点细分行业（当企业细分行业是非重点行业时请填写）"
            value={
              <span className="text-muted-foreground">
                {data.nonKeySubIndustry || "—"}
              </span>
            }
          />
          <Row
            label="按照企业主导产业类型填写统计局四位代码（只填写1个代码）"
            value={<span className="font-mono">{data.statBureauCode}</span>}
          />
          <Row
            label="单位性质"
            value={
              <div className="flex flex-wrap gap-3 text-xs">
                {UNIT_NATURE_OPTIONS.map((opt) => {
                  const checked = data.unitNature === opt;
                  return (
                    <span
                      key={opt}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        checked ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                          checked
                            ? "border-primary"
                            : "border-muted-foreground/40",
                        )}
                      >
                        {checked && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </span>
                      {opt}
                    </span>
                  );
                })}
              </div>
            }
          />
          <Row label="申报工作联系部门" value={data.contactDept} />
          <Row
            label="联系人"
            value={
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span>{data.contactName}</span>
                <span className="text-xs text-muted-foreground">
                  联系电话：
                  <span className="ml-1 font-mono text-foreground">
                    {data.contactPhone}
                  </span>
                </span>
              </div>
            }
          />
          <Row label="联系邮箱" value={<span className="font-mono">{data.contactEmail}</span>} />
          <Row
            label="企业工艺情况简介（200字）"
            value={
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {data.processIntro}
              </p>
            }
            multiline
          />
          <Row
            label="企业绿色发展情况简要介绍（500字）"
            value={
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {data.greenDevIntro}
              </p>
            }
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

export function BasicRequirementsCard() {
  return (
    <Card className="panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <ClipboardCheck className="mr-1 inline h-4 w-4" />二、基本要求
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PlaceholderBlock text="基本要求内容（合规性声明、否决项清单等）将在此呈现，待细化字段后补齐。" />
      </CardContent>
    </Card>
  );
}

export function EvaluationIndicatorCard() {
  return (
    <Card className="panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <ListChecks className="mr-1 inline h-4 w-4" />三、评价指标表（通则）
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PlaceholderBlock text="评价指标（基础设施、管理体系、能源资源投入、产品、环境排放、绩效等维度）将在此呈现，待细化字段后补齐。" />
      </CardContent>
    </Card>
  );
}

export function AuthenticityCommitmentCard() {
  return (
    <Card className="panel">
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

export function DeclarationDetailSections() {
  return (
    <div className="mt-4 space-y-4">
      <EnterpriseBasicInfoCard />
      <BasicRequirementsCard />
      <EvaluationIndicatorCard />
      <AuthenticityCommitmentCard />
    </div>
  );
}
