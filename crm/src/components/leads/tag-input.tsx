"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function TagInput({
  name,
  defaultValue = [],
  placeholder,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [valor, setValor] = useState("");

  function adicionar() {
    const v = valor.trim();
    if (v && !tags.includes(v)) setTags((prev) => [...prev, v]);
    setValor("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      adicionar();
    } else if (e.key === "Backspace" && !valor && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5">
      {tags.map((t) => (
        <Badge key={t} variant="secondary" className="gap-1">
          {t}
          <input type="hidden" name={name} value={t} />
          <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={adicionar}
        placeholder={tags.length === 0 ? placeholder : undefined}
        className="min-w-24 flex-1 border-none bg-transparent py-0.5 text-sm outline-none"
      />
    </div>
  );
}
