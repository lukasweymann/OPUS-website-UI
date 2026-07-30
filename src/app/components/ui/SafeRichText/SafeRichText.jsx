import React from "react";

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "br",
  "code",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "sub",
  "sup",
  "ul",
]);

const VOID_TAGS = new Set(["br"]);
const DROP_CONTENT_TAGS = ["script", "style", "iframe", "object", "embed", "svg", "math"];

const ENTITIES = {
  amp: "&",
  apos: "'",
  copy: "\u00a9",
  gt: ">",
  hellip: "\u2026",
  laquo: "\u00ab",
  ldquo: "\u201c",
  lsquo: "'",
  mdash: "\u2014",
  nbsp: " ",
  ndash: "\u2013",
  quot: '"',
  raquo: "\u00bb",
  rdquo: "\u201d",
  reg: "\u00ae",
  rsquo: "'",
  lt: "<",
};

function decodeHtmlEntities(value = "") {
  return String(value).replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (_, entity) => {
    const lower = entity.toLowerCase();
    if (lower[0] === "#") {
      const isHex = lower[1] === "x";
      const code = Number.parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      if (Number.isFinite(code)) return String.fromCodePoint(code);
      return "";
    }
    return ENTITIES[lower] ?? `&${entity};`;
  });
}

function stripDroppedContent(html) {
  let cleaned = String(html ?? "");
  for (const tag of DROP_CONTENT_TAGS) {
    cleaned = cleaned.replace(
      new RegExp(`<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*${tag}\\s*>`, "gi"),
      "",
    );
  }
  return cleaned.replace(/<!--[\s\S]*?-->/g, "");
}

function parseAttributes(raw = "") {
  const attrs = {};
  const attrRe = /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attrRe.exec(raw))) {
    const name = match[1]?.toLowerCase();
    if (!name) continue;
    attrs[name] = decodeHtmlEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function isSafeHref(rawHref = "") {
  const href = rawHref.replace(/[\u0000-\u001f\u007f\s]+/g, "").trim();
  if (!href) return false;

  const lower = href.toLowerCase();
  if (lower.startsWith("#") || lower.startsWith("/") || lower.startsWith("./") || lower.startsWith("../")) {
    return true;
  }

  try {
    const url = new URL(href, "https://opus.nlpl.eu/");
    if (!href.includes(":")) return true;
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function propsForTag(tag, rawAttrs) {
  if (tag !== "a") return {};

  const attrs = parseAttributes(rawAttrs);
  if (!isSafeHref(attrs.href)) return {};

  const props = {
    href: attrs.href,
    rel: "noopener noreferrer",
  };

  if (attrs.title) props.title = attrs.title;
  if (attrs.target === "_blank") props.target = "_blank";

  return props;
}

function parseSafeNodes(html) {
  const root = { tag: null, props: {}, children: [] };
  const stack = [root];
  const tagRe = /<[^>]*>/g;
  const source = stripDroppedContent(html);
  let index = 0;
  let match;

  function appendText(text) {
    if (!text) return;
    stack[stack.length - 1].children.push(decodeHtmlEntities(text));
  }

  while ((match = tagRe.exec(source))) {
    appendText(source.slice(index, match.index));
    index = tagRe.lastIndex;

    const token = match[0];
    const inner = token.slice(1, -1).trim();
    if (!inner || inner[0] === "!" || inner[0] === "?") continue;

    const isClosing = inner[0] === "/";
    const body = isClosing ? inner.slice(1).trim() : inner;
    const tagMatch = /^([a-z][a-z0-9-]*)([\s\S]*)$/i.exec(body);
    if (!tagMatch) continue;

    const tag = tagMatch[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) continue;

    if (isClosing) {
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const rawAttrs = tagMatch[2] ?? "";
    const node = { tag, props: propsForTag(tag, rawAttrs), children: [] };
    stack[stack.length - 1].children.push(node);

    if (!VOID_TAGS.has(tag) && !rawAttrs.trim().endsWith("/")) {
      stack.push(node);
    }
  }

  appendText(source.slice(index));
  return root.children;
}

function renderNode(node, key) {
  if (typeof node === "string") return node;
  if (node.tag === "br") return React.createElement("br", { key });
  return React.createElement(
    node.tag,
    { ...node.props, key },
    node.children.map((child, index) => renderNode(child, `${key}-${index}`)),
  );
}

export default function SafeRichText({ as: Component = "div", className, html = "" }) {
  return (
    <Component className={className}>
      {parseSafeNodes(html).map((node, index) => renderNode(node, `safe-rich-text-${index}`))}
    </Component>
  );
}
