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
    <div className="relative min-h-screen w-full overflow-hidden bg-sky-50">
      {/* 底层实景，保持清晰，仅做轻微色彩润色 */}
      <img
        src={bgAsset.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "saturate(1.02) brightness(1.03)" }}
      />

      {/* 整体极淡柔光，统一氛围但不发糊 */}
      <div className="pointer-events-none absolute inset-0 bg-white/10" />
      {/* 顶部白色柔化 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 via-white/5 to-transparent" />
      {/* 底部白色过渡，让卡片区更干净 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white/55 via-white/15 to-transparent" />
      {/* 中央品牌柔光 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 55%, hsl(var(--primary) / 0.10), transparent 70%)",
        }}
      />


      {/* 左上品牌 */}
      <div className="absolute top-6 left-8 z-10 flex items-center gap-3">
        <img
          src={logoAsset.url}
          alt="平台 Logo"
          className="h-10 w-10 rounded-xl bg-white p-1 shadow-md ring-1 ring-white/70"
        />
        <div className="leading-tight">
          <div className="text-xl font-semibold tracking-wide text-slate-800">
            AI 能碳数智空间
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-600 mt-1">
            AI+ Trusted Energy-Carbon Smart Data Space
          </div>
        </div>
      </div>

      {/* 居中登录卡片 */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-[420px]">
          <Card
            className="rounded-2xl border border-white/70 bg-white/70 backdrop-blur-2xl"
            style={{
              boxShadow:
                "0 1px 2px rgba(15,23,42,0.06), 0 25px 55px -20px rgba(15,23,42,0.25)",
            }}
          >
            <CardContent className="p-9">
              <div className="text-center mb-7">
                <h1 className="text-xl font-medium tracking-[0.28em] text-slate-800">
                  用户登录
                </h1>
                <div className="mt-3 mx-auto h-[2px] w-8 rounded-full bg-primary/70" />
              </div>

              <div className="space-y-5" onKeyDown={onKeyDown}>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">账号</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="请输入账号"
                      className="pl-9 h-11 bg-white/70 border-slate-200/80 focus-visible:border-primary/60 focus-visible:ring-primary/20"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="pl-9 pr-10 h-11 bg-white/70 border-slate-200/80 focus-visible:border-primary/60 focus-visible:ring-primary/20 font-mono"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-slate-700"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "隐藏密码" : "显示密码"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                    <span>记住我</span>
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

                <Button
                  className="w-full h-11 rounded-xl tracking-widest shadow-md"
                  disabled={submitting}
                  onClick={submit}
                >
                  <LogIn className="h-4 w-4 mr-1.5" />
                  登 录
                </Button>

                <p className="pt-1 text-center text-[11px] text-slate-400">
                  演示账号：<span className="font-mono text-slate-600">admin / admin123</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-4 left-0 right-0 z-10 text-center text-[11px] text-slate-500/90">
        © {new Date().getFullYear()} AI 能碳数智空间 · 安全链路由平台 HTTPS 保护
      </div>
    </div>
  );
}
