import { useMemo, useState } from "react";
import {
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCircle2,
  UsersRound,
  Link2,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  INITIAL_ORG_FOREST,
  LEVEL_BADGE_CLASS,
  LEVEL_LABEL,
  OrgNode,
  flattenForest,
  INITIAL_ACCOUNTS,
  INITIAL_MEMBERSHIPS,
  ROLE_META,
  type RoleId,
  type Account,
  type Membership,
} from "@/components/system/orgTreeData";

// ===== mock 数据 =====
const ORGS = flattenForest(INITIAL_ORG_FOREST);
const orgById = (id: string) => ORGS.find((o) => o.id === id);

// ===== 主页面 =====
export default function SystemAccounts() {
  const [tab, setTab] = useState<"accounts" | "memberships">("accounts");
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [memberships, setMemberships] = useState<Membership[]>(INITIAL_MEMBERSHIPS);

  // —— 账号筛选
  const [aKeyword, setAKeyword] = useState("");
  const [aOrg, setAOrg] = useState<string>("all");

  // —— 身份筛选
  const [mKeyword, setMKeyword] = useState("");
  const [mOrg, setMOrg] = useState<string>("all");
  const [mRole, setMRole] = useState<string>("all");

  // 对话框
  const [accountDlg, setAccountDlg] = useState<{ open: boolean; editing: Account | null }>({ open: false, editing: null });
  const [membershipDlg, setMembershipDlg] = useState<{ open: boolean; editing: Membership | null }>({ open: false, editing: null });
  const [pwdDlg, setPwdDlg] = useState<{ open: boolean; target: string }>({ open: false, target: "" });

  // —— 表单态
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fUid, setFUid] = useState("");
  const [fStatus, setFStatus] = useState<"启用" | "停用">("启用");

  const [fmAccount, setFmAccount] = useState("");
  const [fmOrg, setFmOrg] = useState("");
  const [fmRole, setFmRole] = useState<RoleId>("user");

  // —— 批量
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDlg, setBulkDlg] = useState<{ open: boolean; mode: "add" | "update" }>({ open: false, mode: "add" });
  const [bulkOrg, setBulkOrg] = useState<string>("");
  const [bulkRole, setBulkRole] = useState<RoleId>("user");

  // ===== 衍生 =====
  const accountById = (id: string) => accounts.find((a) => a.id === id);
  const membershipCountByAccount = useMemo(() => {
    const m: Record<string, number> = {};
    memberships.forEach((mb) => (m[mb.accountId] = (m[mb.accountId] ?? 0) + 1));
    return m;
  }, [memberships]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      if (aOrg !== "all") {
        const hasOrg = memberships.some((m) => m.accountId === a.id && m.orgId === aOrg);
        if (!hasOrg) return false;
      }
      const q = aKeyword.trim().toLowerCase();
      if (!q) return true;
      return [a.name, a.phone, a.uid].some((s) => s.toLowerCase().includes(q));
    });
  }, [accounts, aKeyword, aOrg, memberships]);

  const filteredMemberships = useMemo(() => {
    return memberships.filter((m) => {
      if (mOrg !== "all" && m.orgId !== mOrg) return false;
      if (mRole !== "all" && m.role !== mRole) return false;
      const q = mKeyword.trim().toLowerCase();
      if (!q) return true;
      const acc = accountById(m.accountId);
      const org = orgById(m.orgId);
      return [acc?.name, acc?.phone, acc?.uid, org?.name]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q));
    });
  }, [memberships, mOrg, mRole, mKeyword, accounts]);

  // ===== 账号 CRUD =====
  const openCreateAccount = () => {
    setFName(""); setFPhone(""); setFUid(`U${10000 + accounts.length + 1}`); setFStatus("启用");
    setAccountDlg({ open: true, editing: null });
  };
  const openEditAccount = (a: Account) => {
    setFName(a.name); setFPhone(a.phone); setFUid(a.uid); setFStatus(a.status);
    setAccountDlg({ open: true, editing: a });
  };
  const submitAccount = () => {
    if (!fName.trim()) return toast({ title: "姓名不能为空", variant: "destructive" });
    if (!/^1[3-9]\d{9}$/.test(fPhone)) return toast({ title: "手机号格式不正确", variant: "destructive" });
    if (accountDlg.editing) {
      setAccounts((arr) => arr.map((x) => x.id === accountDlg.editing!.id
        ? { ...x, name: fName.trim(), phone: fPhone, uid: fUid, status: fStatus } : x));
      toast({ title: "已更新账号" });
    } else {
      const id = `A${String(accounts.length + 1).padStart(3, "0")}`;
      setAccounts((arr) => [...arr, { id, name: fName.trim(), phone: fPhone, uid: fUid, status: fStatus, createdAt: new Date().toISOString().slice(0, 10) }]);
      toast({ title: "已新增账号", description: `默认密码已通过短信发送至 ${fPhone}` });
    }
    setAccountDlg({ open: false, editing: null });
  };
  const deleteAccount = (a: Account) => {
    const cnt = membershipCountByAccount[a.id] ?? 0;
    if (cnt > 0) return toast({ title: "无法删除", description: `该账号仍绑定 ${cnt} 个组织身份，请先解绑`, variant: "destructive" });
    if (!window.confirm(`确认删除账号「${a.name}」？`)) return;
    setAccounts((arr) => arr.filter((x) => x.id !== a.id));
    toast({ title: "已删除账号" });
  };

  // ===== 身份 CRUD =====
  const openCreateMembership = (accountId?: string) => {
    setFmAccount(accountId ?? accounts[0]?.id ?? "");
    setFmOrg(ORGS[0]?.id ?? "");
    setFmRole("user");
    setMembershipDlg({ open: true, editing: null });
  };
  const openEditMembership = (m: Membership) => {
    setFmAccount(m.accountId); setFmOrg(m.orgId); setFmRole(m.role);
    setMembershipDlg({ open: true, editing: m });
  };
  const submitMembership = () => {
    if (!fmAccount || !fmOrg) return toast({ title: "请选择账号和组织", variant: "destructive" });
    // 唯一管理员校验
    if (fmRole === "admin") {
      const exists = memberships.find((m) =>
        m.orgId === fmOrg && m.role === "admin" && m.id !== membershipDlg.editing?.id);
      if (exists) {
        const occ = accountById(exists.accountId);
        return toast({
          title: "该组织已有管理员",
          description: `「${orgById(fmOrg)?.name}」管理员为 ${occ?.name}，每个组织仅允许一名管理员。`,
          variant: "destructive",
        });
      }
    }
    // 重复身份校验（同账号同组织）
    const dup = memberships.find((m) =>
      m.accountId === fmAccount && m.orgId === fmOrg && m.id !== membershipDlg.editing?.id);
    if (dup) return toast({ title: "该账号在此组织已有身份", variant: "destructive" });

    if (membershipDlg.editing) {
      setMemberships((arr) => arr.map((x) => x.id === membershipDlg.editing!.id
        ? { ...x, accountId: fmAccount, orgId: fmOrg, role: fmRole } : x));
      toast({ title: "已更新身份" });
    } else {
      const id = `M${String(memberships.length + 1).padStart(3, "0")}`;
      setMemberships((arr) => [...arr, { id, accountId: fmAccount, orgId: fmOrg, role: fmRole }]);
      toast({ title: "已新增身份" });
    }
    setMembershipDlg({ open: false, editing: null });
  };
  const deleteMembership = (m: Membership) => {
    if (!window.confirm(`确认解除「${accountById(m.accountId)?.name}」在「${orgById(m.orgId)?.name}」的${ROLE_META[m.role].label}身份？`)) return;
    setMemberships((arr) => arr.filter((x) => x.id !== m.id));
    toast({ title: "已解除身份" });
  };

  // ===== 批量身份 =====
  const openBulk = (mode: "add" | "update") => {
    if (selected.size === 0) return toast({ title: "请先选择账号", variant: "destructive" });
    setBulkOrg(ORGS[0]?.id ?? "");
    setBulkRole("user");
    setBulkDlg({ open: true, mode });
  };
  const submitBulk = () => {
    if (!bulkOrg) return toast({ title: "请选择组织", variant: "destructive" });
    const ids = Array.from(selected);
    const mode = bulkDlg.mode;

    if (bulkRole === "admin") {
      if (ids.length > 1) return toast({ title: "管理员唯一", description: "每个组织只能有一名管理员，请单独操作", variant: "destructive" });
      const existing = memberships.find((m) => m.orgId === bulkOrg && m.role === "admin" && !ids.includes(m.accountId));
      if (existing) {
        const occ = accountById(existing.accountId);
        return toast({ title: "该组织已有管理员", description: `当前管理员为 ${occ?.name}`, variant: "destructive" });
      }
    }

    let added = 0, updated = 0, skipped = 0;
    let next = [...memberships];
    let counter = next.length;
    ids.forEach((accId) => {
      const idx = next.findIndex((m) => m.accountId === accId && m.orgId === bulkOrg);
      if (mode === "add") {
        if (idx >= 0) { skipped++; return; }
        counter++;
        next.push({ id: `M${String(counter).padStart(3, "0")}`, accountId: accId, orgId: bulkOrg, role: bulkRole });
        added++;
      } else {
        if (idx < 0) { skipped++; return; }
        if (next[idx].role === bulkRole) { skipped++; return; }
        next[idx] = { ...next[idx], role: bulkRole };
        updated++;
      }
    });
    setMemberships(next);
    setBulkDlg({ open: false, mode });
    setSelected(new Set());
    toast({
      title: mode === "add" ? "批量新增完成" : "批量修改完成",
      description: `${mode === "add" ? `新增 ${added}` : `更新 ${updated}`}，跳过 ${skipped}`,
    });
  };

  const toggleAllOnPage = (checked: boolean) => {
    if (checked) setSelected(new Set(filteredAccounts.map((a) => a.id)));
    else setSelected(new Set());
  };
  const toggleOne = (id: string, checked: boolean) => {
    setSelected((s) => {
      const n = new Set(s);
      if (checked) n.add(id); else n.delete(id);
      return n;
    });
  };



  // ===== 渲染 =====
  return (
    <AppLayout title="账号管理" subtitle="账号 · 组织身份 · 角色 三者解耦的统一管理">
      {/* 模型说明 */}
      <Card className="mb-4 border-border/60 bg-muted/20">
        <CardContent className="py-3 px-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">自然人账号</span>
            <span className="text-muted-foreground">（手机号 / UID）</span>
          </div>
          <span className="text-muted-foreground">—— 映射绑定 ——</span>
          <div className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium">组织身份</span>
            <span className="text-muted-foreground">（Membership）</span>
          </div>
          <span className="text-muted-foreground">—— 赋予 ——</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium">角色</span>
            <span className="text-muted-foreground">管理员 / 副管理员 / 普通用户</span>
          </div>
          <span className="ml-auto text-muted-foreground">一个自然人可在多个组织中持有不同身份与角色</span>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="accounts">
            <UserCircle2 className="h-3.5 w-3.5 mr-1" />
            账号 <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{accounts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="memberships">
            <UsersRound className="h-3.5 w-3.5 mr-1" />
            组织身份 <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">{memberships.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ===== 账号 ===== */}
        <TabsContent value="accounts" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={aKeyword} onChange={(e) => setAKeyword(e.target.value)}
                    placeholder="搜索姓名 / 手机号 / UID" className="h-8 w-64 pl-8 text-xs" />
                </div>
                <Select value={aOrg} onValueChange={setAOrg}>
                  <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="全部组织" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部组织</SelectItem>
                    {ORGS.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                  {selected.size > 0 && (
                    <>
                      <span className="text-xs text-muted-foreground">已选 <b className="text-foreground">{selected.size}</b></span>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => openBulk("add")}>
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />批量新增组织身份
                      </Button>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => openBulk("update")}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />批量修改组织身份
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelected(new Set())}>清除</Button>
                      <span className="mx-1 h-5 w-px bg-border" />
                    </>
                  )}
                  <Button size="sm" className="h-8" onClick={openCreateAccount}>
                    <Plus className="h-3.5 w-3.5 mr-1" />新增账号
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filteredAccounts.length > 0 && filteredAccounts.every((a) => selected.has(a.id))}
                        onCheckedChange={(v) => toggleAllOnPage(!!v)}
                        aria-label="全选"
                      />
                    </TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>UID</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>组织身份</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((a) => {
                    const mbs = memberships.filter((m) => m.accountId === a.id);
                    return (
                      <TableRow key={a.id} data-state={selected.has(a.id) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(a.id)}
                            onCheckedChange={(v) => toggleOne(a.id, !!v)}
                            aria-label={`选择 ${a.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{a.name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{a.uid}</TableCell>
                        <TableCell className="font-mono text-xs">{a.phone}</TableCell>
                        <TableCell>
                          {mbs.length === 0 ? (
                            <span className="text-xs text-muted-foreground">未绑定</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {mbs.slice(0, 3).map((m) => (
                                <Badge key={m.id} variant="outline" className={cn("text-[10px] font-normal", ROLE_META[m.role].cls)}>
                                  {orgById(m.orgId)?.name} · {ROLE_META[m.role].label}
                                </Badge>
                              ))}
                              {mbs.length > 3 && (
                                <Badge variant="outline" className="text-[10px]">+{mbs.length - 3}</Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]",
                            a.status === "启用" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                              : "border-muted-foreground/30 bg-muted/40 text-muted-foreground")}>
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="绑定组织"
                              onClick={() => { setTab("memberships"); openCreateMembership(a.id); }}>
                              <Link2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="重置密码"
                              onClick={() => setPwdDlg({ open: true, target: a.phone })}>
                              <KeyRound className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="编辑"
                              onClick={() => openEditAccount(a)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" title="删除"
                              onClick={() => deleteAccount(a)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== 身份 ===== */}
        <TabsContent value="memberships" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={mKeyword} onChange={(e) => setMKeyword(e.target.value)}
                    placeholder="搜索账号 / 组织" className="h-8 w-56 pl-8 text-xs" />
                </div>
                <Select value={mOrg} onValueChange={setMOrg}>
                  <SelectTrigger className="h-8 w-48 text-xs"><SelectValue placeholder="组织" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部组织</SelectItem>
                    {ORGS.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        [{LEVEL_LABEL[o.level]}] {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={mRole} onValueChange={setMRole}>
                  <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="角色" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部角色</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="deputy">副管理员</SelectItem>
                    <SelectItem value="user">普通用户</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto">
                  <Button size="sm" className="h-8" onClick={() => openCreateMembership()}>
                    <Plus className="h-3.5 w-3.5 mr-1" />新增身份
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>账号</TableHead>
                    <TableHead>所属组织</TableHead>
                    <TableHead>层级</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMemberships.map((m) => {
                    const acc = accountById(m.accountId);
                    const org = orgById(m.orgId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium text-sm">{acc?.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{acc?.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{org?.name}</TableCell>
                        <TableCell>
                          {org && (
                            <Badge variant="outline" className={cn("text-[10px]", LEVEL_BADGE_CLASS[org.level])}>
                              {LEVEL_LABEL[org.level]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-[10px]", ROLE_META[m.role].cls)}>
                            {ROLE_META[m.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditMembership(m)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMembership(m)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* —— 账号对话框 —— */}
      <Dialog open={accountDlg.open} onOpenChange={(o) => setAccountDlg((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{accountDlg.editing ? "编辑账号" : "新增账号"}</DialogTitle>
            <DialogDescription>账号仅记录自然人的基本身份信息，组织与角色在「组织身份」中维护</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-xs">姓名</Label><Input value={fName} onChange={(e) => setFName(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">手机号</Label><Input value={fPhone} onChange={(e) => setFPhone(e.target.value)} className="mt-1 font-mono" /></div>
            <div>
              <Label className="text-xs">UID</Label>
              <Input value={fUid} className="mt-1 font-mono bg-muted/40" readOnly disabled />
              <p className="mt-1 text-[10px] text-muted-foreground">{accountDlg.editing ? "UID 创建后不可修改" : "系统自动生成，保存后生效"}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">状态</Label>
              <Select value={fStatus} onValueChange={(v) => setFStatus(v as "启用" | "停用")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="启用">启用</SelectItem>
                  <SelectItem value="停用">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDlg({ open: false, editing: null })}>取消</Button>
            <Button onClick={submitAccount}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* —— 身份对话框 —— */}
      <Dialog open={membershipDlg.open} onOpenChange={(o) => setMembershipDlg((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{membershipDlg.editing ? "编辑组织身份" : "新增组织身份"}</DialogTitle>
            <DialogDescription>将账号映射到组织并赋予一个角色。每个组织仅允许一名管理员。</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">账号</Label>
              <Select value={fmAccount} onValueChange={setFmAccount}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="选择账号" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} · {a.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">组织</Label>
              <Select value={fmOrg} onValueChange={setFmOrg}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="选择组织" /></SelectTrigger>
                <SelectContent>
                  {ORGS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>[{LEVEL_LABEL[o.level]}] {o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">角色</Label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(Object.keys(ROLE_META) as RoleId[]).map((r) => (
                  <button key={r} type="button" onClick={() => setFmRole(r)}
                    className={cn(
                      "rounded-md border p-2.5 text-left transition-colors",
                      fmRole === r ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                    )}>
                    <Badge variant="outline" className={cn("text-[10px]", ROLE_META[r].cls)}>
                      {ROLE_META[r].label}
                    </Badge>
                    <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{ROLE_META[r].desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembershipDlg({ open: false, editing: null })}>取消</Button>
            <Button onClick={submitMembership}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* —— 批量身份对话框 —— */}
      <Dialog open={bulkDlg.open} onOpenChange={(o) => setBulkDlg((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkDlg.mode === "add" ? "批量新增组织身份" : "批量修改组织身份"}
              <Badge variant="secondary" className="ml-2 text-[10px]">已选 {selected.size}</Badge>
            </DialogTitle>
            <DialogDescription>
              {bulkDlg.mode === "add"
                ? "为所选账号在指定组织下创建身份。若账号在该组织已有身份将自动跳过。"
                : "更新所选账号在指定组织下的角色。账号在该组织无身份则跳过。"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">目标组织</Label>
              <Select value={bulkOrg} onValueChange={setBulkOrg}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="选择组织" /></SelectTrigger>
                <SelectContent>
                  {ORGS.map((o) => (
                    <SelectItem key={o.id} value={o.id}>[{LEVEL_LABEL[o.level]}] {o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">角色</Label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(Object.keys(ROLE_META) as RoleId[]).map((r) => (
                  <button key={r} type="button" onClick={() => setBulkRole(r)}
                    className={cn(
                      "rounded-md border p-2.5 text-left transition-colors",
                      bulkRole === r ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                    )}>
                    <Badge variant="outline" className={cn("text-[10px]", ROLE_META[r].cls)}>
                      {ROLE_META[r].label}
                    </Badge>
                    <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{ROLE_META[r].desc}</div>
                  </button>
                ))}
              </div>
              {bulkRole === "admin" && selected.size > 1 && (
                <p className="mt-2 text-[11px] text-destructive">管理员每组织唯一，无法对多账号批量赋予。</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDlg((s) => ({ ...s, open: false }))}>取消</Button>
            <Button onClick={submitBulk} disabled={bulkRole === "admin" && selected.size > 1}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* —— 重置密码 —— */}
      <Dialog open={pwdDlg.open} onOpenChange={(o) => setPwdDlg((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle><Lock className="mr-2 inline h-4 w-4" />重置密码</DialogTitle>
            <DialogDescription>已向 {pwdDlg.target} 发送随机临时密码，登录后请尽快修改。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { toast({ title: "已发送临时密码" }); setPwdDlg({ open: false, target: "" }); }}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
