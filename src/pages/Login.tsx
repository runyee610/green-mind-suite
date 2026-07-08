import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Leaf, LogIn, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/";

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = () => {
    setSubmitting(true);
    const res = login(account, password);
    setSubmitting(false);
    if (!res.ok) {
      toast({ title: "登录失败", description: res.message ?? "请检查账号密码", variant: "destructive" });
      return;
    }
    toast({ title: "登录成功", description: "欢迎回到 AI 能碳数值空间" });
    navigate(from, { replace: true });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground inline-flex items-center justify-center shadow-lg">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="mt-3 text-lg font-semibold">AI 能碳数值空间</div>
          <div className="text-xs text-muted-foreground">政企协同 · 绿色制造评价</div>
        </div>

        <Card className="border-border/60 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <LogIn className="h-4 w-4 text-primary" />
              <h1 className="text-base font-semibold">账号登录</h1>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              请输入平台账号与密码。演示账号：
              <span className="font-mono text-foreground"> admin / admin123</span>
            </p>

            <div className="space-y-4" onKeyDown={onKeyDown}>
              <div className="space-y-1.5">
                <Label className="text-xs">账号</Label>
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="请输入账号"
                    className="pl-8"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位"
                    className="pl-8 pr-10 font-mono"
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

              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                  <span className="text-muted-foreground">记住我</span>
                </label>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => toast({ title: "请联系管理员", description: "如需重置密码，请联系平台管理员" })}
                >
                  忘记密码？
                </button>
              </div>

              <Button className="w-full" disabled={submitting} onClick={submit}>
                <LogIn className="h-4 w-4 mr-1.5" />
                登录
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} AI 能碳数值空间 · 安全链路由平台 HTTPS 保护
        </p>
      </div>
    </div>
  );
}
