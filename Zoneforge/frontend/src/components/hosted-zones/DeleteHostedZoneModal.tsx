"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hostedZonesApi } from "@/lib/apiClient";
import { useNotificationStore } from "@/store/notificationStore";
import { HostedZone } from "@/types";
import Modal from "../ui/Modal";
import ConfirmInput from "../ui/ConfirmInput";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteHostedZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zone: HostedZone;
}

export default function DeleteHostedZoneModal({
  isOpen,
  onClose,
  onSuccess,
  zone,
}: DeleteHostedZoneModalProps) {
  const queryClient = useQueryClient();
  const notificationStore = useNotificationStore();
  const [confirmValue, setConfirmValue] = useState("");

  // Reset confirmation input when zone changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmValue("");
    }
  }, [zone, isOpen]);

  const mutation = useMutation({
    mutationFn: () => hostedZonesApi.deleteHostedZone(zone.id),
    onSuccess: () => {
      notificationStore.success(
        "Hosted zone deleted",
        `The hosted zone ${zone?.name} has been successfully deleted.`
      );
      queryClient.invalidateQueries({ queryKey: ["hosted-zones"] });
      onSuccess();
      onClose();
    },
    onError: (err) => {
      const errorMsg = (err as { message?: string }).message || "An error occurred.";
      notificationStore.error("Failed to delete", errorMsg);
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  const isConfirmed = confirmValue === zone?.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Hosted Zone" size="md">
      <div className="space-y-6">
        {/* Warning Alert */}
        <div className="flex items-start rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Delete Hosted Zone</h4>
            <p className="text-sm leading-relaxed">
              This action cannot be undone. This will permanently delete the hosted zone{" "}
              <span className="font-semibold">{zone?.name}</span> and all{" "}
              <span className="font-semibold">{zone?.record_count}</span> DNS records.
            </p>
          </div>
        </div>

        {/* Confirm Input */}
        {zone && (
          <ConfirmInput
            expectedValue={zone.name}
            value={confirmValue}
            onChange={setConfirmValue}
            label="To confirm deletion, type the zone name below:"
          />
        )}

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
            onClick={handleDelete}
            disabled={!isConfirmed || mutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Hosted Zone"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
