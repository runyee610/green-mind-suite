import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import bgAsset from "@/assets/login-bg.jpg.asset.json";
import logoAsset from "@/assets/platform-logo.png.asset.json";

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
    toast({ title: "登录成功", description: "欢迎回到 AI 能碳数智空间" });
    navigate(from, { replace: true });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgAsset.url})` }}
    >
      {/* 背景遮罩：加强顶部与卡片可读性 */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/25 to-slate-950/70" />

      {/* 左上品牌 */}
      <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
        <img
          src={logoAsset.url}
          alt="平台 Logo"
          className="h-11 w-11 rounded-xl bg-white/95 p-1 shadow-lg"
        />
        <div className="leading-tight">
          <div className="text-2xl font-semibold text-white tracking-wide drop-shadow">
            AI 能碳数智空间
          </div>
          <div className="text-xs text-white/75 mt-0.5">
            政企协同 · 绿色制造评价
          </div>
        </div>
      </div>

      {/* 居中登录卡片 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border-white/40 shadow-2xl bg-background/95 backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-[0.35em] text-foreground">
                  用户登录
                </h1>
                <div className="mt-3 mx-auto h-0.5 w-12 rounded-full bg-primary/70" />
                <p className="mt-4 text-xs text-muted-foreground">
                  演示账号：
                  <span className="font-mono text-foreground"> admin / admin123</span>
                </p>
              </div>

              <div className="space-y-4" onKeyDown={onKeyDown}>
                <div className="space-y-1.5">
                  <Label className="text-xs">账号</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="请输入账号"
                      className="pl-8 h-11"
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
                      className="pl-8 pr-10 h-11 font-mono"
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
                    onClick={() =>
                      toast({ title: "请联系管理员", description: "如需重置密码，请联系平台管理员" })
                    }
                  >
                    忘记密码？
                  </button>
                </div>

                <Button className="w-full h-11 text-sm tracking-widest" disabled={submitting} onClick={submit}>
                  <LogIn className="h-4 w-4 mr-1.5" />
                  登 录
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-4 left-0 right-0 z-10 text-center text-[11px] text-white/70">
        © {new Date().getFullYear()} AI 能碳数智空间 · 安全链路由平台 HTTPS 保护
      </div>
    </div>
  );
}
