"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dnsRecordsApi } from "@/lib/apiClient";
import { useNotificationStore } from "@/store/notificationStore";
import Modal from "../ui/Modal";
import { Loader2 } from "lucide-react";

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zoneId: string;
  zoneName: string;
}

const schema = z.object({
  name: z.string().min(1, "Record name is required"),
  type: z.enum(["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]),
  ttl: z.number().int().min(0).max(2147483647),
  value: z.string().min(1, "Value is required"),
  routing_policy: z.enum(["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue"]),
  comment: z.string().max(256, "Comment must be at most 256 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

const typeHelperText: Record<string, string> = {
  A: "Enter IPv4 address (e.g. 192.168.1.1)",
  AAAA: "Enter IPv6 address (e.g. 2001:db8::1)",
  CNAME: "Enter canonical name (e.g. example.com.)",
  MX: "Enter priority and mail server (e.g. 10 mail.example.com.)",
  TXT: "Enter text value (e.g. v=spf1 include:example.com ~all)",
  NS: "Enter name server (e.g. ns1.example.com.)",
};

const quickTtls = [
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "1 hour", value: 3600 },
  { label: "1 day", value: 86400 },
];

export default function CreateRecordModal({
  isOpen,
  onClose,
  onSuccess,
  zoneId,
  zoneName,
}: CreateRecordModalProps) {
  const queryClient = useQueryClient();
  const notificationStore = useNotificationStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: "A",
      ttl: 300,
      value: "",
      routing_policy: "Simple",
      comment: "",
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => dnsRecordsApi.createDNSRecord(zoneId, data),
    onSuccess: () => {
      notificationStore.success("DNS record created", "The DNS record has been successfully created.");
      queryClient.invalidateQueries({ queryKey: ["dns-records", zoneId] });
      queryClient.invalidateQueries({ queryKey: ["hosted-zone", zoneId] });
      onSuccess();
      reset();
      onClose();
    },
    onError: (err) => {
      const errorMsg = (err as { message?: string }).message || "An error occurred.";
      notificationStore.error("Failed to create", errorMsg);
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const getPlaceholder = () => {
    return typeHelperText[selectedType] || "Enter record value";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create DNS Record" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Record Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Record Name</label>
              <div className="flex items-center">
                <input
                  type="text"
                  {...register("name")}
                  className="flex-1 min-w-0 rounded-l-md border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder="www"
                  disabled={mutation.isPending}
                />
                <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm font-mono select-none">
                  .{zoneName}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Enter @ for zone apex (root domain)
              </span>
              {errors.name && (
                <span className="text-xs text-red-600">{errors.name.message}</span>
              )}
            </div>

            {/* Record Type */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Record Type</label>
              <select
                {...register("type")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                disabled={mutation.isPending}
              >
                <option value="A">A — IPv4 address</option>
                <option value="AAAA">AAAA — IPv6 address</option>
                <option value="CNAME">CNAME — Canonical name</option>
                <option value="TXT">TXT — Text record</option>
                <option value="MX">MX — Mail exchange</option>
                <option value="NS">NS — Name server</option>
                <option value="PTR">PTR — Pointer record</option>
                <option value="SRV">SRV — Service locator</option>
                <option value="CAA">CAA — Certification authority</option>
              </select>
            </div>

            {/* TTL */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">TTL (Seconds)</label>
              <input
                type="number"
                {...register("ttl", { valueAsNumber: true })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="300"
                disabled={mutation.isPending}
              />
              {/* Quick TTL Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {quickTtls.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => !mutation.isPending && setValue("ttl", qt.value)}
                    className="px-2 py-1 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 transition-colors"
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
              {errors.ttl && (
                <span className="text-xs text-red-600">{errors.ttl.message}</span>
              )}
            </div>

            {/* Routing Policy */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Routing Policy</label>
              <select
                {...register("routing_policy")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
                disabled={mutation.isPending}
              >
                <option value="Simple">Simple</option>
                <option value="Weighted">Weighted</option>
                <option value="Latency">Latency</option>
                <option value="Failover">Failover</option>
                <option value="Geolocation">Geolocation</option>
                <option value="Multivalue">Multivalue</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Value */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Value / Route traffic to</label>
              <textarea
                {...register("value")}
                rows={6}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder={getPlaceholder()}
                disabled={mutation.isPending}
              />
              {errors.value && (
                <span className="text-xs text-red-600">{errors.value.message}</span>
              )}
            </div>

            {/* Comment */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Comment</label>
              <textarea
                {...register("comment")}
                rows={2}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="Description of this record"
                disabled={mutation.isPending}
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-black bg-[#FF9900] hover:bg-[#e8890a] shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Record"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
