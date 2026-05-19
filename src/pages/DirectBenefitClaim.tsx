import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2, XCircle, Sparkles, FileSearch, Building2, Wallet, ShieldCheck, Send,
  ArrowLeft, AlertTriangle, Coins,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  findMatch, findPolicy, findEnterprise,
} from "@/components/direct-benefit/directBenefitData";
import { cn } from "@/lib/utils";

export default function DirectBenefitClaim() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const match = id ? findMatch(id) : null;
  const pol = match ? findPolicy(match.policyId) : null;
  const ent = match ? findEnterprise(match.enterpriseId) : null;

  const [confirmInfo, setConfirmInfo] = useState(false);
  const [confirmBank, setConfirmBank] = useState(false);
  const [confirmAuth, setConfirmAuth] = useState(false);

  if (!match || !pol || !ent) {
    return (
      <AppLayout hideHeader>
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          未找到该匹配记录
        </div>
      </AppLayout>
    );
  }

  const allHit = match.hits.every((h) => h.hit);
  const canSubmit = confirmInfo && confirmBank && confirmAuth;

  return (
    <AppLayout hideHeader>
      <div className="mx-auto max-w-4xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>

        {/* 顶部摘要 */}
        <div className="overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="border-primary/40 bg-background text-[10px] text-primary">
                <Sparkles className="mr-1 h-2.5 w-2.5" />智能体推荐
              </Badge>
              <h1 className="mt-2 text-lg font-semibold text-foreground">{pol.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">{pol.docNo} · {pol.issuer} · 截止 {pol.deadline}</p>
              <p className="mt-2 text-xs leading-relaxed text-foreground">{match.rationale}</p>
            </div>
            <div className="shrink-0 rounded-lg border border-warning/30 bg-background px-4 py-3 text-center">
              <div className="text-[10px] text-muted-foreground">预计补贴</div>
              <div className="mt-1 font-mono text-2xl font-bold text-warning">{match.estimatedFunding}</div>
              <div className="text-[10px] text-muted-foreground">万元</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px]">
            <span className="text-muted-foreground">智能体置信度</span>
            <Progress value={match.confidence * 100} className="h-1 w-32" />
            <span className="font-mono text-foreground">{(match.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* A 段：条件命中清单 */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">A. 条件命中清单</h3>
              <Badge variant="outline" className={cn(
                "text-[10px]",
                allHit ? "border-success/40 bg-success/10 text-success" : "border-warning/40 bg-warning/10 text-warning",
              )}>
                {match.hits.filter((h) => h.hit).length}/{match.hits.length} 命中
              </Badge>
            </div>
            <ul className="space-y-2">
              {match.hits.map((h) => {
                const c = pol.conditions.find((x) => x.key === h.conditionKey);
                return (
                  <li key={h.conditionKey} className="flex items-start gap-2.5 rounded-md border border-border bg-muted/20 p-2.5">
                    {h.hit ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-foreground">{c?.text}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5"><FileSearch className="h-2.5 w-2.5" />{h.evidence}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* B 段：企业基础信息核对 */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                <Building2 className="mr-1 inline h-3.5 w-3.5" />B. 企业基础信息核对
              </h3>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">申请修正</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoField label="企业名称" value={ent.name} source="企业基础档案" />
              <InfoField label="统一社会信用代码" value={ent.creditCode} source="企业基础档案" mono />
              <InfoField label="所属行政区" value={ent.district} source="企业基础档案" />
              <InfoField label="所属行业" value={ent.industry} source="企业基础档案" />
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
              <Checkbox checked={confirmInfo} onCheckedChange={(v) => setConfirmInfo(!!v)} />
              我已核对以上信息无误
            </label>
          </CardContent>
        </Card>

        {/* C 段：收款账户确认 */}
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                <Wallet className="mr-1 inline h-3.5 w-3.5" />C. 收款对公账户
              </h3>
              {ent.bank.verified ? (
                <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-[10px]">
                  <ShieldCheck className="mr-1 h-2.5 w-2.5" />已实名核验
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning text-[10px]">
                  待核验
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground">开户行</Label>
                <Input value={ent.bank.name} readOnly className="mt-1 h-9 bg-muted/30 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">银行账号</Label>
                <Input value={ent.bank.account} readOnly className="mt-1 h-9 bg-muted/30 font-mono text-xs" />
              </div>
            </div>
            <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
              <Checkbox checked={confirmBank} onCheckedChange={(v) => setConfirmBank(!!v)} />
              我确认资金将拨付至以上对公账户
            </label>
          </CardContent>
        </Card>

        {/* 法人意愿 */}
        <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
          <div className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="space-y-2">
              <p>
                免审即享流程中，<span className="font-semibold">企业无需提交申报书</span>，主管部门以本平台留存的数据为审核依据。
                提交即视为企业法人同意智能体使用上述画像数据用于本次资金核拨。
              </p>
              <label className="flex items-center gap-2">
                <Checkbox checked={confirmAuth} onCheckedChange={(v) => setConfirmAuth(!!v)} />
                <span>法人代表已知悉并同意</span>
              </label>
            </div>
          </div>
        </div>

        {/* 提交 */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">
            <Coins className="mr-1 inline h-3.5 w-3.5 text-warning" />
            预计 <span className="font-mono font-semibold text-foreground">{match.estimatedFunding}</span> 万元，
            财政平均拨付时长 <span className="font-mono">3</span> 个工作日
          </div>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              toast.success("申领已提交，等待财政直达拨付");
              setTimeout(() => navigate("/direct-benefit/ent/funds"), 800);
            }}
          >
            <Send className="mr-1 h-4 w-4" />提交申领
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function InfoField({ label, value, source, mono }: { label: string; value: string; source: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] text-muted-foreground">{label}</div>
          <div className={cn("mt-0.5 text-xs font-medium text-foreground truncate", mono && "font-mono")}>{value}</div>
        </div>
        <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/5 text-[10px] text-primary">
          <FileSearch className="mr-1 h-2.5 w-2.5" />{source}
        </Badge>
      </div>
    </div>
  );
}
