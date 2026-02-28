export function SkeletonLine({ width = "100%", height = "16px" }: { width?: string; height?: string }) {
  return (
    <div
      className="rounded shimmer"
      style={{ width, height }}
    />
  );
}

export function SkeletonBlock() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(254,254,254,0.08)" }}>
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ background: "rgba(1,1,4,0.4)" }}>
        <SkeletonLine width="40%" height="14px" />
        <SkeletonLine width="16px" height="16px" />
      </div>
    </div>
  );
}
