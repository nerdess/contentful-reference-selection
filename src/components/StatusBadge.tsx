import { Badge, BadgeVariant } from "@contentful/f36-components";
import {PublishStatus } from "../lib/utils/getEntryStatus";

const MAPPING: Record<PublishStatus, BadgeVariant> = {
    draft: 'warning',
    changed: 'primary',
    published: 'positive',
    archived: 'negative',
    deleted: 'negative',
};

const StatusBadge = ({ 
    status 
}: {
    status: PublishStatus
}) => {

    const variant: BadgeVariant = MAPPING[status] || "secondary";

    return <Badge variant={variant} size="default">{status}</Badge>;
  };

export default StatusBadge;