/**
 * Server component that emits one or more JSON-LD blocks.
 * Rendered in server layouts so structured data is in the initial HTML
 * (crawlable by Google, Bing and AI answer engines without JS).
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema is fully controlled (no user input) → safe to inline.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
