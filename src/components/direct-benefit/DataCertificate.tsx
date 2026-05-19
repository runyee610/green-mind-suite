import { Shield, Star, QrCode, FileCheck2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type DataCertificate as Cert,
  findEnterprise,
} from "./directBenefitData";

interface Props {
  certificate: Cert;
  /** 高亮的 item key（用于申领/拨付场景标注本次引用项） */
  highlightItemKeys?: string[];
  className?: string;
}

/**
 * 政务风「数据确权证书」完整版（A4 风格）。
 * 米色底 + 双层深红边框 + 国徽风徽章 + 红色钢印。
 */
export function DataCertificate({ certificate, highlightItemKeys, className }: Props) {
  const ent = findEnterprise(certificate.enterpriseId);
  const hi = new Set(highlightItemKeys ?? []);

  return (
    <div
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-md",
        "border-[3px] border-double",
        className,
      )}
      style={{
        background:
          "linear-gradient(135deg, #fcf8eb 0%, #f7f1e2 50%, #f3ead0 100%)",
        borderColor: "hsl(0 65% 30%)",
        boxShadow: "0 4px 24px -8px rgba(80, 20, 10, 0.18)",
      }}
    >
      {/* 内层细边 */}
      <div
        className="pointer-events-none absolute inset-2 rounded-sm border"
        style={{ borderColor: "hsl(0 55% 38% / 0.55)" }}
      />

      {/* 水印 */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        style={{
          fontFamily: "serif",
          fontSize: "120px",
          fontWeight: 800,
          color: "hsl(0 65% 30% / 0.05)",
          letterSpacing: "0.2em",
          transform: "rotate(-18deg)",
        }}
      >
        DATA·CERT
      </div>

      {/* 顶部红头 */}
      <div className="relative px-8 pt-6 pb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <CrestSvg />
          <div className="leading-tight">
            <div
              className="font-mono text-[11px] tracking-[0.3em]"
              style={{ color: "hsl(0 65% 30%)" }}
            >
              SHANGHAI · DATA ELEMENT REGISTRY
            </div>
            <div
              className="text-[13px] font-semibold"
              style={{ color: "hsl(0 65% 30%)" }}
            >
              上海市数据要素登记中心
            </div>
          </div>
          <CrestSvg flip />
        </div>
        <div
          className="mx-auto mt-3 h-px w-3/4"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(0 65% 30% / 0.6), transparent)",
          }}
        />
        <h2
          className="mt-4 font-serif text-3xl font-bold tracking-[0.4em]"
          style={{ color: "hsl(0 70% 28%)" }}
        >
          数据确权证书
        </h2>
        <div className="mt-1 text-[11px] text-[#7a5a3a]">
          DATA RIGHTS CERTIFICATE
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-sm border border-[hsl(0_65%_30%/0.4)] bg-white/40 px-3 py-1 font-mono text-[11px] text-[hsl(0_65%_25%)]">
          编号 {certificate.id}
        </div>
      </div>

      {/* 主体内容 */}
      <div className="relative px-8 pb-6">
        {/* 确权主体 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-sm border border-[hsl(0_55%_38%/0.35)] bg-white/40 px-4 py-3 text-[12px]">
          <KV label="确权主体" value={ent?.name ?? "-"} bold />
          <KV label="统一社会信用代码" value={ent?.creditCode ?? "-"} mono />
          <KV label="所属行政区" value={ent?.district ?? "-"} />
          <KV label="所属行业" value={ent?.industry ?? "-"} />
          <KV label="签发机构" value={certificate.issuer} />
          <KV label="签发日期" value={certificate.issuedAt} mono />
          <KV label="有效期至" value={certificate.validUntil} mono />
          <KV
            label="授权用途"
            value={certificate.scope.join(" / ")}
          />
        </div>

        {/* 确权数据项 */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-3.5 w-3.5 text-[hsl(0_65%_30%)]" />
              <span className="text-[12px] font-semibold text-[hsl(0_70%_25%)]">
                确权数据项（{certificate.items.length}）
              </span>
            </div>
            {highlightItemKeys && highlightItemKeys.length > 0 && (
              <span className="rounded-sm bg-[hsl(0_65%_30%/0.08)] px-2 py-0.5 text-[10px] text-[hsl(0_70%_25%)]">
                * 标注项为本次业务实际引用
              </span>
            )}
          </div>
          <div className="overflow-hidden rounded-sm border border-[hsl(0_55%_38%/0.35)] bg-white/60">
            <table className="w-full text-[11px]">
              <thead className="bg-[hsl(0_65%_30%/0.06)] text-[hsl(0_70%_25%)]">
                <tr>
                  <th className="w-10 px-2 py-1.5 text-left font-semibold">序</th>
                  <th className="px-2 py-1.5 text-left font-semibold">数据项</th>
                  <th className="px-2 py-1.5 text-left font-semibold">数值</th>
                  <th className="px-2 py-1.5 text-left font-semibold">来源</th>
                  <th className="w-24 px-2 py-1.5 text-left font-semibold">采集日期</th>
                </tr>
              </thead>
              <tbody>
                {certificate.items.map((it, i) => {
                  const on = hi.has(it.key);
                  return (
                    <tr
                      key={it.key}
                      className={cn(
                        "border-t border-[hsl(0_55%_38%/0.18)]",
                        on && "bg-[hsl(45_90%_60%/0.15)]",
                      )}
                    >
                      <td className="px-2 py-1.5 font-mono text-[hsl(0_60%_30%)]">
                        {String(i + 1).padStart(2, "0")}
                        {on && " *"}
                      </td>
                      <td className="px-2 py-1.5 text-[#3a2a1a]">{it.label}</td>
                      <td className="px-2 py-1.5 font-medium text-[#2a1a0a]">{it.value}</td>
                      <td className="px-2 py-1.5 text-[#5a4a3a]">
                        {it.source}
                        <span className="ml-1 font-mono text-[9px] text-[#8a7a5a]">
                          {it.fieldPath}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 font-mono text-[#5a4a3a]">{it.collectedAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 底部：声明 + 钢印 + 二维码 */}
        <div className="mt-5 grid grid-cols-[1fr_auto_auto] items-end gap-4">
          <div className="text-[11px] leading-relaxed text-[#5a4a3a]">
            <p>
              兹证明上述数据项已经过来源核验与归集，所有权及对应使用权归确权主体所有；本证书可作为申报、监管、资金核拨等政务场景的合法数据凭据。
            </p>
            <p className="mt-1.5 font-mono text-[#7a5a3a] text-xs">
              区块链存证：{certificate.hash}
            </p>
          </div>

          <SealSvg />

          <div className="flex flex-col items-center">
            <QrSvg />
            <div className="mt-1 font-mono text-[9px] text-[#7a5a3a]">扫码验真</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({
  label,
  value,
  bold,
  mono,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 text-[#7a5a3a]">{label}：</span>
      <span
        className={cn(
          "min-w-0 truncate text-[#2a1a0a]",
          bold && "font-semibold",
          mono && "font-mono text-[11px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CrestSvg({ flip }: { flip?: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <circle cx="16" cy="16" r="14" fill="hsl(0 65% 30%)" />
      <circle cx="16" cy="16" r="11" fill="none" stroke="#f3d57a" strokeWidth="0.6" />
      <polygon
        points="16,8 17.5,13 22.5,13 18.5,16 20,21 16,18 12,21 13.5,16 9.5,13 14.5,13"
        fill="#f3d57a"
      />
      <text
        x="16"
        y="27"
        textAnchor="middle"
        fontSize="3"
        fill="#f3d57a"
        fontWeight="700"
      >
        SH·DATA
      </text>
    </svg>
  );
}

function SealSvg() {
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="opacity-90">
      <defs>
        <path
          id="seal-top"
          d="M 12 42 A 30 30 0 0 1 72 42"
          fill="none"
        />
        <path
          id="seal-bot"
          d="M 14 46 A 28 28 0 0 0 70 46"
          fill="none"
        />
      </defs>
      <circle
        cx="42"
        cy="42"
        r="36"
        fill="none"
        stroke="hsl(0 70% 38%)"
        strokeWidth="2.5"
      />
      <circle
        cx="42"
        cy="42"
        r="32"
        fill="none"
        stroke="hsl(0 70% 38%)"
        strokeWidth="0.8"
      />
      <polygon
        points="42,28 45.5,38.5 56.5,38.5 47.5,45 51,55.5 42,49 33,55.5 36.5,45 27.5,38.5 38.5,38.5"
        fill="hsl(0 70% 38%)"
      />
      <text fill="hsl(0 70% 38%)" fontSize="6.5" fontWeight="700" letterSpacing="1">
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">
          上海市数据要素登记中心
        </textPath>
      </text>
      <text fill="hsl(0 70% 38%)" fontSize="4.5" fontWeight="600" letterSpacing="2">
        <textPath href="#seal-bot" startOffset="50%" textAnchor="middle">
          DATA · CERT · OFFICIAL
        </textPath>
      </text>
    </svg>
  );
}

function QrSvg() {
  // 简化版伪二维码（视觉用）
  const cells = Array.from({ length: 13 * 13 }, (_, i) => {
    // 固定伪随机
    return (i * 31 + 7) % 5 < 2;
  });
  return (
    <svg width="56" height="56" viewBox="0 0 13 13" shapeRendering="crispEdges">
      <rect width="13" height="13" fill="white" />
      {cells.map((on, i) => {
        if (!on) return null;
        const x = i % 13;
        const y = Math.floor(i / 13);
        return <rect key={i} x={x} y={y} width="1" height="1" fill="#2a1a0a" />;
      })}
      {/* 三个定位角 */}
      {[
        [0, 0],
        [10, 0],
        [0, 10],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="3" height="3" fill="#2a1a0a" />
          <rect x={x + 0.6} y={y + 0.6} width="1.8" height="1.8" fill="white" />
          <rect x={x + 1} y={y + 1} width="1" height="1" fill="#2a1a0a" />
        </g>
      ))}
    </svg>
  );
}
