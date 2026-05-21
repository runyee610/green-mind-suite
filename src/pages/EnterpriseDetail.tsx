import { useParams, Link } from "react-router-dom";
import { Building2, ArrowLeft, Info } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INITIAL_ENTERPRISES, INITIAL_GROUPS, flattenForest, INITIAL_ORG_FOREST } from "@/components/system/orgTreeData";

export default function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  const ent = INITIAL_ENTERPRISES.find((e) => e.id === id);
  const org = ent?.orgId ? flattenForest(INITIAL_ORG_FOREST).find((n) => n.id === ent.orgId) : undefined;
  const group = ent?.groupId ? INITIAL_GROUPS.find((g) => g.id === ent.groupId) : undefined;

  return (
    <AppLayout title="企业详情" subtitle="企业管理模块（页面示意）">
      <div className="mb-4">
        <Button asChild size="sm" variant="ghost" className="h-8">
          <Link to="/system/org-structure"><ArrowLeft className="h-3.5 w-3.5 mr-1" />返回组织架构</Link>
        </Button>
      </div>

      {!ent ? (
        <Card className="border-border/60"><CardContent className="p-8 text-center text-sm text-muted-foreground">未找到企业 {id}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-12 lg:col-span-8 border-border/60">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
                  <Building2 className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-semibold">{ent.name}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{ent.creditCode}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {org && <Badge variant="outline" className="text-[10px]">{org.name}</Badge>}
                    {group && <Badge variant="outline" className="text-[10px] border-primary/40 bg-primary/10 text-primary">{group.name}</Badge>}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-xs text-muted-foreground">联系人</div><div className="mt-1 font-medium">{ent.contact}</div></div>
                <div><div className="text-xs text-muted-foreground">联系电话</div><div className="mt-1 font-mono">{ent.phone}</div></div>
                <div><div className="text-xs text-muted-foreground">对口人(政府侧)</div><div className="mt-1 font-medium">{ent.liaison}</div></div>
                <div><div className="text-xs text-muted-foreground">所属行业</div><div className="mt-1">{group?.industry ?? "—"}</div></div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-12 lg:col-span-4 border-dashed border-border/60 bg-muted/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Info className="h-4 w-4 text-primary" />企业管理模块
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                这里将展示企业的能源、碳排、申报、资产等完整信息。<br />
                企业管理功能由独立模块承载，此处仅为入口示意。
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
