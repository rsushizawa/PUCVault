"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  SlidersHorizontal,
  X,
} from "lucide-react";

export type SortOption = "default" | "date" | "tag";

export type CourseFile = {
  id: string;
  name: string;
  uploadedAt: string;
  tags: string[];
};

export type Course = {
  id: string;
  name: string;
  files: CourseFile[];
};

export type Semester = {
  id: string;
  name: string;
  courses: Course[];
};

type FileGroup = {
  label: string;
  color: string;
  files: CourseFile[];
};

function rainbowColor(index: number, total: number): string {
  const hue = Math.round((index / Math.max(total, 1)) * 360);
  return `hsl(${hue}deg 65% 55%)`;
}

function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash + tag.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}deg 65% 55%)`;
}

function groupFilesByYear(files: CourseFile[]): FileGroup[] {
  const byYear = new Map<string, CourseFile[]>();
  for (const file of files) {
    const year = new Date(file.uploadedAt).getFullYear().toString();
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(file);
  }
  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));
  return years.map((year, i) => ({
    label: year,
    color: rainbowColor(i, years.length),
    files: [...byYear.get(year)!].sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    ),
  }));
}

function groupFilesByTag(files: CourseFile[]): FileGroup[] {
  const byTag = new Map<string, CourseFile[]>();
  for (const file of files) {
    const tag = file.tags[0] ?? "untagged";
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag)!.push(file);
  }
  const tags = [...byTag.keys()].sort();
  return tags.map((tag) => ({
    label: tag,
    color: tagColor(tag),
    files: [...byTag.get(tag)!].sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

function getGroups(
  files: CourseFile[],
  sortBy: SortOption,
): FileGroup[] | null {
  if (sortBy === "date") return groupFilesByYear(files);
  if (sortBy === "tag") return groupFilesByTag(files);
  return null; // default: flat alphabetical, no grouping
}

function FileRow({ file }: { file: CourseFile }) {
  return (
    <li className="flex items-center justify-between px-3 py-1.5 hover:bg-surface-overlay transition-colors">
      <span className="text-text-secondary text-sm">{file.name}</span>
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {file.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-text-muted bg-surface-overlay px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
        <span className="text-xs text-text-muted">
          {new Date(file.uploadedAt).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </li>
  );
}

interface CourseAccordionProps {
  course: Course;
  sortBy: SortOption;
  accentColor?: string;
}

function CourseAccordion({
  course,
  sortBy,
  accentColor,
}: CourseAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groups = getGroups(course.files, sortBy);
  const flatFiles =
    sortBy === "default"
      ? [...course.files].sort((a, b) => a.name.localeCompare(b.name))
      : [];

  const iconColor = accentColor ?? "var(--color-accent)";

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-surface-overlay transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Folder aria-hidden size={16} style={{ color: iconColor }} />
          <span className="text-text-muted text-sm">{course.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-text-primary text-xs">
            {course.files.length} files
          </span>
          <ChevronRight
            aria-hidden
            size={12}
            className={`text-text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="pl-8 pb-2 pt-1 flex flex-col gap-2">
          {groups ? (
            groups.map((group) => (
              <div
                key={group.label}
                className="rounded-lg overflow-hidden border-l-4"
                style={{ borderColor: group.color }}
              >
                {/* Group header */}
                <div className="relative px-3 py-1.5">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{ backgroundColor: group.color }}
                  />
                  <span
                    className="relative text-xs font-medium capitalize"
                    style={{ color: group.color }}
                  >
                    {group.label}
                  </span>
                </div>
                {/* Group files */}
                <ul className="flex flex-col">
                  {group.files.map((file) => (
                    <FileRow key={file.id} file={file} />
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <ul className="flex flex-col">
              {flatFiles.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

interface SemesterAccordionProps {
  semester: Semester;
  sortBy: SortOption;
  accentColor: string;
}

function SemesterAccordion({
  semester,
  sortBy,
  accentColor,
}: SemesterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalFiles = semester.courses.reduce(
    (sum, course) => sum + course.files.length,
    0,
  );

  const isDefault = sortBy === "default";

  return (
    <div className="w-full bg-surface-raised rounded-sm shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="relative rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
            {isDefault ? (
              <div
                className="absolute inset-0 rounded-lg opacity-20"
                style={{ backgroundColor: accentColor }}
              />
            ) : (
              <div className="absolute inset-0 rounded-lg bg-[#ffedd5]" />
            )}
            <FolderOpen
              aria-hidden
              size={20}
              className="relative"
              style={{ color: isDefault ? accentColor : "#f97316" }}
            />
          </div>

          <div className="flex flex-col items-start">
            <span className="text-text-primary text-base font-normal">
              {semester.name}
            </span>
            <span className="text-text-muted text-sm font-medium">
              {semester.courses.length} Courses • {totalFiles} Files
            </span>
          </div>
        </div>

        <ChevronRight
          aria-hidden
          size={14}
          className={`text-text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1 px-4 pb-4 pt-2">
          {semester.courses.map((course, i) => (
            <CourseAccordion
              key={course.id}
              course={course}
              sortBy={sortBy}
              accentColor={
                isDefault ? rainbowColor(i, semester.courses.length) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommunityFilesProps {
  semesters: Semester[];
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "date", label: "By Date" },
  { value: "tag", label: "By Tag" },
];

export default function CommunityFiles({ semesters }: CommunityFilesProps) {
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [filterOpen, setFilterOpen] = useState(false);

  function selectSort(option: SortOption) {
    setSortBy(option);
    setFilterOpen(false);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary text-2xl font-bold">
          Community Files
        </h2>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 bg-[#5d87b0] text-text-primary px-4 py-2 rounded-lg"
          >
            <SlidersHorizontal aria-hidden size={16} />
            <span className="text-base font-medium">Filter</span>
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 bg-surface-raised border border-surface-overlay rounded-lg shadow-lg z-10 min-w-[140px] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-surface-overlay">
                <span className="text-text-secondary text-xs font-medium">
                  Sort by
                </span>
                <button
                  onClick={() => setFilterOpen(false)}
                  aria-label="Close sort menu"
                >
                  <X aria-hidden size={12} className="text-text-muted" />
                </button>
              </div>
              {SORT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => selectSort(value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-overlay transition-colors ${
                    sortBy === value
                      ? "text-accent font-medium"
                      : "text-text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accordion list */}
      <div className="flex flex-col gap-px">
        {semesters.map((semester, i) => (
          <SemesterAccordion
            key={semester.id}
            semester={semester}
            sortBy={sortBy}
            accentColor={
              sortBy === "default"
                ? rainbowColor(i, semesters.length)
                : "#f97316"
            }
          />
        ))}
      </div>
    </div>
  );
}
