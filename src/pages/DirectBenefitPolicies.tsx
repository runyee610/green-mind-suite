import { useRole } from "@/contexts/RoleContext";
import { GovChatConsole } from "@/components/direct-benefit/GovChatConsole";
import { EntChatConsole } from "@/components/direct-benefit/EntChatConsole";

export default function DirectBenefitPolicies() {
  const { role } = useRole();
  // 企业侧：我的专属政策 → 自然语言对话工作台
  if (role === "ent") return <EntChatConsole topic="my-policies" />;
  // 政府侧：政策图谱对话工作台
  return <GovChatConsole topic="policies" />;
}
