"use client";

export type Tab = "forum" | "arquivos" | "moderação" | "config";

interface TabsNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  showMod?: boolean;
  showConfig?: boolean;
}

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: "forum", label: "Fórum" },
  { id: "arquivos", label: "Arquivos" },
];

export default function TabsNavigation({
  activeTab,
  onTabChange,
  showMod = false,
  showConfig = false,
}: TabsNavigationProps) {
  const tabs = [
    ...BASE_TABS,
    ...(showMod ? [{ id: "moderação" as Tab, label: "Moderação" }] : []),
    ...(showConfig ? [{ id: "config" as Tab, label: "Configurações" }] : []),
  ];

  return (
    <nav className="bg-surface-base border-b border-surface-raised px-4 sm:px-8 pb-px overflow-x-auto">
      <div className="flex gap-6 sm:gap-8 min-w-max">
        {tabs.map(({ id, label }) => {
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
