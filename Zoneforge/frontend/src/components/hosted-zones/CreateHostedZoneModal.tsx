"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hostedZonesApi } from "@/lib/apiClient";
import { useNotificationStore } from "@/store/notificationStore";
import Modal from "../ui/Modal";
import { Loader2 } from "lucide-react";

interface CreateHostedZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = z.object({
  name: z.string().min(1, "Domain name is required").regex(/^[a-zA-Z0-9][a-zA-Z0-9\-\.]*$/, "Invalid domain name"),
  type: z.enum(["Public", "Private"]),
  comment: z.string().max(256, "Comment must be at most 256 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateHostedZoneModal({ isOpen, onClose, onSuccess }: CreateHostedZoneModalProps) {
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
      type: "Public",
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
    mutationFn: (data: FormValues) => hostedZonesApi.createHostedZone({
      name: data.name,
      type: data.type,
      comment: data.comment || undefined,
    }),
    onSuccess: () => {
      notificationStore.success("Hosted zone created", "The hosted zone has been successfully created.");
      queryClient.invalidateQueries({ queryKey: ["hosted-zones"] });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Hosted Zone" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Domain Name */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Domain Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="example.com"
            disabled={mutation.isPending}
          />
          <span className="text-xs text-slate-500">
            e.g. example.com (do not include trailing dot)
          </span>
          {errors.name && (
            <span className="text-xs text-red-600">{errors.name.message}</span>
          )}
        </div>

        {/* Type Radio Group */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Public */}
            <div
              onClick={() => !mutation.isPending && setValue("type", "Public")}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === "Public"
                  ? "border-orange-500 bg-orange-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                value="Public"
                checked={selectedType === "Public"}
                onChange={() => {}}
                className="mt-1 h-4 w-4 text-orange-500 border-slate-300 focus:ring-orange-500"
                disabled={mutation.isPending}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-slate-900">Public</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  Routes traffic on the internet
                </span>
              </div>
            </div>

            {/* Private */}
            <div
              onClick={() => !mutation.isPending && setValue("type", "Private")}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedType === "Private"
                  ? "border-orange-500 bg-orange-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                value="Private"
                checked={selectedType === "Private"}
                onChange={() => {}}
                className="mt-1 h-4 w-4 text-orange-500 border-slate-300 focus:ring-orange-500"
                disabled={mutation.isPending}
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-slate-900">Private</span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  Routes traffic within VPCs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Comment</label>
          <textarea
            {...register("comment")}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="Add comments or description for this zone"
            disabled={mutation.isPending}
          />
          {errors.comment && (
            <span className="text-xs text-red-600">{errors.comment.message}</span>
          )}
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
              "Create Hosted Zone"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
