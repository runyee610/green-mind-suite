import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Filter, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  INITIAL_ORG_FOREST,
  INITIAL_GROUPS,
  INITIAL_ENTERPRISES,
  flattenForest,
} from "@/components/system/orgTreeData";

const ORGS = flattenForest(INITIAL_ORG_FOREST);
const byId = (id: string) => ORGS.find((o) => o.id === id);

export interface OrgFilterValue {
  type: "all" | "org" | "group" | "enterprise";
  id?: string;
}


interface ParentItem {
  key: string;            // unique
  label: string;          // display
  value: OrgFilterValue;  // value when this parent itself is selected
  children?: { key: string; label: string; value: OrgFilterValue }[];
  childrenLabel?: string; // right-pane title
}

interface Section {
  title: string;
  accent: string; // text color class for section title
  items: ParentItem[];
}

function buildSections(includeGroups: boolean, includeEnterprises: boolean): Section[] {
  const city = ORGS.filter((o) => o.level === "city");
  const dept = ORGS.filter((o) => o.level === "dept");
  const districts = ORGS.filter((o) => o.level === "district");
  const sections: Section[] = [];

  // 市级中心 + 其内设科室作为子项
  if (city.length > 0) {
    sections.push({
      title: "市级",
      accent: "text-primary",
      items: city.map((c) => ({
        key: c.id,
        label: c.name,
        value: { type: "org", id: c.id },
        childrenLabel: `${c.name} · 内设科室`,
        children: dept.length > 0
          ? [
              { key: `${c.id}-all`, label: `全部 ${c.name}`, value: { type: "org", id: c.id } },
              ...dept.map((d) => ({
                key: d.id,
                label: d.name,
                value: { type: "org", id: d.id } as OrgFilterValue,
              })),
            ]
          : undefined,
      })),
    });
  }

  // 区划 + 各自园区
  if (districts.length > 0) {
    sections.push({
      title: "区划",
      accent: "text-emerald-600 dark:text-emerald-400",
      items: districts.map((d) => {
        const parks = d.children ?? [];
        return {
          key: d.id,
          label: d.name,
          value: { type: "org", id: d.id },
          childrenLabel: `${d.name} · 园区`,
          children: parks.length > 0
            ? [
                { key: `${d.id}-all`, label: `全部 ${d.name}`, value: { type: "org", id: d.id } },
                ...parks.map((p) => ({
                  key: p.id,
                  label: p.name,
                  value: { type: "org", id: p.id } as OrgFilterValue,
                })),
              ]
            : undefined,
        };
      }),
    });
  }

  // 集团
  if (includeGroups && INITIAL_GROUPS.length > 0) {
    sections.push({
      title: "集团",
      accent: "text-amber-600 dark:text-amber-400",
      items: INITIAL_GROUPS.map((g) => ({
        key: g.id,
        label: g.name,
        value: { type: "group", id: g.id },
      })),
    });
  }

  return sections;
}

function valueLabel(v: OrgFilterValue): string {
  if (v.type === "all") return "全部组织";
  if (v.type === "group") return INITIAL_GROUPS.find((g) => g.id === v.id)?.name ?? "全部组织";
  return byId(v.id ?? "")?.name ?? "全部组织";
}

export function encodeOrgFilter(v: OrgFilterValue): string {
  if (v.type === "all") return "all";
  if (v.type === "group") return `group:${v.id}`;
  return v.id ?? "all";
}
export function decodeOrgFilter(s: string): OrgFilterValue {
  if (!s || s === "all") return { type: "all" };
  if (s.startsWith("group:")) return { type: "group", id: s.slice(6) };
  return { type: "org", id: s };
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  includeGroups?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function OrgFilterPicker({ value, onChange, includeGroups = true, className, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const sections = useMemo(() => buildSections(includeGroups), [includeGroups]);
  const current = decodeOrgFilter(value);
  const [activeKey, setActiveKey] = useState<string | null>(() => {
    for (const s of sections) for (const it of s.items) {
      if (it.children?.some((c) => encodeOrgFilter(c.value) === value)) return it.key;
    }
    return null;
  });
  const activeItem = useMemo(() => {
    for (const s of sections) for (const it of s.items) if (it.key === activeKey) return it;
    return null;
  }, [activeKey, sections]);

  const pick = (v: OrgFilterValue) => {
    onChange(encodeOrgFilter(v));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 justify-between gap-1.5 px-2.5 text-xs font-normal",
            current.type !== "all" && "border-primary/40 text-foreground",
            triggerClassName,
          )}
        >
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="truncate max-w-[10rem]">{valueLabel(current)}</span>
          {current.type !== "all" ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange("all"); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onChange("all"); } }}
              className="ml-0.5 rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-[560px] p-0 overflow-hidden", className)}>
        <div className="flex max-h-[420px]">
          {/* 左侧父类 */}
          <div className="w-56 border-r border-border bg-muted/20 overflow-y-auto">
            <button
              type="button"
              onClick={() => pick({ type: "all" })}
              className={cn(
                "w-full px-3 py-2 text-left text-sm font-medium border-b border-border",
                current.type === "all" ? "text-primary bg-primary/5" : "hover:bg-muted/40",
              )}
            >
              全部组织
            </button>
            {sections.map((sec) => (
              <div key={sec.title} className="py-1">
                <div className={cn("px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide", sec.accent)}>
                  {sec.title}
                </div>
                {sec.items.map((it) => {
                  const selfSelected = encodeOrgFilter(it.value) === value;
                  const childSelected = it.children?.some((c) => encodeOrgFilter(c.value) === value);
                  const active = activeKey === it.key;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      onMouseEnter={() => it.children && setActiveKey(it.key)}
                      onClick={() => {
                        if (it.children) setActiveKey(it.key);
                        else pick(it.value);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px]",
                        active && "bg-primary/10",
                        (selfSelected || childSelected) && "text-primary font-medium",
                        !active && "hover:bg-muted/50",
                      )}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          sec.title === "市级" && "bg-primary",
                          sec.title === "区划" && "bg-emerald-500",
                          sec.title === "集团" && "bg-amber-500",
                        )} />
                        <span className="truncate">{it.label}</span>
                      </span>
                      {it.children && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 右侧子项 */}
          <div className="flex-1 overflow-y-auto">
            {activeItem?.children ? (
              <>
                <div className="px-4 pt-3 pb-2 text-xs text-muted-foreground border-b border-border">
                  {activeItem.childrenLabel ?? activeItem.label}
                </div>
                <div className="py-1">
                  {activeItem.children.map((c) => {
                    const selected = encodeOrgFilter(c.value) === value;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => pick(c.value)}
                        className={cn(
                          "block w-full px-4 py-1.5 text-left text-[13px]",
                          selected ? "text-primary font-medium bg-primary/5" : "hover:bg-muted/40",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center px-6 py-10 text-center text-xs text-muted-foreground">
                将鼠标移到左侧带 <ChevronRight className="inline h-3 w-3" /> 的项可查看下属选项
                <br />或直接点击集团等无下级的项完成筛选
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
