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
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { hostedZonesApi } from "@/lib/apiClient";
import Badge from "@/components/ui/Badge";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import dynamic from "next/dynamic";

const CreateHostedZoneModal = dynamic(
  () => import("@/components/hosted-zones/CreateHostedZoneModal"),
  { ssr: false }
);
const EditHostedZoneModal = dynamic(
  () => import("@/components/hosted-zones/EditHostedZoneModal"),
  { ssr: false }
);
const DeleteHostedZoneModal = dynamic(
  () => import("@/components/hosted-zones/DeleteHostedZoneModal"),
  { ssr: false }
);
import { HostedZone } from "@/types";

export default function HostedZonesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [searchInput, setSearchInput] = useState("");
  const [search, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal Open States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected Zone for edit/delete
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Data fetching
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hosted-zones", { search, typeFilter, page, pageSize }],
    queryFn: () =>
      hostedZonesApi.getHostedZones({
        search,
        type_filter: typeFilter || undefined,
        page,
        page_size: pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12
      
      return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateStr;
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["hosted-zones"] });
  };

  const handleEditClick = (zone: HostedZone, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedZone(zone);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (zone: HostedZone, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedZone(zone);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb bar */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <span>Route 53</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">Hosted Zones</span>
      </div>

      {/* 2. Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Hosted Zones
        </h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#FF9900] hover:bg-[#e8890a] transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Hosted Zone
        </button>
      </div>

      {/* 3. Action bar */}
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
            placeholder="Search hosted zones..."
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
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-600 transition-colors focus:outline-none"
            title="Refresh list"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4. Results summary */}
      {data && (
        <div className="text-sm text-slate-600">
          {data.total} Hosted {data.total === 1 ? "Zone" : "Zones"}
        </div>
      )}

      {/* 5. TABLE / Content Area */}
      {isLoading ? (
        <LoadingSkeleton rows={5} columns={7} />
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-semibold">Error loading hosted zones</span>
          </div>
          <p className="text-sm mb-3">{(error as { message?: string })?.message || "An unexpected error occurred."}</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No Hosted Zones"
          description="Create your first hosted zone to start managing DNS records."
          actionLabel="Create Hosted Zone"
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
                  <th className="px-6 py-3 text-left">
                    <span className="inline-flex items-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Domain Name
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Record Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.items.map((zone) => (
                  <tr
                    key={zone.id}
                    onClick={() => router.push(`/hosted-zones/${zone.id}`)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 opacity-50 cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/hosted-zones/${zone.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0073bb] font-medium hover:underline text-sm"
                      >
                        {zone.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={zone.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                      {zone.record_count}
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-sm text-slate-600" title={zone.comment || ""}>
                      {zone.comment || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDate(zone.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => handleEditClick(zone, e)}
                          className="p-1 text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Edit hosted zone"
                          aria-label={`Edit hosted zone ${zone.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(zone, e)}
                          className="p-1 text-red-600 hover:bg-slate-100 rounded transition-colors"
                          title="Delete hosted zone"
                          aria-label={`Delete hosted zone ${zone.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. PAGINATION */}
          <div className="flex justify-end">
            <Pagination
              page={page}
              totalPages={data.total_pages}
              total={data.total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Create Hosted Zone Modal */}
      <CreateHostedZoneModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Edit Hosted Zone Modal */}
      {selectedZone && (
        <EditHostedZoneModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedZone(null);
          }}
          onSuccess={handleRefresh}
          zone={selectedZone}
        />
      )}

      {/* Delete Hosted Zone Modal */}
      {selectedZone && (
        <DeleteHostedZoneModal
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedZone(null);
          }}
          onSuccess={handleRefresh}
          zone={selectedZone}
        />
      )}
    </div>
  );
}
