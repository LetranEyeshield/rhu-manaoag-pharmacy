
"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import Link from "next/link";
import toast from "react-hot-toast";
import { maintenanceCardList } from "@/app/constants/lists";
import Banner from "@/app/components/Banner";
import LogoutButton from "@/app/components/Logout";

type MaintenancecardType = {
  _id: string;
  cardName: string;
  cardDate: string;
  initialStock: number;
  qtyIn: number;
  lotNoIn: string;
  expiryIn: string;
  qtyOut: number;
  lotNoOut: string;
  expiryOut: string;
  balance: number;
};

export default function MaintenancecardsTable() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "No date input";

    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchMaintenancecards = (page: number, search: string) =>
    graphqlRequest(
      `
      query Maintenancecards($page:Int!, $limit:Int!, $search:String){
        maintenancecards(page:$page, limit:$limit, search:$search){
          maintenancecards{
            _id
            cardName
            cardDate
            initialStock
            qtyIn
            lotNoIn
            expiryIn
            qtyOut
            lotNoOut
            expiryOut
            balance
          }
          totalCount
          totalPages
        }
      }
    `,
      { page, limit: 10, search },
    );

  const { data, isLoading } = useQuery({
    queryKey: ["maintenancecards", page, search],
    queryFn: () => fetchMaintenancecards(page, search),
    staleTime: 1000 * 60 * 2,
  });

  const maintenancecards = data?.maintenancecards?.maintenancecards ?? [];
  const totalPages = data?.maintenancecards?.totalPages ?? 1;

  // 🔥 DELETE
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      graphqlRequest(
        `
        mutation DeleteMaintenancecard($id:ID!){
          deleteMaintenancecard(id:$id)
        }
      `,
        { id },
      ),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: ["maintenancecards", page, search],
      });

      const previous = queryClient.getQueryData(["maintenancecards", page, search]);

      queryClient.setQueryData(["maintenancecards", page, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          maintenancecards: {
            ...old.maintenancecards,
            maintenancecards: old.maintenancecards.maintenancecards.filter((p: any) => p._id !== id),
          },
        };
      });

      return { previous };
    },

    onError: (error: any, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["maintenancecards", page, search], context.previous);
      }

      toast.error(
        error?.response?.errors?.[0]?.message ||
          error.message ||
          "Delete failed",
      );
    },

    onSuccess: () => {
      toast.success("Deleted successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenancecards"] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this card?")) {
      deleteMutation.mutate(id);
    }
  };

  // 🧠 TABLE COLUMNS
  const columns = useMemo<ColumnDef<MaintenancecardType>[]>(
    () => [
      {
        accessorKey: "cardName",
        header: "Card Name",
      },
      {
        accessorKey: "cardDate",
        header: "Card Date",
        cell: ({ row }) => formatDate(row.original.cardDate),
      },
      {
        accessorKey: "initialStock",
        header: "Initial Stock",
      },
      {
        accessorKey: "qtyIn",
        header: "Qty In",
      },
       {
        accessorKey: "lotNoIn",
        header: "Lot No In",
      },
       {
        accessorKey: "expirtyIn",
        header: "Expiry In",
      },
      {
        accessorKey: "qtyOut",
        header: "Qty Out",
      },
      {
        accessorKey: "lotNoOut",
        header: "Lot No Out",
      },
       {
        accessorKey: "expirtyOut",
        header: "Expiry Out",
      },
      {
        accessorKey: "balance",
        header: "Balance",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link
              href={`/maintenancecard/${row.original._id}`}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: maintenancecards,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <Banner />

      <div className="home-buttons w-full flex justify-center py-8">
        <Link
          href="/new-maintenancecard"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Add New Maintenance Card
        </Link>
        <Link
          href="/dashboard/reports"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Reports
        </Link>
        <Link
          href={"/dashboard/medscard"}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
        >
          Meds Card
        </Link>
        <Link
          href={"/dashboard/vitamins"}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
        >
          Vitamins Card
        </Link>
        <Link
          href="/dashboard"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Dashboard
        </Link>
        <LogoutButton />
      </div>

      <div className="w-11/12 mx-auto bg-green-50 p-10">
        <h1 className="text-4xl text-center font-bold mb-6">Maintenance Cards</h1>

        {/* FILTER */}
        <select
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border p-2 mb-4"
        >
          <option value="">All</option>
          {maintenanceCardList.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-green-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-2 border cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              )}

              {!isLoading &&
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2 border">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && maintenancecards.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            className="px-3 py-1 border rounded disabled:opacity-80 disabled:cursor-not-allowed"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            First
          </button>

          <button
            className="px-3 py-1 border rounded disabled:opacity-80 disabled:cursor-not-allowed"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-80 disabled:cursor-not-allowed"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>

          <button
            className="px-3 py-1 border rounded disabled:opacity-80 disabled:cursor-not-allowed"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
