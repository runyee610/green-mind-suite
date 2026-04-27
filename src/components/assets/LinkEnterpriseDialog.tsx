import { useMemo, useState } from "react";
import { Building2, Link2, Plus, Search, Unlink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { enterpriseLibrary, type InvestmentProject } from "./assetsData";

export function LinkEnterpriseDialog({ open, onOpenChange, project }: { open: boolean; onOpenChange: (v: boolean) => void; project: InvestmentProject | null }) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const results = useMemo(
    () => enterpriseLibrary.filter((e) => !keyword || e.name.includes(keyword) || e.creditCode.includes(keyword)),
    [keyword],
  );

  const isLinked = project?.linkStatus === "已关联";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Link2 className="h-4 w-4" />关联能碳平台企业</DialogTitle>
          <DialogDescription>
            当前项目：<span className="text-foreground">{project?.name}</span>
            {isLinked && <> · 已关联：<span className="text-foreground">{project?.linkedEnterpriseName}</span></>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入企业名称或统一社会信用代码搜索…" className="pl-9" />
          </div>

          <ScrollArea className="h-72 rounded-md border border-border/60">
            {results.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                <span>未找到匹配企业</span>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { onOpenChange(false); navigate("/enterprise"); }}>
                  <Plus className="h-3.5 w-3.5" />跳转创建企业
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {results.map((e) => (
                  <li
                    key={e.creditCode}
                    onClick={() => setSelected(e.creditCode)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-muted/50",
                      selected === e.creditCode && "bg-primary/10",
                    )}
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground">{e.name}</div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">{e.creditCode}</span>
                        <span>·</span>
                        <span>{e.industry}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2">
          {isLinked && (
            <Button variant="outline" className="mr-auto gap-1 text-destructive hover:text-destructive">
              <Unlink className="h-3.5 w-3.5" />解绑当前关联
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button disabled={!selected} onClick={() => onOpenChange(false)}>确认绑定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
