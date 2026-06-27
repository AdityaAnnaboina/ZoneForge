"use client";

import React from "react";
import { Settings } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function ProfilesPage() {
  return (
    <ComingSoon
      title="Profiles"
      description="Create and share Resolver configurations."
      icon={Settings}
    />
  );
}
