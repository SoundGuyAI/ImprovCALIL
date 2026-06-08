import { formatAppVersionLabel } from "@/lib/version";

export default function AppVersion() {
  return (
    <p className="text-center text-[10px] text-zinc-600 font-mono tabular-nums">
      {formatAppVersionLabel()}
    </p>
  );
}
