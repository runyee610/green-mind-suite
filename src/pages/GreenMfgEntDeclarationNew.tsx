import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  EnterpriseBasicInfoCard,
  BasicRequirementsCard,
  EvaluationIndicatorCard,
  AuthenticityCommitmentCard,
  EMPTY_ENTERPRISE_BASIC,
  buildEmptyBasicRequirements,
  buildEmptyIndicators,
} from "@/components/green-mfg/DeclarationDetailSections";
import { toast } from "sonner";

const ANCHORS = [
  { href: "basic-info", label: "企业基本信息表" },
  { href: "basic-requirements", label: "基本要求" },
  { href: "evaluation-indicator", label: "评价指标表（通则）" },
  { href: "authenticity-commitment", label: "真实性承诺" },
];

export default function GreenMfgEntDeclarationNew() {
  const navigate = useNavigate();
  const [enterpriseName, setEnterpriseName] = useState("上海华普电缆有限公司");
  const [creditCode, setCreditCode] = useState("9131011263289475XL");
  const [industry, setIndustry] = useState("机械行业");
  const [batch, setBatch] = useState("2025年第二批");

  const handleSave = () => toast.success("草稿已保存");
  const handleSubmit = () => {
    toast.success("申报已提交，等待区级审核");
    setTimeout(() => navigate("/green-mfg/ent"), 600);
  };

  return (
    <AppLayout
      title="新增绿色工厂申报"
      subtitle={
        <span className="text-xs text-muted-foreground">
          填写企业基本信息、基本要求、评价指标表与真实性承诺，完成后提交区级审核。
        </span>
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent")}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Save className="mr-1 h-4 w-4" />保存草稿
          </Button>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={handleSubmit}>
            <Send className="mr-1 h-4 w-4" />提交申报
          </Button>
        </div>
      </div>

      {/* 锚点导航 */}
      <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-wrap items-center gap-1 rounded-md border border-border/60 bg-background/80 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <span className="px-2 text-[11px] text-muted-foreground">快速跳转：</span>
        {ANCHORS.map((a) => (
          <a
            key={a.href}
            href={`#${a.href}`}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {a.label}
          </a>
        ))}
      </div>

      {/* 申报头信息 */}
      <Card className="panel mb-4">
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="ent-name" className="text-xs text-muted-foreground">企业名称</Label>
            <Input id="ent-name" value={enterpriseName} onChange={(e) => setEnterpriseName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="credit-code" className="text-xs text-muted-foreground">统一社会信用代码</Label>
            <Input id="credit-code" className="font-mono" value={creditCode} onChange={(e) => setCreditCode(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry" className="text-xs text-muted-foreground">所属行业</Label>
            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">申报批次</Label>
            <Select value={batch} onValueChange={setBatch}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025年第一批">2025年第一批</SelectItem>
                <SelectItem value="2025年第二批">2025年第二批</SelectItem>
                <SelectItem value="2026年第一批">2026年第一批</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 申报书四部分（编辑模式） */}
      <div className="space-y-4">
        <EnterpriseBasicInfoCard />
        <BasicRequirementsCard editable />
        <EvaluationIndicatorCard mode="ent" />
        <AuthenticityCommitmentCard />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" />保存草稿
        </Button>
        <Button className="bg-gradient-primary text-primary-foreground" onClick={handleSubmit}>
          <Send className="mr-1 h-4 w-4" />提交申报
        </Button>
      </div>
    </AppLayout>
  );
}
