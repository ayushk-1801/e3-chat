"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Download, WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useState, useRef, useEffect } from "react";
import "highlight.js/styles/github-dark.css";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  // Extract language from className, handling both "language-xxx" and "hljs language-xxx" patterns
  const extractLanguage = (className?: string) => {
    if (!className) return "text";
    const match = className.match(/language-(\w+)/);
    return match ? match[1] : "text";
  };
  const language = extractLanguage(className);
  
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(false);
  const [codeContent, setCodeContent] = useState('');
  const codeRef = useRef<HTMLDivElement>(null);
  
  // Extract text content from the DOM after rendering
  useEffect(() => {
    if (codeRef.current) {
      const textContent = codeRef.current.textContent || codeRef.current.innerText || '';
      setCodeContent(textContent.replace(/\n$/, ""));
    }
  }, [children]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      toast.success("Code copied to clipboard!");
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
    <div className="relative mb-4 overflow-hidden rounded-lg border border-border bg-card">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-1">
        <span className="text-sm font-medium text-muted-foreground select-none">
          {language}
        </span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="h-7 w-7 rounded p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Download code"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
                      <Button
              variant="ghost"
              size="sm"
              onClick={toggleWordWrap}
              className={`h-7 w-7 rounded p-0 transition-colors hover:bg-accent hover:text-accent-foreground ${
                isWordWrapEnabled ? 'text-primary' : 'text-muted-foreground'
              }`}
              title={isWordWrapEnabled ? "Disable word wrap" : "Enable word wrap"}
            >
              <WrapText className="h-3.5 w-3.5" />
            </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 w-7 rounded p-0 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Copy code"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {/* Code content */}
      <div className="bg-gray-900">
        {/* Hidden div to extract text content */}
        <div ref={codeRef} style={{ display: 'none' }}>
          {children}
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            color: "#e5e7eb", // Ensure proper text color
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
            }
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
            <ul className="mb-4 list-inside list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-inside list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="ml-4">{children}</li>,

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
            if (className && (className.startsWith("language-") || className.includes("language-"))) {
              console.log("Rendering CodeBlock with className:", className);
              return (
                <CodeBlock className={className}>
                  {children}
                </CodeBlock>
              );
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
