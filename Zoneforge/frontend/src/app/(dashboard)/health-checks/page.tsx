"use client";

import React from "react";
import { HeartPulse } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function HealthChecksPage() {
  return (
    <ComingSoon
      title="Health Checks"
      description="Create and manage health checks to monitor your endpoints."
      icon={HeartPulse}
    />
  );
}
