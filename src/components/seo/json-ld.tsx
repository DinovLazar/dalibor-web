/**
 * JsonLd — server component that safely renders one or more JSON-LD <script>
 * tags into the document. Feed it the plain objects produced by the builders in
 * `@/lib/seo/jsonld`.
 *
 * Not a client component (no interactivity): it only emits static markup.
 */

type JsonLdData = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => {
        // JSON.stringify already drops `undefined` fields. Escape "<" so a
        // value containing "</script>" can't break out of the tag.
        const safe = JSON.stringify(item).replace(/</g, "\\u003c");
        const type = typeof item["@type"] === "string" ? item["@type"] : "ld";

        return (
          <script
            key={`${type}-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safe }}
          />
        );
      })}
    </>
  );
}
