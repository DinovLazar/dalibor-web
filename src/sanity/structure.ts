import {type StructureResolver} from "sanity/structure";

/**
 * Studio desk structure. `book` and `author` are singletons — each opens one
 * fixed document (documentId pinned), so editors never create duplicates. The
 * matching create/delete restrictions live in sanity.config.ts. The seed
 * imports these with `_id: "book"` / `_id: "author"` to line up.
 */

const SINGLETONS = [
  {id: "book", type: "book", title: "Book (Dalibor's own)"},
  {id: "author", type: "author", title: "Author profile"},
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Reviews")
        .schemaType("review")
        .child(S.documentTypeList("review").title("Reviews")),
      S.listItem()
        .title("Blog posts")
        .schemaType("post")
        .child(S.documentTypeList("post").title("Blog posts")),
      S.listItem()
        .title("Topics")
        .schemaType("topic")
        .child(S.documentTypeList("topic").title("Topics")),
      S.divider(),
      ...SINGLETONS.map(({id, type, title}) =>
        S.listItem()
          .title(title)
          .id(id)
          .child(S.document().schemaType(type).documentId(id).title(title)),
      ),
    ]);
