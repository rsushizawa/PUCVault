interface CommunityHeroProps {
  communityName: string;
  memberCount: string;
  repositoryType: string;
  bannerSrc?: string;
  iconSrc?: string;
}

export default function CommunityHero({
  communityName,
  memberCount,
  repositoryType,
  bannerSrc,
  iconSrc,
}: CommunityHeroProps) {
  return (
    <div className="relative h-[192px] w-full overflow-hidden bg-surface-raised">
      {bannerSrc ? (
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-overlay" />
      )}
      <div className="absolute inset-0 bg-surface-base/50" />

      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="size-[60px] sm:size-[80px] rounded-xl border-2 border-accent/20 bg-surface-overlay flex items-center justify-center overflow-hidden shrink-0">
            {iconSrc ? (
              <img src={iconSrc} alt={communityName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-accent">
                {communityName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold leading-tight tracking-tight text-text-primary">
              {communityName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>{memberCount}</span>
              <span className="text-text-muted">·</span>
              <span>{repositoryType}</span>
            </div>
          </div>
        </div>
        <button className="rounded-lg border border-accent/40 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-accent/10 hover:border-accent/70 transition-all duration-200 cursor-pointer">
          Seguir
        </button>
      </div>
    </div>
  );
}
