import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function System() {
  return (
    <PlaceholderPage
      title="系统管理"
      subtitle="账户、权限、字典、日志与系统参数配置"
      icon={Settings}
      features={[
        "账号与角色管理",
        "菜单与权限分配",
        "数据字典维护",
        "操作日志与审计",
        "系统参数配置",
        "数据备份与恢复",
      ]}
    />
  );
}
