"use client";

import React from "react";
import { LayoutDashboard } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function DashboardPage() {
  return (
    <ComingSoon
      title="Dashboard"
      description="Monitor your Route53 resources and health status at a glance."
      icon={LayoutDashboard}
    />
  );
}
