import * as React from "react";

/**
 * Markdown-lite renderer (Slack/Teams/Telegram-style). Safe: builds React nodes,
 * never uses dangerouslySetInnerHTML. Supports code blocks, inline code, bold,
 * italic, strikethrough, http links, blockquotes, bullet lists and @mentions.
 */

const INLINE = new RegExp(
  [
    "(`[^`]+`)", // inline code
    "(\\*\\*[^*]+\\*\\*)", // **bold**
    "(~~[^~]+~~)", // ~~strike~~
    "(\\*[^*]+\\*)", // *italic*
    "(_[^_]+_)", // _italic_
    "(\\[[^\\]]+\\]\\([^)]+\\))", // [text](url)
    "(@[A-Za-z][\\w.-]*)", // @mention
  ].join("|"),
  "g",
);

function parseInline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  let i = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-surface px-1 font-mono text-base">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("~~")) {
      out.push(<s key={key}>{tok.slice(2, -2)}</s>);
    } else if (tok.startsWith("*")) {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("_")) {
      out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("[")) {
      const mm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      const label = mm?.[1] ?? tok;
      const url = mm?.[2] ?? "";
      if (/^https?:\/\//.test(url)) {
        out.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {label}
          </a>,
        );
      } else {
        out.push(label);
      }
    } else if (tok.startsWith("@")) {
      out.push(
        <span key={key} className="rounded-sm bg-surface px-1 font-medium text-accent">
          {tok}
        </span>,
      );
    } else {
      out.push(tok);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderRich(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/```/);
  const nodes: React.ReactNode[] = [];

  parts.forEach((part, pi) => {
    // Odd indexes are fenced code blocks.
    if (pi % 2 === 1) {
      nodes.push(
        <pre
          key={`code-${pi}`}
          className="my-1 overflow-x-auto rounded-md bg-surface p-2 font-mono text-base"
        >
          <code>{part.replace(/^\n/, "")}</code>
        </pre>,
      );
      return;
    }

    const lines = part.split("\n");
    let listBuf: string[] = [];
    let quoteBuf: string[] = [];

    const flushList = (k: string) => {
      if (listBuf.length === 0) return;
      nodes.push(
        <ul key={`ul-${k}`} className="ml-5 list-disc">
          {listBuf.map((li, idx) => (
            <li key={idx}>{parseInline(li, `li-${k}-${idx}`)}</li>
          ))}
        </ul>,
      );
      listBuf = [];
    };
    const flushQuote = (k: string) => {
      if (quoteBuf.length === 0) return;
      nodes.push(
        <blockquote
          key={`bq-${k}`}
          className="my-1 border-l-2 border-accent pl-2 text-muted"
        >
          {quoteBuf.map((q, idx) => (
            <div key={idx}>{parseInline(q, `bq-${k}-${idx}`)}</div>
          ))}
        </blockquote>,
      );
      quoteBuf = [];
    };

    lines.forEach((line, li) => {
      const k = `${pi}-${li}`;
      if (/^\s*[-*]\s+/.test(line)) {
        flushQuote(k);
        listBuf.push(line.replace(/^\s*[-*]\s+/, ""));
      } else if (/^\s*>\s?/.test(line)) {
        flushList(k);
        quoteBuf.push(line.replace(/^\s*>\s?/, ""));
      } else {
        flushList(k);
        flushQuote(k);
        if (line.trim() === "") {
          nodes.push(<span key={`br-${k}`} className="block h-1" />);
        } else {
          nodes.push(<div key={`ln-${k}`}>{parseInline(line, k)}</div>);
        }
      }
    });
    flushList(`end-${pi}`);
    flushQuote(`end-${pi}`);
  });

  return <div className="space-y-0.5">{nodes}</div>;
}
