//see docs: https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/

import { EntryProps } from "contentful-management";

export type PublishStatus = "draft" | "changed" | "published" | "archived" | "deleted";

function isDraft(entity: EntryProps) {
    return !entity.sys.publishedVersion
}

function isChanged(entity: EntryProps) {
    return !!entity.sys.publishedVersion &&
      entity.sys.version >= entity.sys.publishedVersion + 2
}

function isPublished(entity: EntryProps) {
    return !!entity.sys.publishedVersion &&
      entity.sys.version === entity.sys.publishedVersion + 1
}

function isArchived(entity: EntryProps) {
    return !!entity.sys.archivedVersion
}

const getEntryStatus = (entity: EntryProps): PublishStatus => {
    if (isDraft(entity)) {
      return 'draft'
    }
    if (isChanged(entity)) {
      return 'changed'
    }
    if (isPublished(entity)) {
      return 'published'
    }
    if (isArchived(entity)) {
      return 'archived'
    }
    return 'deleted'
}

export default getEntryStatus;