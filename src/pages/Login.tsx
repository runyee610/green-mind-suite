import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900">
      {/* 底层实景，清晰铺满 */}
      <img
        src={bgAsset.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 克制的暗化以保证品牌白字与卡片周边可读 */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-900/35 via-transparent to-slate-900/15" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900/45 to-transparent" />

      {/* 左上品牌 */}
      <div className="absolute top-8 left-10 z-10 flex items-center gap-3">
        <img
          src={logoAsset.url}
          alt="平台 Logo"
          className="h-11 w-11 rounded-xl bg-white p-1 shadow-lg ring-1 ring-white/50"
        />
        <div className="leading-tight">
          <div className="text-2xl font-semibold tracking-wide text-white drop-shadow-md">
            AI 能碳数智空间
          </div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/85 mt-1 drop-shadow">
            AI+ Trusted Energy-Carbon Smart Data Space
          </div>
        </div>
      </div>

      {/* 左侧品牌 Slogan（大屏才显示） */}
      <div className="hidden lg:flex absolute left-[6vw] top-1/2 -translate-y-1/2 z-10 flex-col gap-6 max-w-md">
        <div className="flex items-center gap-2 text-xs tracking-[0.35em] text-white/85">
          <span className="inline-block h-3 w-[2px] bg-primary" />
          智能 · 低碳 · 可信
        </div>
        <h2 className="text-4xl font-semibold leading-snug text-white drop-shadow-lg">
          构建 AI+
          <br />
          能碳可信数智空间
        </h2>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
            500 家企业协同
          </span>
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
            750 家链上确权
          </span>
        </div>
      </div>

      {/* 右侧浮动登录卡片 */}
      <div className="absolute z-10 inset-x-4 top-1/2 -translate-y-1/2 flex justify-center lg:inset-x-auto lg:right-[6vw] lg:justify-end">
        <div
          className="relative w-full max-w-[380px] overflow-hidden rounded-3xl border border-white/60 bg-white/85 backdrop-blur-2xl"
          style={{
            boxShadow:
              "0 1px 2px rgba(15,23,42,0.06), 0 30px 80px -20px rgba(15,23,42,0.35)",
          }}
        >
          {/* 顶部主色高光线 */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="p-8">
            <div className="mb-7">
              <h1 className="text-lg font-medium tracking-[0.3em] text-slate-800">
                用户登录
              </h1>
              <div className="mt-3 h-[2px] w-6 rounded-full bg-primary" />
            </div>

            <div className="space-y-6" onKeyDown={onKeyDown}>
              <div className="relative">
                <UserIcon className="absolute left-1 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="账号"
                  className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent pl-7 shadow-none focus-visible:border-primary focus-visible:ring-0 placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-1 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密码"
                  className="h-11 rounded-none border-0 border-b border-slate-200 bg-transparent pl-7 pr-9 shadow-none focus-visible:border-primary focus-visible:ring-0 placeholder:text-slate-400 font-mono"
                />
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-slate-700"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "隐藏密码" : "显示密码"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
                className="w-full h-11 rounded-full tracking-[0.4em] shadow-lg shadow-primary/25"
                disabled={submitting}
                onClick={submit}
              >
                登 录
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-5 left-0 right-0 z-10 text-center text-[11px] text-white/75">
        演示账号 <span className="font-mono text-white/90">admin / admin123</span>
        <span className="mx-3 opacity-40">|</span>
        © {new Date().getFullYear()} AI 能碳数智空间 · 安全链路由平台 HTTPS 保护
      </div>
    </div>
  );
}
