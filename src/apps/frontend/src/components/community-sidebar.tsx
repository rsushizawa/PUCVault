export interface CommunityRule {
  id: number;
  title: string;
  description?: string;
}

export interface CommunitySidebarProps {
  communityName: string;
  createdAt: string;
  isPublic: boolean;
  memberCount: string;
  memberLabel: string;
  postCount: string;
  postLabel: string;
  rules: CommunityRule[];
}

export function CommunitySidebar({
  communityName,
  createdAt,
  isPublic,
  memberCount,
  memberLabel,
  postCount,
  postLabel,
  rules,
}: CommunitySidebarProps) {
  return (
    <div className="flex flex-col rounded-sm bg-surface-raised">
      {/* Header */}
      <div className="flex flex-col gap-1 p-4">
        <h2 className="font-bold text-text-primary">{communityName}</h2>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>{createdAt}</span>
          <span>•</span>
          <span>{isPublic ? "Public" : "Private"}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 border-t border-surface-overlay p-4">
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{memberCount}</span>
          <span className="text-sm text-text-muted">{memberLabel}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-text-primary">{postCount}</span>
          <span className="text-sm text-text-muted">{postLabel}</span>
        </div>
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-2 border-t border-surface-overlay p-4">
        <h3 className="text-sm font-semibold text-text-secondary">Rules</h3>
        <ol className="flex list-decimal list-inside flex-col gap-2">
          {rules.map((rule) => (
            <li key={rule.id} className="text-sm text-text-primary">
              {rule.title}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
