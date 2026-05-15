import { AppLayout } from "@/components/AppLayout";
import { MOCK_DECLARATIONS } from "@/components/green-mfg/data";
import { ZeroCarbonPanel } from "./GreenMfgEnt";

export default function GreenMfgEntZeroCarbon() {
  const myDeclaration = MOCK_DECLARATIONS[0];
  const isGreenFactory = myDeclaration.stage === "绿色工厂";
  return (
    <AppLayout title="零碳进阶" subtitle="已评为市级/国家级绿色工厂的企业，可在此申请向「零碳工厂」进阶">
      <ZeroCarbonPanel mode="ent" eligible={isGreenFactory} />
    </AppLayout>
  );
}
