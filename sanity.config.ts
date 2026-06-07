import {visionTool} from "@sanity/vision";
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";

import {apiVersion, dataset, projectId} from "./src/sanity/env";
import {schemaTypes} from "./src/sanity/schemaTypes";
import {structure} from "./src/sanity/structure";

/**
 * Embedded Sanity Studio, served by the Next app at /studio (basePath). Reads
 * project/dataset from env. `book` + `author` are enforced as singletons via
 * the desk structure (structure.ts) plus the create/delete restrictions below.
 */

const singletonTypes = new Set(["book", "author"]);

export default defineConfig({
  name: "default",
  title: "Dalibor Plečić Website",
  basePath: "/studio",

  projectId,
  dataset,

  schema: {
    types: schemaTypes,
    // Remove the singletons from the global "create new document" templates.
    templates: (templates) =>
      templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Singletons may be published / edited but not duplicated, deleted, or unpublished.
    actions: (input, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? input.filter(
            ({action}) =>
              action !== "duplicate" &&
              action !== "delete" &&
              action !== "unpublish",
          )
        : input,
    // Hide singletons from the global "+ New" menu.
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === "global"
        ? prev.filter((item) => !singletonTypes.has(item.templateId))
        : prev,
  },

  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
});
