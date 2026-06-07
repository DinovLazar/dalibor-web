import {type SchemaTypeDefinition} from "sanity";

import {author} from "./author";
import {blockContent} from "./blockContent";
import {book} from "./book";
import {localizedBlockContent, localizedImage, localizedString, localizedText} from "./localized";
import {post} from "./post";
import {review} from "./review";
import {topic} from "./topic";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  post,
  review,
  book,
  author,
  topic,
  // Shared object / array types
  blockContent,
  localizedString,
  localizedText,
  localizedBlockContent,
  localizedImage,
];
