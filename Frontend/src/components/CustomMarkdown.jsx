import React, { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Typewriter from "./Typewriter";

const CustomMarkdown = ({ text, msg, messages, isTyping, setIsTyping }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  // Clean and preprocess the markdown text
  const cleanedText = useMemo(() => {
    if (!text) return '';
    
    // Fix common markdown issues
    let cleaned = text
      // Fix malformed code blocks like "```javascriptCopy" or "```codeCopy"
      .replace(/```(\w+)Copy\s*```/g, (match, lang) => {
        return `\`\`\`${lang}\n// Code block was empty\n\`\`\``;
      })
      // Fix empty code blocks
      .replace(/```\s*```/g, '```\n// Empty code block\n```')
      // Fix inline code that might be malformed
      .replace(/`([^`]*Copy[^`]*)`/g, (match, content) => {
        return `\`${content.replace(/Copy/g, '')}\``;
      })
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Fix cases where code blocks don't have proper language specification
      .replace(/```\n([^`]+)\n```/g, (match, code) => {
        // Try to detect language from content
        if (code.includes('console.log') || code.includes('function') || code.includes('const ') || code.includes('let ')) {
          return `\`\`\`javascript\n${code}\n\`\`\``;
        }
        if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
          return `\`\`\`python\n${code}\n\`\`\``;
        }
        return `\`\`\`\n${code}\n\`\`\``;
      });
    
    return cleaned;
  }, [text]);

  // Memoize the check for whether this is the last message
  const isLastMessage = useMemo(() => {
    return msg === messages[messages.length - 1];
  }, [msg, messages]);

  // Improved copy functionality with error handling and feedback
  const handleCopyCode = useCallback(async (code, codeId) => {
    try {
      // Clean the code before copying
      const cleanCode = code.replace(/^\/\/ Code block was empty$/gm, '').trim();
      await navigator.clipboard.writeText(cleanCode);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedCode(codeId);
        setTimeout(() => setCopiedCode(null), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  }, []);

  // Typewriter wrapper component for better reusability
  const TypewriterText = useCallback(({ children, onComplete }) => {
    if (typeof children !== 'string') {
      return <>{children}</>;
    }
    
    return (
      <Typewriter
        text={children}
        onComplete={onComplete}
      />
    );
  }, []);

  // Determine if content should use typewriter effect
  const shouldUseTypewriter = useCallback((content) => {
    return isTyping && isLastMessage && !msg?.pending && typeof content === 'string';
  }, [isTyping, isLastMessage, msg?.pending]);

  const components = useMemo(() => ({
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      let language = match ? match[1] : "";
      
      // Clean up language detection
      if (language && language.includes('Copy')) {
        language = language.replace('Copy', '');
      }
      
      const code = String(children).replace(/\n$/, "");
      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

      // Handle empty or placeholder code
      if (!code || code.trim() === '' || code.includes('Code block was empty')) {
        if (inline) {
          return (
            <code className="bg-gray-700 px-2 py-1 rounded text-sm text-gray-400 font-mono" {...props}>
              {code || '[empty]'}
            </code>
          );
        }
        return (
          <div className="my-3 p-3 bg-gray-800 rounded-md border border-gray-600">
            <span className="text-gray-500 italic text-sm">Empty code block</span>
          </div>
        );
      }

      return !inline ? (
        <div className="relative group my-3" role="region" aria-label="Code block">
          <div className="flex justify-between items-center bg-gray-700 px-3 py-1 text-xs text-gray-300 rounded-t-md border-b border-gray-600">
            <span className="font-mono" aria-label={`Code language: ${language || "plain text"}`}>
              {language || "code"}
            </span>
            <button
              onClick={() => handleCopyCode(code, codeId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCopyCode(code, codeId);
                }
              }}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:text-white focus:text-white flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700 rounded px-2 py-1"
              title={copiedCode === codeId ? "Copied!" : "Copy code"}
              aria-label={copiedCode === codeId ? "Code copied to clipboard" : "Copy code to clipboard"}
            >
              <i className={copiedCode === codeId ? "ri-check-line" : "ri-file-copy-line"}></i>
              {copiedCode === codeId ? "Copied!" : "Copy"}
            </button>
          </div>
          <SyntaxHighlighter
            style={atomDark}
            language={language || "text"}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: "0 0 6px 6px",
              fontSize: "14px",
              lineHeight: "1.5",
            }}
            showLineNumbers={code.split('\n').length > 3}
            wrapLines={true}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className="bg-gray-700 px-2 py-1 rounded text-sm text-green-300 font-mono border-0" 
          {...props}
        >
          {shouldUseTypewriter(String(children)) ? (
            <TypewriterText onComplete={() => setIsTyping(false)}>
              {String(children)}
            </TypewriterText>
          ) : (
            children
          )}
        </code>
      );
    },
    
    p: ({ children }) => {
      if (msg?.pending) {
        return (
          <p className="mb-3 leading-relaxed text-gray-200">
            <span className="flex gap-2 items-center">
              <span>Thinking</span>
              <span className="loading animate-pulse">...</span>
            </span>
          </p>
        );
      }
      
      return (
        <p className="mb-3 leading-relaxed text-gray-200">
          {shouldUseTypewriter(String(children)) ? (
            <TypewriterText onComplete={() => setIsTyping(false)}>
              {String(children)}
            </TypewriterText>
          ) : (
            children
          )}
        </p>
      );
    },
    
    ul: ({ children }) => (
      <ul className="list-disc ml-6 mb-3 space-y-1 text-gray-200" role="list">
        {children}
      </ul>
    ),
    
    ol: ({ children }) => (
      <ol className="list-decimal ml-6 mb-3 space-y-1 text-gray-200" role="list">
        {children}
      </ol>
    ),
    
    li: ({ children }) => (
      <li className="text-gray-200 leading-relaxed" role="listitem">
        {children}
      </li>
    ),
    
    strong: ({ children }) => (
      <strong className="font-bold text-white">
        {children}
      </strong>
    ),
    
    em: ({ children }) => (
      <em className="italic text-gray-300">
        {children}
      </em>
    ),
    
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-3 mt-4 text-blue-300 border-b border-gray-600 pb-2">
        {children}
      </h1>
    ),
    
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mb-3 mt-4 text-blue-300">
        {children}
      </h2>
    ),
    
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mb-2 mt-3 text-blue-300">
        {children}
      </h3>
    ),
    
    h4: ({ children }) => (
      <h4 className="text-md font-bold mb-2 mt-3 text-blue-400">
        {children}
      </h4>
    ),
    
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-gray-800 italic text-gray-300" role="blockquote">
        {children}
      </blockquote>
    ),
    
    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-gray-600" role="table">
          {children}
        </table>
      </div>
    ),
    
    thead: ({ children }) => (
      <thead className="bg-gray-700" role="rowgroup">
        {children}
      </thead>
    ),
    
    tbody: ({ children }) => (
      <tbody className="bg-gray-800" role="rowgroup">
        {children}
      </tbody>
    ),
    
    tr: ({ children }) => (
      <tr className="border-b border-gray-600" role="row">
        {children}
      </tr>
    ),
    
    td: ({ children }) => (
      <td className="px-3 py-2 text-gray-200 border border-gray-600" role="cell">
        {children}
      </td>
    ),
    
    th: ({ children }) => (
      <th className="px-3 py-2 text-white font-bold border border-gray-600" role="columnheader">
        {children}
      </th>
    ),
    
    hr: () => <hr className="my-4 border-gray-600" role="separator" />,
    
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 focus:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded underline decoration-blue-400 underline-offset-2"
        aria-label={`External link: ${children}`}
      >
        {children}
      </a>
    ),
    
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt || "Image"}
        className="max-w-full h-auto rounded-lg my-3"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
          console.error('Image failed to load:', src);
        }}
      />
    ),
    
    pre: ({ children }) => (
      <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto text-sm text-gray-200 my-3">
        {children}
      </pre>
    ),
    
  }), [handleCopyCode, copiedCode, shouldUseTypewriter, TypewriterText, setIsTyping]);

  // Error boundary for the markdown rendering
  try {
    return (
      <div className="markdown-content prose prose-invert max-w-none" role="article">
        <ReactMarkdown 
          components={components}
          skipHtml={false}
          remarkPlugins={[]}
          rehypePlugins={[]}
        >
          {cleanedText}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return (
      <div className="text-red-400 p-3 bg-red-900/20 rounded-lg">
        <strong>Error rendering content:</strong>
        <br />
        <code className="text-sm">{error.message}</code>
      </div>
    );
  }
};

export default React.memo(CustomMarkdown);