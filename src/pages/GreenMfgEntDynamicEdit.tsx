import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DYNAMIC_FIELD_DEFS,
  MOCK_DYNAMIC,
  dynamicStatusClass,
} from "@/components/green-mfg/data";

export default function GreenMfgEntDynamicEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useMemo(() => MOCK_DYNAMIC.find((r) => r.id === id), [id]);
  const isNew = !existing;

  const initial: Record<string, string> = {};
  DYNAMIC_FIELD_DEFS.forEach((d) => {
    const v = existing?.[d.key] as number | undefined;
    initial[d.key as string] = v != null ? String(v) : "";
  });
  const [values, setValues] = useState(initial);
  const [remark, setRemark] = useState("");

  const update = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const handleSave = () => toast.success("已保存");
  const handleSubmit = () => {
    const missing = DYNAMIC_FIELD_DEFS.filter((d) => !values[d.key as string]?.trim());
    if (missing.length) { toast.error(`请填写：${missing.map((m) => m.label).join("、")}`); return; }
    toast.success("已提交，等待市级生态主管部门审核");
    navigate("/green-mfg/ent/dynamic");
  };

  const year = existing?.year ?? new Date().getFullYear();

  return (
    <AppLayout title="动态管理表填报" subtitle={`${year} 年度 · ${existing?.enterpriseName ?? "本企业"} · 年度更新一次`}>
      <div className="mb-4 flex items-center justify-end gap-3">
        {existing && <Badge variant="outline" className={dynamicStatusClass(existing.status)}>{existing.status}</Badge>}
        <Button variant="ghost" size="sm" onClick={() => navigate("/green-mfg/ent/dynamic")}>
          <ArrowLeft className="mr-1 h-4 w-4" />返回
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" />保存</Button>
        <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={handleSubmit}><Send className="mr-1 h-4 w-4" />提交审核</Button>
      </div>

      {existing?.status === "已驳回" && (
        <Card className="panel mb-4 border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">
            上次填报被驳回，原因：固废综合利用率与绿色产品占比未达基准；请整改后重新提交。
          </CardContent>
        </Card>
      )}

      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{year} 年度核心指标</CardTitle>
          <p className="text-xs text-muted-foreground">所有字段为必填；标注 *基准值 仅作参考。</p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {DYNAMIC_FIELD_DEFS.map((d) => (
            <div key={d.key as string} className="space-y-1.5">
              <Label className="text-xs">
                {d.label} <span className="text-muted-foreground">/ {d.unit}</span>
                {d.baseline != null && <span className="ml-2 text-[10px] text-muted-foreground">基准 {d.baseline}</span>}
              </Label>
              <Input
                type="number"
                value={values[d.key as string]}
                onChange={(e) => update(d.key as string, e.target.value)}
                placeholder={`请输入${d.label}`}
                className="h-8 text-sm"
                disabled={existing?.status === "已审核"}
              />
              {d.hint && <p className="text-[10px] text-muted-foreground">{d.hint}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel mt-4">
        <CardHeader className="pb-3"><CardTitle className="text-base">补充说明</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="如指标同比变化较大，请简要说明原因（设备更新、产能变化、口径调整等）。"
            rows={4}
            disabled={existing?.status === "已审核"}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
