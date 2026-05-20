import { useRole } from "@/contexts/RoleContext";
import { GovChatConsole } from "@/components/direct-benefit/GovChatConsole";
import DirectBenefitPoliciesEnt from "./DirectBenefitPoliciesEnt";

export default function DirectBenefitPolicies() {
  const { role } = useRole();
  // 企业侧保留原"我的专属政策"卡片列表（信息聚合更直观）
  if (role === "ent") return <DirectBenefitPoliciesEnt />;
  // 政府侧改造为自然语言对话工作台
  return <GovChatConsole topic="policies" />;
}
