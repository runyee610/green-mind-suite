import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, FileSignature } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface AttestationState {
  confirmed: boolean;
  signer: string;
  signedAt: string;
  checks: boolean[];
}

export const ATTESTATION_ITEMS = [
  "所提交的企业信息、指标数据、证明材料真实、完整、有效；",
  "已对各项证明材料进行逐项核对，与系统内填报内容一致；",
  "认可 AI 智能体的辅助打分结果，并以此作为本次自评依据；",
  "如有虚假填报或材料造假，自愿承担相应法律责任，并接受相关部门处理。",
];

interface Props {
  mode?: "ent" | "gov";
  initial?: AttestationState | null;
  onConfirmedChange?: (s: AttestationState) => void;
  /** 政府侧只读时的默认值 */
  defaultSigner?: string;
  defaultSignedAt?: string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

export function DataAttestationPanel({
  mode = "ent",
  initial,
  onConfirmedChange,
  defaultSigner = "张明（法定代表人）",
  defaultSignedAt,
}: Props) {
  const readonly = mode === "gov";
  const [checks, setChecks] = useState<boolean[]>(
    initial?.checks ?? (readonly ? ATTESTATION_ITEMS.map(() => true) : ATTESTATION_ITEMS.map(() => false)),
  );
  const [signer, setSigner] = useState(initial?.signer ?? (readonly ? defaultSigner : ""));
  const [signedAt, setSignedAt] = useState(
    initial?.signedAt ?? (readonly ? defaultSignedAt ?? todayStr() : todayStr()),
  );
  const [confirmed, setConfirmed] = useState<boolean>(initial?.confirmed ?? readonly);

  const allChecked = checks.every(Boolean);
  const canConfirm = allChecked && signer.trim().length > 0 && signedAt.length > 0;

  useEffect(() => {
    if (readonly) return;
    onConfirmedChange?.({ confirmed, signer, signedAt, checks });
  }, [confirmed, signer, signedAt, checks, readonly, onConfirmedChange]);

  const handleConfirm = () => {
    if (!canConfirm) {
      toast.warning("请先勾选全部承诺并填写签署人");
      return;
    }
    setConfirmed(true);
    toast.success("已完成数据确权");
  };

  const handleRevoke = () => {
    setConfirmed(false);
    toast.info("已撤销确权，可重新勾选");
  };

  return (
    <div className="space-y-3">
      <Card className="panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              数据确权与法律责任承诺
            </span>
            {confirmed ? (
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                {readonly ? "企业已完成数据确权" : "已确权"}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
                {readonly ? "待企业确权" : "未确权"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
            AI 智能体仅对填报内容与证明材料进行<strong className="text-foreground">辅助打分</strong>，
            最终自评结果须由企业进行人工确认。请企业法定代表人或经办人在确认数据与材料真实性后完成确权，
            确权完成后方可提交区级审核。
          </div>

          <ul className="space-y-2">
            {ATTESTATION_ITEMS.map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border border-border/50 bg-background/60 p-3"
              >
                <Checkbox
                  id={`att-${i}`}
                  checked={checks[i]}
                  disabled={readonly || confirmed}
                  onCheckedChange={(v) =>
                    setChecks((prev) => prev.map((c, idx) => (idx === i ? Boolean(v) : c)))
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`att-${i}`}
                  className="cursor-pointer text-sm leading-relaxed text-foreground"
                >
                  <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                  {text}
                </Label>
              </li>
            ))}
          </ul>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">签署人（法定代表人 / 经办人）</Label>
              <Input
                value={signer}
                onChange={(e) => setSigner(e.target.value)}
                placeholder="请输入签署人姓名"
                disabled={readonly || confirmed}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">确权日期</Label>
              <Input
                type="date"
                value={signedAt}
                onChange={(e) => setSignedAt(e.target.value)}
                disabled={readonly || confirmed}
              />
            </div>
          </div>

          {!readonly && (
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-xs text-muted-foreground">
                {confirmed
                  ? "已完成确权，提交审核后将作为本次自评的法定承诺记录归档。"
                  : "请勾选全部承诺并填写签署人后点击「确认承诺」。"}
              </span>
              {confirmed ? (
                <Button variant="outline" size="sm" onClick={handleRevoke}>
                  撤销确权
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <FileSignature className="mr-1 h-4 w-4" />
                  确认承诺
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
