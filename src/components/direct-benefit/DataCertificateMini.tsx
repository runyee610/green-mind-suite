import { ShieldCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { type DataCertificate as Cert } from "./directBenefitData";

interface Props {
  certificate: Cert;
  /** 高亮使用了哪些项（显示徽标） */
  usedItemKeys?: string[];
  /** 详情链接（默认进政府侧企业画像详情页） */
  href?: string;
  className?: string;
}

/** 政务风「数据确权证书」紧凑卡片（列表 / 申领 / 拨付场景使用） */
export function DataCertificateMini({
  certificate,
  usedItemKeys,
  href,
  className,
}: Props) {
  const used = usedItemKeys?.length ?? 0;
  const total = certificate.items.length;

  const card = (
    <div
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-md border-[1.5px] border-double px-3 py-2.5 transition hover:shadow-md",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, #fcf8eb 0%, #f7f1e2 100%)",
        borderColor: "hsl(0 65% 35%)",
      }}
    >
      {/* 左侧国徽 */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: "hsl(0 65% 30%)" }}
      >
        <ShieldCheck className="h-5 w-5 text-[#f3d57a]" />
      </div>

      {/* 中部信息 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="rounded-sm px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white"
            style={{ background: "hsl(0 65% 30%)" }}
          >
            数据确权证书
          </span>
          <span className="font-mono text-[10px] text-[hsl(0_65%_25%)]">
            {certificate.id}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#5a4a3a]">
          <span>{certificate.issuer}</span>
          <span className="text-[#a89878]">·</span>
          <span className="font-mono">签发 {certificate.issuedAt}</span>
          <span className="text-[#a89878]">·</span>
          <span>
            确权项{" "}
            <span className="font-semibold text-[#2a1a0a]">{total}</span>
          </span>
          {used > 0 && (
            <>
              <span className="text-[#a89878]">·</span>
              <span>
                本次引用{" "}
                <span
                  className="rounded-sm px-1 font-mono font-semibold"
                  style={{
                    background: "hsl(45 90% 60% / 0.35)",
                    color: "hsl(0 70% 25%)",
                  }}
                >
                  {used}
                </span>{" "}
                项
              </span>
            </>
          )}
        </div>
      </div>

      {href && (
        <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(0_65%_30%)]" />
      )}

      {/* 右下角红色折角 */}
      <span
        className="pointer-events-none absolute right-0 top-0 h-3 w-3"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, hsl(0 65% 30%) 50%)",
        }}
      />
    </div>
  );

  if (href) return <Link to={href}>{card}</Link>;
  return card;
}
