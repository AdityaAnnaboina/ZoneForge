"use client";

import React from "react";
import { Network } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function ResolverPage() {
  return (
    <ComingSoon
      title="Resolver"
      description="Configure DNS resolution between your VPC and your network."
      icon={Network}
    />
  );
}
