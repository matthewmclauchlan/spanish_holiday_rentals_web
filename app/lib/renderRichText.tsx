// app/lib/renderRichText.tsx
import React from 'react';

type RichTextNode = {
  nodeType: string;
  content?: (RichTextNode | string)[];
  value?: string;
  data?: {
    uri?: string;
  };
  id?: string;
};

const getKey = (node: RichTextNode | string, index: number): string =>
  typeof node === 'string' ? `text-${index}` : node.id ?? `node-${index}`;

const renderRichText = (node: RichTextNode | string): React.ReactNode => {
  if (!node) return null;

  if (typeof node === 'string') return node;

  switch (node.nodeType) {
    case 'document':
      return node.content?.map((child, index) => (
        <React.Fragment key={getKey(child, index)}>
          {renderRichText(child)}
        </React.Fragment>
      ));
    case 'paragraph':
      return (
        <p key={node.id ?? Math.random().toString()} className="mb-4">
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </p>
      );
    case 'heading-1':
      return (
        <h1 key={node.id ?? Math.random().toString()} className="text-3xl font-bold my-4">
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </h1>
      );
    case 'heading-2':
      return (
        <h2 key={node.id ?? Math.random().toString()} className="text-2xl font-bold my-4">
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </h2>
      );
    case 'unordered-list':
      return (
        <ul key={node.id ?? Math.random().toString()} className="list-disc ml-6 my-4">
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </ul>
      );
    case 'ordered-list':
      return (
        <ol key={node.id ?? Math.random().toString()} className="list-decimal ml-6 my-4">
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </ol>
      );
    case 'list-item':
      return (
        <li key={node.id ?? Math.random().toString()} className="my-2">
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </li>
      );
    case 'hyperlink': {
      const url = node.data?.uri;
      return (
        <a
          key={node.id ?? Math.random().toString()}
          href={url}
          className="text-blue-500 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.content?.map((child, index) => (
            <React.Fragment key={getKey(child, index)}>
              {renderRichText(child)}
            </React.Fragment>
          ))}
        </a>
      );
    }
    case 'hr':
      return <hr key={node.id ?? Math.random().toString()} className="my-4" />;
    case 'text':
      return node.value;
    default:
      return null;
  }
};

export default renderRichText;
