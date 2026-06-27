"use client";

import React from "react";
import { GitBranch } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function TrafficPoliciesPage() {
  return (
    <ComingSoon
      title="Traffic Policies"
      description="Manage traffic policies to route DNS traffic."
      icon={GitBranch}
    />
  );
}
