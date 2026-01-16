"use client";

import { useEffect, useRef } from "react";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  EditorState,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  Redo,
  Undo,
} from "lucide-react";

import { Button } from "./button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

// Toolbar Plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatCode = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const handleUndo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const handleRedo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <div className="flex items-center gap-1 border-b bg-muted/50 p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleUndo}
        className="size-8 p-0"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRedo}
        className="size-8 p-0"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="size-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBold}
        className="size-8 p-0"
        title="Bold (Ctrl+B)"
      >
        <Bold className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatItalic}
        className="size-8 p-0"
        title="Italic (Ctrl+I)"
      >
        <Italic className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatCode}
        className="size-8 p-0"
        title="Code (Ctrl+E)"
      >
        <Code className="size-4" />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBulletList}
        className="size-8 p-0"
        title="Bullet List"
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatNumberedList}
        className="size-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="size-4" />
      </Button>
    </div>
  );
}

// Plugin to set initial markdown value
function InitialValuePlugin({ value }: { value: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (value && !initializedRef.current) {
      editor.update(() => {
        $convertFromMarkdownString(value, TRANSFORMERS);
      });
      initializedRef.current = true;
    }
  }, [editor, value]);

  return null;
}

// Plugin to handle onChange and convert to markdown
function OnChangeMarkdownPlugin({
  onChange,
}: {
  onChange: (markdown: string) => void;
}) {
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      onChange(markdown);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  rows = 5,
  className = "",
}: MarkdownEditorProps) {
  const initialConfig = {
    namespace: "MarkdownEditor",
    theme: {
      paragraph: "mb-2",
      text: {
        bold: "font-bold",
        italic: "italic",
        code: "bg-muted px-1 py-0.5 rounded text-sm font-mono",
      },
      list: {
        ul: "list-disc list-inside mb-2",
        ol: "list-decimal list-inside mb-2",
        listitem: "ml-4",
      },
      code: "bg-muted p-2 rounded font-mono text-sm block mb-2",
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error(error);
    },
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative bg-background">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="outline-none p-4 min-h-30 prose prose-sm dark:prose-invert max-w-none"
                style={{ minHeight: `${rows * 1.5}rem` }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <InitialValuePlugin value={value} />
          <OnChangeMarkdownPlugin onChange={onChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}
