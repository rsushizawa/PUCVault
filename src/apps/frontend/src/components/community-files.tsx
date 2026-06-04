"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Folder, FolderOpen, FileText, ChevronRight, Download } from "lucide-react";
import { getTagColor } from "@/lib/tag-colors";
import {
  getFileYears,
  getFileTagsByYear,
  getFilesByYearAndTag,
  type FileTag,
  type FileEntry,
} from "@/lib/api/communities";

// Module-level caches — survive tab switches since the component remounts
const yearsCache = new Map<string, number[]>();
const tagsCache  = new Map<string, FileTag[]>();
const filesCache = new Map<string, FileEntry[]>();

// ── FileRow ───────────────────────────────────────────────────────────────────

function FileRow({ file, communitySlug }: { file: FileEntry; communitySlug: string }) {
  const date = new Date(file.uploaded_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-surface-overlay transition-colors duration-100 rounded-lg group">
      <FileText size={14} className="text-text-muted shrink-0" />
      <Link
        href={`/v/${communitySlug}/post/${file.post_id}`}
        className="text-sm text-text-primary flex-1 group-hover:text-accent transition-colors truncate"
      >
        {file.title}
      </Link>
      <span className="text-xs text-text-muted shrink-0 hidden sm:block">{date}</span>
      <a
        href={file.file_url}
        target="_blank"
        rel="noopener noreferrer"
        title="Baixar arquivo"
        className="shrink-0 text-text-muted hover:text-accent transition-colors ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Download size={13} />
      </a>
    </div>
  );
}

// ── TagRow ────────────────────────────────────────────────────────────────────

function TagRow({
  tag,
  forumId,
  year,
  communitySlug,
}: {
  tag: FileTag;
  forumId: string;
  year: number;
  communitySlug: string;
}) {
  const [open, setOpen]       = useState(false);
  const [files, setFiles]     = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const cacheKey = `${forumId}-${year}-${tag.id}`;
  const color    = getTagColor(String(tag.id));

  async function toggle() {
    if (!open && files.length === 0) {
      const cached = filesCache.get(cacheKey);
      if (cached) {
        setFiles(cached);
      } else {
        setLoading(true);
        try {
          const data = await getFilesByYearAndTag(forumId, year, tag.id);
          filesCache.set(cacheKey, data);
          setFiles(data);
        } catch {
          setFiles([]);
        } finally {
          setLoading(false);
        }
      }
    }
    setOpen((o) => !o);
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-surface-overlay transition-colors duration-100 rounded-lg cursor-pointer"
      >
        <ChevronRight
          size={12}
          className="text-text-muted shrink-0 transition-transform duration-150"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
        {open ? (
          <FolderOpen size={15} className="shrink-0" style={{ color }} />
        ) : (
          <Folder size={15} className="shrink-0" style={{ color }} />
        )}
        <span className="text-sm font-medium flex-1 text-left" style={{ color }}>
          {tag.name}
        </span>
      </button>

      {open && (
        <div className="ml-8 border-l border-surface-overlay pl-2 flex flex-col">
          {loading ? (
            <p className="text-xs text-text-muted px-3 py-2">Carregando...</p>
          ) : files.length === 0 ? (
            <p className="text-xs text-text-muted px-3 py-2">Nenhum arquivo.</p>
          ) : (
            files.map((f) => (
              <FileRow key={f.post_id} file={f} communitySlug={communitySlug} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── YearRow ───────────────────────────────────────────────────────────────────

function YearRow({
  year,
  forumId,
  communitySlug,
}: {
  year: number;
  forumId: string;
  communitySlug: string;
}) {
  const [open, setOpen]       = useState(false);
  const [tags, setTags]       = useState<FileTag[]>([]);
  const [loading, setLoading] = useState(false);

  const cacheKey = `${forumId}-${year}`;

  async function toggle() {
    if (!open && tags.length === 0) {
      const cached = tagsCache.get(cacheKey);
      if (cached) {
        setTags(cached);
      } else {
        setLoading(true);
        try {
          const data = await getFileTagsByYear(forumId, year);
          tagsCache.set(cacheKey, data);
          setTags(data);
        } catch {
          setTags([]);
        } finally {
          setLoading(false);
        }
      }
    }
    setOpen((o) => !o);
  }

  return (
    <div className="bg-surface-raised rounded-xl border border-surface-overlay overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-overlay transition-colors duration-100 cursor-pointer"
      >
        <ChevronRight
          size={14}
          className="text-text-muted shrink-0 transition-transform duration-150"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
        {open ? (
          <FolderOpen size={18} className="text-accent shrink-0" />
        ) : (
          <Folder size={18} className="text-accent shrink-0" />
        )}
        <span className="text-base font-semibold text-text-primary flex-1 text-left">
          {year}
        </span>
      </button>

      {open && (
        <div className="border-t border-surface-overlay px-2 py-2 flex flex-col gap-0.5">
          {loading ? (
            <p className="text-xs text-text-muted px-3 py-2">Carregando...</p>
          ) : tags.length === 0 ? (
            <p className="text-xs text-text-muted px-3 py-2">Nenhuma tag encontrada.</p>
          ) : (
            tags.map((tag) => (
              <TagRow
                key={tag.id}
                tag={tag}
                forumId={forumId}
                year={year}
                communitySlug={communitySlug}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── CommunityFiles ────────────────────────────────────────────────────────────

interface CommunityFilesProps {
  forumId: string;
}

export default function CommunityFiles({ forumId }: CommunityFilesProps) {
  const { name } = useParams<{ name: string }>();
  const communitySlug = decodeURIComponent(name);

  const [years, setYears]     = useState<number[]>(() => yearsCache.get(forumId) ?? []);
  const [loading, setLoading] = useState(!yearsCache.has(forumId));
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (yearsCache.has(forumId)) return;
    getFileYears(forumId)
      .then((data) => {
        yearsCache.set(forumId, data);
        setYears(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [forumId]);

  if (loading) {
    return <p className="text-text-muted text-sm py-6">Carregando anos...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-400 py-6">Erro ao carregar arquivos.</p>;
  }
  if (years.length === 0) {
    return (
      <p className="text-text-muted text-sm py-6">Nenhum arquivo disponível ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {years.map((year) => (
        <YearRow
          key={year}
          year={year}
          forumId={forumId}
          communitySlug={communitySlug}
        />
      ))}
    </div>
  );
}
