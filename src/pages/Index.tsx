import { Activity, Droplets, Flame, Leaf, TrendingDown, Zap } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CarbonTrendChart } from "@/components/dashboard/CarbonTrendChart";
import { PlantMap } from "@/components/dashboard/PlantMap";
import { AlarmList } from "@/components/dashboard/AlarmList";
import { EnergyMixChart } from "@/components/dashboard/EnergyMixChart";

const Index = () => {
  return (
    <AppLayout title="全景视图看板" subtitle="园区能源全景实时监测与碳排放管控">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard label="实时电耗" value="4,820" unit="kWh" delta={-3.2} icon={Zap} accent="primary" />
        <KpiCard label="天然气" value="1,240" unit="m³" delta={1.8} icon={Flame} accent="warning" />
        <KpiCard label="新水用量" value="620" unit="t" delta={-5.4} icon={Droplets} accent="secondary" />
        <KpiCard label="综合能耗" value="9,860" unit="tce" delta={-2.1} icon={Activity} accent="primary" />
        <KpiCard label="碳排放" value="1,240" unit="tCO₂e" delta={-4.6} icon={Leaf} accent="success" />
        <KpiCard label="单位产值能耗" value="0.082" unit="tce/万元" delta={-7.3} icon={TrendingDown} accent="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <CarbonTrendChart />
        </div>
        <AlarmList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlantMap />
        <EnergyMixChart />
      </div>
    </AppLayout>
  );
};

export default Index;
