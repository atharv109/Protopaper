"use client";

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-2xl"
      style={{ background: "rgba(1,1,4,0.6)", border: "1px solid rgba(254,254,254,0.08)" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            active === tab.id
              ? "text-light glow-border"
              : "text-muted hover:text-lavender"
          }`}
          style={active === tab.id ? {
            background: "linear-gradient(135deg, rgba(90,71,177,0.6), rgba(136,117,214,0.4))",
          } : {}}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
