"use client";

import React, { useEffect, useState } from "react";
import DataTable, { ColumnConfig } from "@/components/dashboard-common/DataTable";
import { adminService } from "@/services/adminService";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setAdminLoading,
  setAdminError,
  setAdminUsers,
  setAdminNurseryUsers,
  deleteUserFromState,
} from "@/redux/slices/adminSlice";
import Link from "next/link";
import { Users, ShieldAlert, Trash2, RefreshCw, ShieldCheck, Eye } from "lucide-react";

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: "user" | "nursery" | "admin";
  createdAt?: string;
}

type TabType = "user" | "nursery" | "admin";

export default function AdminAllUsers() {
  const dispatch = useAppDispatch();
  const { users, nurseryUsers, isLoading, error } = useAppSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState<TabType>("user");

  const fetchUsersData = async () => {
    dispatch(setAdminLoading(true));
    try {
      if (activeTab === "nursery") {
        const response = await adminService.getAllNurseryUsers();
        const dataWrapper = response as unknown as any;
        const extractedNurseries = Array.isArray(response)
          ? response
          : (dataWrapper?.users || dataWrapper?.nurseries || dataWrapper?.data?.users || []);
        dispatch(setAdminNurseryUsers(extractedNurseries));
      } else {
        const response = await adminService.getAllUsers();
        const dataWrapper = response as unknown as any;
        const extractedUsers = Array.isArray(response)
          ? response
          : (dataWrapper?.users || dataWrapper?.data?.users || []);
        dispatch(setAdminUsers(extractedUsers));
      }
    } catch (err: any) {
      dispatch(setAdminError(err?.response?.data?.message || err?.message || "Failed to sync system users database metrics."));
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, [activeTab]);

  const handleDeleteUser = async (userId: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to completely purge user "${name}" from server cluster?`)) {
      try {
        await adminService.deleteUser(userId);
        dispatch(deleteUserFromState(userId));
        fetchUsersData();
      } catch (err: any) {
        alert(err?.response?.data?.message || err?.message || "Operation failed to complete downstream dependency check.");
      }
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === "user" ? "admin" : "user";
    if (window.confirm(`Change system permission authorization to [${nextRole.toUpperCase()}]?`)) {
      try {
        await adminService.updateUserRole(userId, { role: nextRole });
        alert("Authorization permissions adjusted successfully.");
        setActiveTab(nextRole);
      } catch (err: any) {
        alert(err?.response?.data?.message || err?.message || "Role adjustment failed mapping restriction schema.");
      }
    }
  };

  const columns: ColumnConfig<UserRecord>[] = [
    {
      header: "Unique User ID",
      accessorKey: "_id",
      className: "font-mono text-[11px] text-slate-400 font-semibold tracking-tight",
    },
    {
      header: "User Metadata Profiles",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">{row.name}</span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium select-all">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Security Access Role",
      accessorKey: "role",
      cell: (row) => {
        const roleStyles = {
          admin: "text-red-700 bg-red-50 border-red-100",
          nursery: "text-green-700 bg-green-50 border-green-100",
          user: "text-indigo-700 bg-indigo-50 border-indigo-100",
        };
        return (
          <span className={`inline-flex items-center font-black uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-md border ${roleStyles[row.role] || roleStyles.user}`}>
            {row.role}
          </span>
        );
      },
    },
    {
      header: "Administrative Actions Controls",
      accessorKey: "_id",
      className: "text-center",
      cell: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          {row.role === "nursery" && (
            <Link
              href={`/admin/nurseries/${row._id}`}
              title="Inspect Full Nursery Vendor Details Page"
              className="p-1.5 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 rounded-lg bg-white text-slate-500 hover:text-emerald-700 cursor-pointer transition-all flex items-center justify-center"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
          )}

          {row.role !== "nursery" && (
            <button
              type="button"
              title={row.role === "admin" ? "Demote Executive to user" : "Promote user to Executive Admin"}
              onClick={() => handleRoleChange(row._id, row.role)}
              className={`p-1.5 border rounded-lg bg-white cursor-pointer transition-all flex items-center justify-center ${row.role === "admin"
                ? "border-slate-200 hover:border-slate-400 text-red-500 hover:text-slate-700"
                : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-600"
                }`}
            >
              {row.role === "admin" ? <Users className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            title="Purge Profile"
            onClick={() => handleDeleteUser(row._id, row.name)}
            className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50/60 rounded-lg bg-white text-slate-400 hover:text-red-600 cursor-pointer transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const getFilteredData = (): UserRecord[] => {
    if (activeTab === "nursery") {
      return Array.isArray(nurseryUsers) ? nurseryUsers : [];
    }
    const fallbackBase = Array.isArray(users) ? users : [];
    return fallbackBase.filter((user) => user.role === activeTab);
  };

  const targetGridSource = getFilteredData();
  const totalusers = Array.isArray(users) ? users.filter((u) => u.role === "user").length : 0;
  const totalAdmins = Array.isArray(users) ? users.filter((u) => u.role === "admin").length : 0;
  const totalNurseries = Array.isArray(nurseryUsers) ? nurseryUsers.length : 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 m-0 flex items-center gap-2">
            <Users className="w-6 h-6 text-slate-800 shrink-0" />
            <span>User Identity Directory</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm m-0 mt-1">
            Manage system infrastructure accounts, control roles, and handle downstream validation modules.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsersData}
          disabled={isLoading}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer transition-all disabled:opacity-50 inline-flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-center border-b border-slate-200 w-full gap-1 select-none overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("user")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer whitespace-nowrap ${activeTab === "user" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-800"}`}
        >
          users Base ({totalusers})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("nursery")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer whitespace-nowrap ${activeTab === "nursery" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-800"}`}
        >
          Approved Nurseries ({totalNurseries})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("admin")}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 bg-transparent cursor-pointer whitespace-nowrap ${activeTab === "admin" ? "border-green-600 text-green-600" : "border-transparent text-slate-400 hover:text-slate-800"}`}
        >
          Platform Admins ({totalAdmins})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className={`transition-opacity duration-200 ${isLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
        <DataTable<UserRecord>
          data={targetGridSource}
          columns={columns}
          searchPlaceholder={`Search using names...`}
          searchKey="name"
          filterKey="role"
          filterOptions={[activeTab] as ("user" | "nursery" | "admin")[]}
        />
      </div>
    </div>
  );
}