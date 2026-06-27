"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Pencil,
  Trash2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

import { hostedZonesApi, dnsRecordsApi } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import dynamic from "next/dynamic";

const CreateRecordModal = dynamic(
  () => import("@/components/dns-records/CreateRecordModal"),
  { ssr: false }
);
const EditRecordModal = dynamic(
  () => import("@/components/dns-records/EditRecordModal"),
  { ssr: false }
);
const DeleteRecordModal = dynamic(
  () => import("@/components/dns-records/DeleteRecordModal"),
  { ssr: false }
);
import { DNSRecord, HostedZone } from "@/types";
import { useNotificationStore } from "@/store/notificationStore";

interface ZoneDetailsPageProps {
  params: {
    zoneId: string;
  };
}

export default function ZoneDetailsPage({ params }: ZoneDetailsPageProps) {
  const { zoneId } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationStore = useNotificationStore();

  // State
  const [searchInput, setSearchInput] = useState("");
  const [search, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Clipboard Copied Tooltip State
  const [showCopied, setShowCopied] = useState(false);

  // Modal Open States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected Record
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Zone metadata query
  const {
    data: zone,
    isLoading: isZoneLoading,
    isError: isZoneError,
    error: zoneError,
  } = useQuery<HostedZone>({
    queryKey: ["hosted-zone", zoneId],
    queryFn: () => hostedZonesApi.getHostedZone(zoneId),
  });

  // Handle zone fetch failure (404)
  useEffect(() => {
    if (isZoneError) {
      const errStatus = (zoneError as { response?: { status?: number } })?.response?.status;
      if (errStatus === 404) {
        notificationStore.error(
          "Hosted zone not found",
          "The requested hosted zone does not exist or has been deleted."
        );
        router.push("/hosted-zones");
      }
    }
  }, [isZoneError, zoneError, router, notificationStore]);

  // Records query
  const {
    data: recordsData,
    isLoading: isRecordsLoading,
    isError: isRecordsError,
    error: recordsError,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: ["dns-records", zoneId, { search, typeFilter, page, pageSize }],
    queryFn: () =>
      dnsRecordsApi.getDNSRecords(zoneId, {
        search,
        type_filter: typeFilter || undefined,
        page,
        page_size: pageSize,
      }),
    placeholderData: keepPreviousData,
    enabled: !!zone, // Only fetch records when zone info is resolved
  });

  const handleCopyId = () => {
    if (zone) {
      navigator.clipboard.writeText(zone.id);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dns-records", zoneId] });
    queryClient.invalidateQueries({ queryKey: ["hosted-zone", zoneId] });
  };

  const handleEditClick = (record: DNSRecord) => {
    setSelectedRecord(record);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (record: DNSRecord) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  const getTtlHint = (ttl: number) => {
    if (ttl === 60) return "1 min";
    if (ttl === 300) return "5 min";
    if (ttl === 3600) return "1 hour";
    if (ttl === 86400) return "1 day";
    if (ttl === 172800) return "2 days";

    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.round(ttl / 60)} min`;
    if (ttl < 86400) return `${Math.round(ttl / 3600)} hours`;
    return `${Math.round(ttl / 86400)} days`;
  };

  const renderValue = (val: string) => {
    const lines = val.split("\n").filter((l) => l.trim() !== "");
    if (lines.length <= 1) {
      return (
        <span className="truncate max-w-[200px] block font-mono text-xs" title={val}>
          {val}
        </span>
      );
    }
    const firstLine = lines[0];
    const moreCount = lines.length - 1;
    return (
      <div className="flex items-center space-x-1.5" title={val}>
        <span className="truncate max-w-[150px] font-mono text-xs text-slate-800">
          {firstLine}
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          +{moreCount} more
        </span>
      </div>
    );
  };

  const isLoading = isZoneLoading || isRecordsLoading;
  const isError = isZoneError || isRecordsError;
  const activeError = zoneError || recordsError;

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <span>Route 53</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link href="/hosted-zones" className="text-slate-500 hover:text-slate-800 hover:underline">
          Hosted Zones
        </Link>
        {zone && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-700">{zone.name}</span>
          </>
        )}
      </div>

      {/* 2. Zone info header card */}
      {zone && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Name */}
            <div className="flex flex-col space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hosted Zone Name
              </span>
              <span className="font-mono text-sm font-semibold text-slate-900 break-all">
                {zone.name}
              </span>
            </div>

            {/* Type */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Type
              </span>
              <div>
                <Badge variant={zone.type} />
              </div>
            </div>

            {/* ID */}
            <div className="flex flex-col space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hosted Zone ID
              </span>
              <div className="flex items-center space-x-1.5 relative">
                <span className="font-mono text-xs text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 break-all">
                  {zone.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  title="Copy Zone ID"
                >
                  {showCopied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                {showCopied && (
                  <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow">
                    Copied!
                  </span>
                )}
              </div>
            </div>

            {/* Record Count */}
            <div className="flex flex-col space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Record Count
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-mono text-slate-800">
                  {zone.record_count}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-[10px] font-semibold text-orange-600 uppercase tracking-wide">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Page title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Records for {zone?.name || "Zone"}
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          disabled={!zone}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#FF9900] hover:bg-[#e8890a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Record
        </button>
      </div>

      {/* 4. Action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by record name..."
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Right filters */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all"
          >
            <option value="">All Types</option>
            <option value="A">A</option>
            <option value="AAAA">AAAA</option>
            <option value="CNAME">CNAME</option>
            <option value="TXT">TXT</option>
            <option value="MX">MX</option>
            <option value="NS">NS</option>
            <option value="PTR">PTR</option>
            <option value="SRV">SRV</option>
            <option value="CAA">CAA</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none"
            title="Refresh records"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 5. TABLE / Content Area */}
      {isLoading ? (
        <LoadingSkeleton rows={8} columns={8} />
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-semibold">Error loading DNS records</span>
          </div>
          <p className="text-sm mb-3">
            {(activeError as { message?: string })?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => refetchRecords()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !recordsData || recordsData.items.length === 0 ? (
        <EmptyState
          title="No DNS Records"
          description="Create your first DNS record for this hosted zone."
          actionLabel="Create Record"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#F2F3F3]">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      disabled
                      className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 opacity-50 cursor-not-allowed"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Record Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    TTL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Value / Route traffic to
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Routing Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {recordsData.items.map((record) => {
                  const isApex = record.name === "@" || record.name === "";
                  const displayName = isApex ? (
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-slate-800">@</span>
                      <span title="Zone apex: represents the root domain name" className="cursor-help">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-slate-800 break-all">{record.name}</span>
                  );

                  return (
                    <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          disabled
                          className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 opacity-50 cursor-not-allowed"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{displayName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={record.type} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-slate-700">{record.ttl}</span>
                          <span className="text-[10px] text-slate-400">
                            ({getTtlHint(record.ttl)})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm max-w-[250px]">
                        {renderValue(record.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {record.routing_policy}
                      </td>
                      <td
                        className="px-6 py-4 text-sm text-slate-500 italic max-w-[150px] truncate"
                        title={record.comment || ""}
                      >
                        {record.comment || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleEditClick(record)}
                            className="p-1 text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Edit record"
                            aria-label={`Edit DNS record ${record.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record)}
                            className="p-1 text-red-600 hover:bg-slate-100 rounded transition-colors"
                            title="Delete record"
                            aria-label={`Delete DNS record ${record.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 6. PAGINATION */}
          <div className="flex justify-end">
            <Pagination
              page={page}
              totalPages={recordsData.total_pages}
              total={recordsData.total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Create Record Modal */}
      {zone && (
        <CreateRecordModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleRefresh}
          zoneId={zone.id}
          zoneName={zone.name}
        />
      )}

      {/* Edit Record Modal */}
      {zone && selectedRecord && (
        <EditRecordModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={handleRefresh}
          zoneId={zone.id}
          zoneName={zone.name}
          record={selectedRecord}
        />
      )}

      {/* Delete Record Modal */}
      {zone && selectedRecord && (
        <DeleteRecordModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedRecord(null);
          }}
          onSuccess={handleRefresh}
          zoneId={zone.id}
          record={selectedRecord}
        />
      )}
    </div>
  );
}
