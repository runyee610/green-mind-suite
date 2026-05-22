import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, KeyRound, Leaf, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const tokenValid = useMemo(() => token.startsWith("demo-"), [token]);

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  const rules = {
    len: pwd.length >= 8,
    mix: /[A-Za-z]/.test(pwd) && /\d/.test(pwd),
    match: pwd.length > 0 && pwd === pwd2,
  };
  const valid = rules.len && rules.mix && rules.match;

  const submit = () => {
    if (!valid) return;
    setDone(true);
    toast({ title: "密码已重置", description: "请使用新密码重新登录" });
    setTimeout(() => navigate("/", { replace: true }), 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground inline-flex items-center justify-center shadow-lg">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="mt-3 text-lg font-semibold">能碳一体化平台</div>
          <div className="text-xs text-muted-foreground">账号安全 · 密码重置</div>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardContent className="p-6">
            {!tokenValid ? (
              <div className="text-center py-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive inline-flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="mt-3 text-base font-semibold">链接无效或已过期</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  请返回平台联系管理员重新发送密码重置邮件。
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>
                  返回首页
                </Button>
              </div>
            ) : done ? (
              <div className="text-center py-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 inline-flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="mt-3 text-base font-semibold">密码重置成功</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  正在跳转到登录页面，请使用新密码登录…
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <h1 className="text-base font-semibold">设置新密码</h1>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  您正在为账号 <span className="font-mono text-foreground">{email || "—"}</span> 设置新密码，设置后请使用新密码重新登录。
                </p>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">新密码</Label>
                    <div className="relative">
                      <Input
                        type={show ? "text" : "password"}
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="至少 8 位，需包含字母与数字"
                        className="pr-10 font-mono"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? "隐藏密码" : "显示密码"}
                      >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">确认新密码</Label>
                    <Input
                      type={show ? "text" : "password"}
                      value={pwd2}
                      onChange={(e) => setPwd2(e.target.value)}
                      placeholder="再次输入新密码"
                      className="font-mono"
                    />
                  </div>

                  <ul className="space-y-1 text-[11px]">
                    {[
                      { ok: rules.len, t: "长度不少于 8 位" },
                      { ok: rules.mix, t: "同时包含字母和数字" },
                      { ok: rules.match, t: "两次输入一致" },
                    ].map((r) => (
                      <li
                        key={r.t}
                        className={cn(
                          "flex items-center gap-1.5",
                          r.ok ? "text-emerald-600" : "text-muted-foreground",
                        )}
                      >
                        <CheckCircle2 className={cn("h-3 w-3", r.ok ? "opacity-100" : "opacity-30")} />
                        {r.t}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full" disabled={!valid} onClick={submit}>
                    <ShieldCheck className="h-4 w-4 mr-1.5" />
                    确认重置密码
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} 能碳一体化平台 · 安全链路由平台 HTTPS 保护
        </p>
      </div>
    </div>
  );
}
