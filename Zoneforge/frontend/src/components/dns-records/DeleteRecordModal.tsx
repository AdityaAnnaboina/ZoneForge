"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dnsRecordsApi } from "@/lib/apiClient";
import { useNotificationStore } from "@/store/notificationStore";
import { DNSRecord } from "@/types";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zoneId: string;
  record: DNSRecord;
}

export default function DeleteRecordModal({
  isOpen,
  onClose,
  onSuccess,
  zoneId,
  record,
}: DeleteRecordModalProps) {
  const queryClient = useQueryClient();
  const notificationStore = useNotificationStore();

  const mutation = useMutation({
    mutationFn: () => dnsRecordsApi.deleteDNSRecord(zoneId, record.id),
    onSuccess: () => {
      notificationStore.success(
        "DNS record deleted",
        `The DNS record ${record?.name} has been successfully deleted.`
      );
      queryClient.invalidateQueries({ queryKey: ["dns-records", zoneId] });
      queryClient.invalidateQueries({ queryKey: ["hosted-zone", zoneId] });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete DNS Record" size="sm">
      <div className="space-y-6">
        {/* Warning Title */}
        <div className="flex items-start rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Delete DNS Record?</h4>
            <p className="text-sm leading-relaxed">
              Are you sure you want to permanently delete the DNS record{" "}
              <span className="font-semibold">{record?.name}</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Record details gray box */}
        <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3.5">
          <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">Record Name</span>
            <span className="font-mono text-slate-800 font-medium">{record?.name}</span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">Record Type</span>
            <Badge variant={record?.type || "A"} />
          </div>

          <div className="flex flex-col text-xs space-y-1">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">Record Value</span>
            <span className="font-mono text-slate-800 break-all whitespace-pre-wrap mt-1 leading-relaxed bg-white border border-slate-100 p-2 rounded">
              {record?.value}
            </span>
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
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Record"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
