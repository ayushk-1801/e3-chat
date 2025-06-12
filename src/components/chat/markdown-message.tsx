"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Download, WrapText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import "highlight.js/styles/github-dark.css";

// Catppuccin Mocha theme for dark mode
const catppuccinMochaTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    background: "#1e1e2e", // Catppuccin Mocha base
    color: "#cdd6f4", // Catppuccin Mocha text
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal" as const,
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.5",
    WebkitHyphens: "none" as const,
    hyphens: "none" as const,
  },
  'pre[class*="language-"]': {
    background: "#1e1e2e",
    color: "#cdd6f4",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal" as const,
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.5",
    WebkitHyphens: "none" as const,
    hyphens: "none" as const,
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto" as const,
  },
  comment: {
    color: "#6c7086", // Catppuccin Mocha overlay0
    fontStyle: "italic" as const,
  },
  prolog: {
    color: "#6c7086",
  },
  doctype: {
    color: "#6c7086",
  },
  cdata: {
    color: "#6c7086",
  },
  punctuation: {
    color: "#bac2de", // Catppuccin Mocha subtext1
  },
  namespace: {
    opacity: 0.7,
  },
  property: {
    color: "#f38ba8", // Catppuccin Mocha red
  },
  tag: {
    color: "#f38ba8",
  },
  constant: {
    color: "#f38ba8",
  },
  symbol: {
    color: "#f38ba8",
  },
  deleted: {
    color: "#f38ba8",
  },
  boolean: {
    color: "#fab387", // Catppuccin Mocha peach
  },
  number: {
    color: "#fab387",
  },
  selector: {
    color: "#a6e3a1", // Catppuccin Mocha green
  },
  "attr-name": {
    color: "#a6e3a1",
  },
  string: {
    color: "#a6e3a1",
  },
  char: {
    color: "#a6e3a1",
  },
  builtin: {
    color: "#a6e3a1",
  },
  inserted: {
    color: "#a6e3a1",
  },
  operator: {
    color: "#89dceb", // Catppuccin Mocha sky
  },
  entity: {
    color: "#89dceb",
    cursor: "help" as const,
  },
  url: {
    color: "#89dceb",
  },
  ".language-css .token.string": {
    color: "#89dceb",
  },
  ".style .token.string": {
    color: "#89dceb",
  },
  atrule: {
    color: "#f9e2af", // Catppuccin Mocha yellow
  },
  "attr-value": {
    color: "#f9e2af",
  },
  function: {
    color: "#89b4fa", // Catppuccin Mocha blue
  },
  "class-name": {
    color: "#89b4fa",
  },
  keyword: {
    color: "#cba6f7", // Catppuccin Mocha mauve
  },
  regex: {
    color: "#f5c2e7", // Catppuccin Mocha pink
  },
  important: {
    color: "#f5c2e7",
    fontWeight: "bold" as const,
  },
  variable: {
    color: "#f5c2e7",
  },
  bold: {
    fontWeight: "bold" as const,
  },
  italic: {
    fontStyle: "italic" as const,
  },
  // Additional tokens for better C++ support
  "type-class-name": {
    color: "#89b4fa", // Catppuccin Mocha blue
  },
  generic: {
    color: "#89b4fa",
  },
  "function-definition": {
    color: "#89b4fa",
  },
  parameter: {
    color: "#cdd6f4",
  },
  directive: {
    color: "#f5c2e7", // Catppuccin Mocha pink
  },
  "directive-hash": {
    color: "#f5c2e7",
  },
  macro: {
    color: "#fab387", // Catppuccin Mocha peach
  },
  "cpp-include": {
    color: "#f5c2e7",
  },
};

