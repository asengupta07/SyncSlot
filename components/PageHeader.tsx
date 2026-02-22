"use client";

import { AuthHeader } from "@/components/AuthHeader";

interface PageHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({ backHref, backLabel }: PageHeaderProps) {
  return <AuthHeader backHref={backHref} backLabel={backLabel} />;
}
