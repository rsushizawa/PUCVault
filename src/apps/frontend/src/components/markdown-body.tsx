import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-text-primary mb-3 mt-4 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-text-primary mb-2 mt-3 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-text-primary mb-2 mt-3 first:mt-0">
      {children}
    </h3>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent pl-3 my-3 text-text-muted italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-surface-overlay my-4" />,
  pre: ({ children }) => (
    <pre className="bg-surface-overlay rounded p-3 mb-3 overflow-x-auto text-xs font-mono text-text-secondary">
      {children}
    </pre>
  ),
  code: ({ children, className }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="bg-surface-overlay text-accent px-1 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    ),
};

interface MarkdownBodyProps {
  children: string;
  className?: string;
}

export default function MarkdownBody({
  children,
  className = "",
}: MarkdownBodyProps) {
  return (
    <div className={`text-sm text-text-secondary leading-6 ${className}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </Markdown>
    </div>
  );
}
