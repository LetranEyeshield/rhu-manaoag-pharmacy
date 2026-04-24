"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import Link from "next/link";
import toast from "react-hot-toast";
import { medsCardList } from "@/app/constants/lists";
import Banner from "@/app/components/Banner";
import LogoutButton from "@/app/components/Logout";

export default function Medscards() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

 const formatDate = (date: string | null | undefined) => {
  if (!date) return "No date input";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

  const fetchMedscards = (page: number, search: string) =>
    graphqlRequest(
      `
      query Medscards($page:Int!, $limit:Int!, $search:String){
        medscards(page:$page, limit:$limit, search:$search){
          medscards{
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
    queryKey: ["medscards", page, search],
    queryFn: () => fetchMedscards(page, search),
    staleTime: 1000 * 60 * 2,
  });

  const medscards = data?.medscards?.medscards ?? [];
  const totalPages = data?.medscards?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      graphqlRequest(
        `
        mutation DeleteMedscard($id:ID!){
          deleteMedscard(id:$id)
        }
      `,
        { id },
      ),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: ["medscards", page, search],
      });

      const previous = queryClient.getQueryData(["medscards", page, search]);

      queryClient.setQueryData(["medscards", page, search], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          medscards: {
            ...old.medscards,
            medscards: old.medscards.medscards.filter((p: any) => p._id !== id),
          },
        };
      });

      return { previous };
    },

    onError: (error: any, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["medscards", page, search], context.previous);
      }

      toast.error(
        error?.response?.errors?.[0]?.message ||
          error.message ||
          "Delete failed",
      );
    },

    onSuccess: () => {
      toast.success("Meds Card deleted successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["medscards"] });
    },
  });

  const handleDelete = (medscard: any) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      deleteMutation.mutate(medscard._id);
    }
  };

  return (
    <div className="w-full">
      <Banner />

      <div className="home-buttons w-full flex justify-center py-8">
        <Link
          href="/new-medscard"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Add New Meds Card
        </Link>
        <Link
          href="/reports"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Reports
        </Link>
        <Link
          href="/dashboard"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Dashboard
        </Link>
        <LogoutButton />
      </div>

      <div className="wrapper bg-green-50 w-9/12 mx-auto">
        <div className="p-6 w-11/12 mx-auto pl-10">
          <h1 className="text-3xl font-bold text-center mb-10">Meds Cards</h1>

          {/* FILTER */}
          <select
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border p-2 mb-6 bg-white"
          >
            <option value="">All Cards</option>
            {medsCardList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* LIST */}
          <div className="grid grid-cols-1 gap-6">
            {isLoading && <p>Loading...</p>}

            {!isLoading && medscards.length === 0 && (
              <p className="text-gray-500">No Meds Card found</p>
            )}

            {medscards.map((medscard: any) => (
              <div
                key={medscard._id}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-green-500">
                  {medscard.cardName}
                </h2>

                {/* ✅ FIXED DATE */}
                <p className="mt-2 text-gray-600">
                  <span className="font-semibold">Card Date:</span>{" "}
                  {formatDate(medscard.cardDate)}
                </p>

                <p className="mt-2">Initial Stock: {medscard.initialStock}</p>
                <p>Qty In: {medscard.qtyIn}</p>
                <p>Lot No In: {medscard.lotNoIn}</p>
                <p>Expiry In: {formatDate(medscard.expiryIn)}</p>
                <p>Qty Out: {medscard.qtyOut}</p>
                <p>Lot No Out: {medscard.lotNoOut}</p>
                <p>Expiry Out: {formatDate(medscard.expiryOut)}</p>
                <p>Balance: {medscard.balance}</p>

                <div className="mt-5 flex gap-2">
                  <Link
                    href={`/medscard/${medscard._id}`}
                    className="bg-blue-500 text-white px-3 py-2 rounded"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(medscard)}
                    className="bg-red-500 text-white px-3 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page === 1} onClick={() => setPage(1)}>
              First
            </button>

            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>

            <span>
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>

            <button onClick={() => setPage(totalPages)}>Last</button>
          </div>
        </div>
      </div>
    </div>
  );
}
