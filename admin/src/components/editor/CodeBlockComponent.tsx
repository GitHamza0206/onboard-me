// src/components/editor/CodeBlockComponent.tsx

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'
import { cn } from "@/lib/utils";

interface NodeAttributes {
  language: string;
}

interface NodeParameter {
  node: {
    attrs: NodeAttributes;
  };
  updateAttributes: (attributes: { language: string }) => void;
  extension: any;
}

export const CodeBlockComponent = ({ node: { attrs: { language: defaultLanguage } }, updateAttributes, extension }: NodeParameter) => (
  <NodeViewWrapper className="relative group">
    <select 
      contentEditable={false} 
      defaultValue={defaultLanguage} 
      onChange={event => updateAttributes({ language: event.target.value })}
      className={cn(
        "absolute top-2 right-2 text-xs rounded-md border border-input bg-background",
        "focus:ring-1 focus:ring-ring"
      )}
    >
      <option value="null">auto</option>
      <option disabled>—</option>
      {extension.options.lowlight.listLanguages().map((lang: any, index: number) => (
        <option key={index} value={lang}>
          {lang}
        </option>
      ))}
    </select>
    <pre>
      <NodeViewContent as="code" />
    </pre>
  </NodeViewWrapper>
)