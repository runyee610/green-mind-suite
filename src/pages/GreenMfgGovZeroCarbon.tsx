import { AppLayout } from "@/components/AppLayout";
import { ZeroCarbonPanel } from "./GreenMfgEnt";

export default function GreenMfgGovZeroCarbon() {
  return (
    <AppLayout title="零碳进阶" subtitle="管理已获评绿色工厂企业的零碳进阶申请、过程跟踪与评定">
      <ZeroCarbonPanel mode="gov" />
    </AppLayout>
  );
}
