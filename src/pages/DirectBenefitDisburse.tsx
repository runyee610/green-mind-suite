import { useRole } from "@/contexts/RoleContext";
import { GovChatConsole } from "@/components/direct-benefit/GovChatConsole";
import { EntChatConsole } from "@/components/direct-benefit/EntChatConsole";

export default function DirectBenefitDisburse() {
  const { role } = useRole();
  if (role === "gov") return <GovChatConsole topic="disburse" />;
  return <EntChatConsole topic="my-funds" />;
}
