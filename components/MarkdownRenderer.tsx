import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-slate prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            // Custom components to ensure math scrolls on mobile
            p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-800 dark:text-slate-200" {...props} />,
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-slate-900 dark:text-white border-b pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-100" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-100" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="text-slate-700 dark:text-slate-300" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 py-2 pr-2 rounded-r" {...props} />,
            code: ({node, inline, className, children, ...props}: any) => {
                 return inline ? (
                    <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
                        {children}
                    </code>
                 ) : (
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto mb-4">
                        <code className={className} {...props}>
                            {children}
                        </code>
                    </pre>
                 );
            }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
