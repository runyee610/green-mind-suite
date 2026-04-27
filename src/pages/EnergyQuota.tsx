import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StandardManagement } from "@/components/energy-quota/StandardManagement";
import { CycleAndDeclaration } from "@/components/energy-quota/CycleAndDeclaration";

export default function EnergyQuota() {
  const { pathname } = useLocation();
  const isDeclaration = pathname.endsWith("/declaration");

  return (
    <AppLayout hideHeader>
      <section className="min-w-0">
        {isDeclaration ? <CycleAndDeclaration /> : <StandardManagement />}
      </section>
    </AppLayout>
  );
}
