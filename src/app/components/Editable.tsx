import { useEffect, useRef, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useElements, ElementMeta } from "../ElementsContext";

type Props = {
  id: string;
  page: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

export function Editable({
  id, page, label, defaultValue, multiline, className, as = "span",
}: Props) {
  const { register, get, set, editMode, isAdmin } = useElements();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const meta: ElementMeta = { id, page, label, defaultValue, multiline };
    register(meta);
  }, [id, page, label, defaultValue, multiline, register]);

  const value = get(id, defaultValue);
  const showOverlay = isAdmin && editMode;

  const start = () => { setDraft(value); setEditing(true); };
  const save = () => { set(id, draft); setEditing(false); };
  const cancel = () => setEditing(false);

  if (editing) {
    return (
      <span className="inline-flex items-start gap-1 align-baseline">
        {multiline ? (
          <textarea
            autoFocus
            ref={(r) => (ref.current = r)}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="px-2 py-1 rounded border border-blue-500 bg-white dark:bg-slate-900 outline-none w-[min(420px,80vw)]"
          />
        ) : (
          <input
            autoFocus
            ref={(r) => (ref.current = r)}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
            className="px-2 py-0.5 rounded border border-blue-500 bg-white dark:bg-slate-900 outline-none min-w-[120px]"
          />
        )}
        <button onClick={save} className="size-6 rounded bg-emerald-600 text-white flex items-center justify-center" title="Save">
          <Check className="size-3.5" />
        </button>
        <button onClick={cancel} className="size-6 rounded bg-slate-300 dark:bg-slate-700 flex items-center justify-center" title="Cancel">
          <X className="size-3.5" />
        </button>
      </span>
    );
  }

  const Tag = as as keyof JSX.IntrinsicElements;
  if (showOverlay) {
    return (
      <Tag
        className={`${className || ""} relative inline-block group cursor-text outline outline-1 outline-dashed outline-blue-400/50 hover:outline-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded px-0.5`}
        onClick={(e) => { e.stopPropagation(); start(); }}
        title={`Edit: ${label}`}
      >
        {value}
        <span className="opacity-0 group-hover:opacity-100 absolute -top-2 -end-2 size-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
          <Pencil className="size-2.5" />
        </span>
      </Tag>
    );
  }

  return <Tag className={className}>{value}</Tag>;
}
