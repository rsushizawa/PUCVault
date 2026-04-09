"use client";

export type Tab = "forum" | "arquivos";

interface TabsNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "forum", label: "Fórum" },
  { id: "arquivos", label: "Arquivos" },
];

export default function TabsNavigation({
  activeTab,
  onTabChange,
}: TabsNavigationProps) {
  return (
    <nav className="bg-surface-base border-b border-surface-raised px-8 pb-px">
      <div className="flex gap-8">
        {TABS.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center justify-center pt-4 pb-[18px] shrink-0 border-b-2 ${
                isActive
                  ? "border-accent text-accent font-semibold"
                  : "border-transparent text-text-secondary font-medium hover:text-text-primary"
              } text-base leading-6 transition-colors`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