// Catppuccin Latte theme for light mode
const catppuccinLatteTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    background: "#eff1f5", // Catppuccin Latte base
    color: "#4c4f69", // Catppuccin Latte text
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal" as const,
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.5",
    WebkitHyphens: "none" as const,
    hyphens: "none" as const,
  },
  'pre[class*="language-"]': {
    background: "#eff1f5",
    color: "#4c4f69",
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal" as const,
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.5",
    WebkitHyphens: "none" as const,
    hyphens: "none" as const,
    padding: "1em",
    margin: "0.5em 0",
    overflow: "auto" as const,
  },
  comment: {
    color: "#8c8fa1", // Catppuccin Latte overlay1
    fontStyle: "italic" as const,
  },
  prolog: {
    color: "#8c8fa1",
  },
  doctype: {
    color: "#8c8fa1",
  },
  cdata: {
    color: "#8c8fa1",
  },
  punctuation: {
    color: "#5c5f77", // Catppuccin Latte subtext1
  },
  namespace: {
    opacity: 0.7,
  },
  property: {
    color: "#d20f39", // Catppuccin Latte red
  },
  tag: {
    color: "#d20f39",
  },
  constant: {
    color: "#d20f39",
  },
  symbol: {
    color: "#d20f39",
  },
  deleted: {
    color: "#d20f39",
  },
  boolean: {
    color: "#fe640b", // Catppuccin Latte peach
  },
  number: {
    color: "#fe640b",
  },
  selector: {
    color: "#40a02b", // Catppuccin Latte green
  },
  "attr-name": {
    color: "#40a02b",
  },
  string: {
    color: "#40a02b",
  },
  char: {
    color: "#40a02b",
  },
  builtin: {
    color: "#40a02b",
  },
  inserted: {
    color: "#40a02b",
  },
  operator: {
    color: "#04a5e5", // Catppuccin Latte sky
  },
  entity: {
    color: "#04a5e5",
    cursor: "help" as const,
  },
  url: {
    color: "#04a5e5",
  },
  ".language-css .token.string": {
    color: "#04a5e5",
  },
  ".style .token.string": {
    color: "#04a5e5",
  },
  atrule: {
    color: "#df8e1d", // Catppuccin Latte yellow
  },
  "attr-value": {
    color: "#df8e1d",
  },
  function: {
    color: "#1e66f5", // Catppuccin Latte blue
  },
  "class-name": {
    color: "#1e66f5",
  },
  keyword: {
    color: "#8839ef", // Catppuccin Latte mauve
  },
  regex: {
    color: "#ea76cb", // Catppuccin Latte pink
  },
  important: {
    color: "#ea76cb",
    fontWeight: "bold" as const,
  },
  variable: {
    color: "#ea76cb",
  },
  bold: {
    fontWeight: "bold" as const,
  },
  italic: {
    fontStyle: "italic" as const,
  },
  // Additional tokens for better C++ support
  "type-class-name": {
    color: "#1e66f5", // Catppuccin Latte blue
  },
  generic: {
    color: "#1e66f5",
  },
  "function-definition": {
    color: "#1e66f5",
  },
  parameter: {
    color: "#4c4f69",
  },
  directive: {
    color: "#ea76cb", // Catppuccin Latte pink
  },
  "directive-hash": {
    color: "#ea76cb",
  },
  macro: {
    color: "#fe640b", // Catppuccin Latte peach
  },
  "cpp-include": {
    color: "#ea76cb",
  },
};

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Select the appropriate theme based on the current mode
  const catppuccinTheme = isDark ? catppuccinMochaTheme : catppuccinLatteTheme;
  const backgroundColor = isDark ? "#1e1e2e" : "#eff1f5";
  const textColor = isDark ? "#cdd6f4" : "#4c4f69";

  // Extract language from className, handling both "language-xxx" and "hljs language-xxx" patterns
  const extractLanguage = (className?: string) => {
    if (!className) return "text";
    const regex = /language-(\w+)/;
    const match = regex.exec(className);
    const lang = match ? match[1] : "text";

    // Map common language aliases to supported languages
    const languageMap: Record<string, string> = {
      cpp: "cpp",
      "c++": "cpp",
      cxx: "cpp",
      cc: "cpp",
      javascript: "javascript",
      js: "javascript",
      typescript: "typescript",
      ts: "typescript",
      python: "python",
      py: "python",
      java: "java",
      c: "c",
      csharp: "csharp",
      cs: "csharp",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      swift: "swift",
      kotlin: "kotlin",
      scala: "scala",
      bash: "bash",
      shell: "bash",
      sh: "bash",
      json: "json",
      xml: "xml",
      html: "markup",
      css: "css",
      sql: "sql",
      yaml: "yaml",
      yml: "yaml",
      markdown: "markdown",
      md: "markdown",
    };

    const mappedLang = languageMap[lang?.toLowerCase() ?? ""] ?? lang ?? "text";
    console.log(
      `Language detection: className="${className}", extracted="${lang}", mapped="${mappedLang}", theme="${resolvedTheme}"`,
    );
    return mappedLang;
  };
  const language = extractLanguage(className);

  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);

  // Extract text content from the DOM after rendering
  useEffect(() => {
    if (codeRef.current) {
      const textContent =
        codeRef.current.textContent ?? codeRef.current.innerText ?? "";
      setCodeContent(textContent.replace(/\n$/, ""));
      console.log(
        `Code content extracted for language "${language}":`,
        textContent.slice(0, 100) + "...",
      );
    }
  }, [children, language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      // Reset the checkmark after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const downloadCode = () => {
    const blob = new Blob([codeContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleWordWrap = () => {
    setIsWordWrapEnabled(!isWordWrapEnabled);
  };

  return (
    <div className="border-border bg-card relative mb-4 overflow-hidden rounded-lg border">
      {/* Top Header Strip */}
      <div className="border-border bg-muted/50 flex items-center justify-between border-b px-4 py-1">
        <span className="text-muted-foreground text-sm font-medium select-none">
          {language}
        </span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-7 w-7 rounded p-0 transition-colors"
            title="Download code"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleWordWrap}
            className={`hover:bg-accent hover:text-accent-foreground h-7 w-7 rounded p-0 transition-colors ${
              isWordWrapEnabled ? "text-primary" : "text-muted-foreground"
            }`}
            title={isWordWrapEnabled ? "Disable word wrap" : "Enable word wrap"}
          >
            <WrapText className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className={`hover:bg-accent hover:text-accent-foreground h-7 w-7 rounded p-0 transition-colors ${
              isCopied ? "text-green-500" : "text-muted-foreground"
            }`}
            title={isCopied ? "Copied!" : "Copy code"}
          >
            {isCopied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      {/* Code content */}
      <div className="bg-sidebar">
        {/* Hidden div to extract text content */}
        <div ref={codeRef} style={{ display: "none" }}>
          {children}
        </div>
        <SyntaxHighlighter
          language={language}
          style={catppuccinTheme}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            color: textColor,
          }}
          codeTagProps={{
            style: {
              background: "transparent",
              color: "inherit",
              padding: 0,
              margin: 0,
              border: "none",
              outline: "none",
              boxShadow: "none",
            },
          }}
          showLineNumbers={false}
          wrapLines={isWordWrapEnabled}
          wrapLongLines={isWordWrapEnabled}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 border-b pb-2 text-2xl font-bold">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-3 text-xl font-bold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-lg font-bold">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-3 mb-2 text-base font-bold">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="mt-2 mb-1 text-sm font-bold">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="mt-2 mb-1 text-xs font-bold">{children}</h6>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-8 list-outside list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-8 list-outside list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-2">{children}</li>,

          // Code blocks - intercept at code level for better detection
          pre: ({ children, ...props }) => {
            // For code blocks, we'll handle them at the code level
            return <div>{children}</div>;
          },
          code: ({ children, className, ...props }) => {
            // Check if this is inline code (no className)
            if (!className) {
              return (
                <code className="bg-muted/50 rounded px-1.5 py-0.5 font-mono text-sm">
                  {children}
                </code>
              );
            }

            // Check if this is a language-specific code block
            // Handle both "language-xxx" and "hljs language-xxx" patterns
            if (
              className &&
              (className.startsWith("language-") ||
                className.includes("language-"))
            ) {
              console.log("Rendering CodeBlock with className:", className);
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }

            // Fallback for other code
            return <code className={className}>{children}</code>;
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-border text-muted-foreground mb-4 border-l-4 pl-4 italic">
              {children}
            </blockquote>
          ),

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              {children}
            </a>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="mb-4 h-auto max-w-full rounded-lg"
            />
          ),

          // Tables
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="border-border min-w-full border-collapse border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-border border px-4 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-border border px-4 py-2">{children}</td>
          ),

          // Horizontal rule
          hr: () => <hr className="border-border my-6 border-t" />,

          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

          // Strikethrough
          del: ({ children }) => <del className="line-through">{children}</del>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
