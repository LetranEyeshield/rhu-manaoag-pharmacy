"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import Link from "next/link";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";

export default function Patients() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const formatBirthday = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value);
      }, 500),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const fetchPatients = (page: number, search: string) =>
    graphqlRequest(
      `
    query Patients($page:Int!, $limit:Int!, $search:String){
      patients(page:$page, limit:$limit, search:$search){
        patients{
          _id
          firstName
          middleName
          lastName
          birthday
          age
          address
          medicines
        }
        totalCount
        totalPages
      }
    }
  `,
      { page, limit: 5, search },
    );

  const { data, isLoading } = useQuery({
    queryKey: ["patients", page, debouncedSearch],
    queryFn: () => fetchPatients(page, debouncedSearch),
    staleTime: 1000 * 60 * 2,
  });

  const patients = data?.patients?.patients ?? [];
  const totalPages = data?.patients?.totalPages ?? 1;
  const totalCount = data?.patients?.totalCount ?? 0;

  const handleDelete = (patient: any) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?",
    );
    if (confirmDelete) {
      deleteMutation.mutate(patient._id);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      graphqlRequest(
        `
      mutation DeletePatient($id:ID!){
        deletePatient(id:$id)
      }
      `,
        { id },
      ),

    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: ["patients", page, debouncedSearch],
      });

      const previous = queryClient.getQueryData<any>([
        "patients",
        page,
        debouncedSearch,
      ]);

      queryClient.setQueryData(
        ["patients", page, debouncedSearch],
        (old: any) => {
          if (!old) return old;

          return {
            patients: {
              ...old.patients,
              patients: old.patients.patients.filter((p: any) => p._id !== id),
            },
          };
        },
      );

      return { previous };
    },

    onError: (error: any, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["patients", page, debouncedSearch],
          context.previous,
        );
      }

      toast.error(
        error?.response?.errors?.[0]?.message ||
          error.message ||
          "Delete failed",
      );
    },

    onSuccess: () => {
      toast.success("Patient deleted successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  return (
    <div className="wrapper bg-green-50 w-9/12 mx-auto">
      <div className="p-6 w-11/12 mx-auto pl-10">
        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10">
            Patients
          </h1>

          <div className="flex justify-between">
            <input
              placeholder="Search Patient..."
              className="border rounded-lg px-4 py-2 w-full md:w-64"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
            />
           <h2 className="3xl font-bold">Total Patients: {totalCount}</h2>
          </div>
        </div>

        {/* LIST */}
        <div className="grid grid-cols-1 gap-6 ">
          {isLoading && <p>Loading...</p>}

          {!isLoading && patients.length === 0 && (
            <p className="text-gray-500">No patients found</p>
          )}

          {patients.map((patient: any) => (
            <div
              key={patient._id}
              className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-bold text-green-500">
                {patient.firstName} {patient.middleName} {patient.lastName}
              </h2>

              <p className="text-md text-gray-600 mt-2">
                <span className="font-semibold">Birthday:</span>{" "}
                {/* {patient.birthday
                  ? new Date(patient.birthday).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"} */}
                {/* {formatBirthday(patient.birthday)} */}
                {patient.birthday}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-semibold">Age:</span> {patient.age}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-semibold">Address:</span>{" "}
                {patient.address}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-semibold">Medicines:</span>{" "}
                {patient.medicines?.join(", ")}
              </p>

              <div className="mt-5 flex gap-2">
                <Link
                  href={`/patient/${patient._id}`}
                  className="text-sm px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(patient)}
                  className="text-sm px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION (UPDATED) */}
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {/* FIRST */}
          <button
            className="px-3 py-1 border rounded"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            First
          </button>

          {/* PREV */}
          <button
            className="px-3 py-1 border rounded"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </button>

          {/* CURRENT PAGE */}
          <span className="px-3 py-1 text-sm">
            Page {page} / {totalPages}
          </span>

          {/* NEXT */}
          <button
            className="px-3 py-1 border rounded"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>

          {/* LAST */}
          <button
            className="px-3 py-1 border rounded"
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
