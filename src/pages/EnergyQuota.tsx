import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StandardManagement } from "@/components/energy-quota/StandardManagement";
import { CycleAndDeclaration } from "@/components/energy-quota/CycleAndDeclaration";

export default function EnergyQuota() {
  const { pathname } = useLocation();
  const isDeclaration = pathname.endsWith("/declaration");

  const title = isDeclaration ? "限额申报管理" : "标准库管理";
  const subtitle = isDeclaration
    ? "限额周期 · 企业申报 · 审批流程"
    : "GB / DB 能耗限额标准";

  return (
    <AppLayout title={title} subtitle={subtitle}>
      <section className="min-w-0">
        {isDeclaration ? <CycleAndDeclaration /> : <StandardManagement />}
      </section>
    </AppLayout>
  );
}
