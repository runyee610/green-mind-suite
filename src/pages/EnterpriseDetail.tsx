import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  EnterpriseSelfView,
  enterpriseUsers,
  type EnterpriseUser,
} from "./SystemUsers";

/**
 * 企业详情页
 * 入口：市/区/园区/集团管理员的企业列表中点击企业名称
 * 路径参数 :key 为企业名称（urlencoded）或企业 id
 */
export default function EnterpriseDetail() {
  const { key = "" } = useParams<{ key: string }>();
  const navigate = useNavigate();

  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(key);
    } catch {
      return key;
    }
  }, [key]);

  // 优先按 id 匹配，再按企业名称匹配；找不到则用一条演示数据兜底
  const ent: EnterpriseUser = useMemo(() => {
    const byId = enterpriseUsers.find((e) => e.id === decoded);
    if (byId) return byId;
    const byName = enterpriseUsers.find((e) => e.enterpriseName === decoded);
    if (byName) return byName;
    // 未在演示库中：构造一条占位记录，沿用模板字段
    const fallback: EnterpriseUser = {
      ...enterpriseUsers[0],
      id: `EXT-${decoded.slice(0, 8)}`,
      account: "—",
      enterpriseName: decoded || enterpriseUsers[0].enterpriseName,
    };
    return fallback;
  }, [decoded]);

  return (
    <AppLayout
      title="企业详情"
      subtitle={`查看 ${ent.enterpriseName} 的完整档案信息`}
      headerExtra={
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回
        </Button>
      }
    >
      <EnterpriseSelfView
        self={ent}
        onChangePwd={(acc) =>
          toast({ title: "修改密码", description: `账号：${acc}（演示）` })
        }
      />
    </AppLayout>
  );
}
