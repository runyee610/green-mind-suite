import { Leaf } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function GreenMfg() {
  return (
    <PlaceholderPage
      title="绿色制造管理"
      subtitle="绿色工厂 / 绿色产品 / 绿色供应链全要素管理"
      icon={Leaf}
      features={[
        "绿色工厂指标体系",
        "产品全生命周期碳足迹",
        "绿色供应链评估",
        "清洁生产审核",
        "废弃物资源化追踪",
        "绿色制造自评价材料管理",
      ]}
    />
  );
}
