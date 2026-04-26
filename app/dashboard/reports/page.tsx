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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import Link from "next/link";
import toast from "react-hot-toast";
import { addressList } from "@/app/constants/lists";
import Banner from "@/app/components/Banner";
import LogoutButton from "@/app/components/Logout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Patient = {
  _id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  birthday: string;
  age?: number | null;
  address: string;
  medicines: string[];
};

export default function ReportsTable() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(""); // name search
  const [address, setAddress] = useState(""); // address filter
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

  const fetchPatients = (page: number, search: string, address: string) =>
    graphqlRequest(
      `
     query Patients($page:Int!, $limit:Int!, $search:String, $address:String){
  patients(page:$page, limit:$limit, search:$search, address:$address){
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
      { page, limit: 1000, search, address },  //limit: 1000, 👈 increase this (or dynamic later)
    );

  const { data, isLoading } = useQuery({
    queryKey: ["patients", page, search, address],
    queryFn: () => fetchPatients(page, search, address),
    staleTime: 1000 * 60 * 2,
  });

  const patients = data?.patients?.patients ?? [];
  const totalPages = data?.patients?.totalPages ?? 1;

  // 🧠 TABLE COLUMNS
  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "middleName",
        header: "Middle Name",
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "birthday",
        header: "Birth Date",
        cell: ({ row }) => formatDate(row.original.birthday),
      },
      {
        accessorKey: "age",
        header: "Age",
      },
      {
        accessorKey: "address",
        header: "Address",
      },
      {
        accessorKey: "medicines",
        header: "Medicines",
      },
    ],
    [],
  );

  const table = useReactTable({
    data: patients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleExport = async () => {
    try {
      setLoading(true);

      // 👇 Let React update UI first
      await new Promise((resolve) => setTimeout(resolve, 0));

      exportPatientsToExcel(patients);
    } catch (error: any) {
      toast.error("Error creating report");
    } finally {
      setLoading(false);
    }
  };

  function exportPatientsToExcel(patients: Patient[]) {
    // Map only the fields you want
    const exportData = patients.map((p) => ({
      "First Name": p.firstName,
      "Middle Name": p.middleName || "",
      "Last Name": p.lastName,
      //   Birthday: p.birthday,
      Birthday: new Date(p.birthday).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      Age: p.age,
      Address: p.address,
      Medicines: p.medicines?.join(", ") || "",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");

    // Write to binary array
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Save file
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, address + " Reports.xlsx");
  }

  return (
    <div className="w-full">
      <Banner />

      <div className="home-buttons w-full flex justify-center py-8">
        <Link
          href="/dashboard/medscard"
          className="bg-green-500 text-white px-4 py-2 rounded mr-8"
        >
          Meds Card
        </Link>
        <Link
          href={"/dashboard/maintenance"}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
        >
          Maintenance Card
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
        <h1 className="text-4xl text-center font-bold mb-6">Meds Cards</h1>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name..."
          className="border p-2 mb-4 hidden"
        />
        {/* FILTER */}
        <select
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            setPage(1);
          }}
          className="border p-2 mb-4"
        >
          <option value="">All</option>
          {addressList.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>

        <button
          onClick={handleExport}
          disabled={loading}
          className="px-4 py-2 ml-6 bg-blue-500 text-white rounded hover:bg-blue-700 mr-4 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Exporting to Excel..." : "Export to Excel"}
        </button>

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

              {!isLoading && patients.length === 0 && (
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




//WITH TANSTACK VIRTUALIZATION AND INFINITE SCROLLING BUT HAS TABLE DATA WIDTH BUGS 
// "use client";

// import { useState, useMemo } from "react";
// import {
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
//   ColumnDef,
//   getSortedRowModel,
//   SortingState,
// } from "@tanstack/react-table";

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { graphqlRequest } from "@/app/lib/graphql-client";
// import Link from "next/link";
// import toast from "react-hot-toast";
// import { addressList } from "@/app/constants/lists";
// import Banner from "@/app/components/Banner";
// import LogoutButton from "@/app/components/Logout";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { useVirtualizer } from "@tanstack/react-virtual";
// import { useRef } from "react";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { useEffect } from "react";

// type Patient = {
//   _id: string;
//   firstName: string;
//   middleName?: string | null;
//   lastName: string;
//   birthday: string;
//   age?: number | null;
//   address: string;
//   medicines: string[];
// };

// type PageResponse = {
//   patients: Patient[];
//   nextPage?: number;
// };

// export default function ReportsTable() {
//   const queryClient = useQueryClient();

//   const [search, setSearch] = useState(""); // name search
//   const [address, setAddress] = useState(""); // address filter
//   const [sorting, setSorting] = useState<SortingState>([]);

//   const formatDate = (date: string | null | undefined) => {
//     if (!date) return "No date input";

//     const d = new Date(date);
//     if (isNaN(d.getTime())) return "Invalid date";

//     return d.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const parentRef = useRef<HTMLDivElement>(null);

//   const fetchPatients = (page: number, search: string, address: string) =>
//     graphqlRequest(
//       `
//      query Patients($page:Int!, $limit:Int!, $search:String, $address:String){
//   patients(page:$page, limit:$limit, search:$search, address:$address){
//     patients{
//       _id
//       firstName
//       middleName
//       lastName
//       birthday
//       age
//       address
//       medicines
//     }
//     totalCount
//     totalPages
//   }
// }
//     `,
//       { page, limit: 1000, search, address }, //limit: 1000, 👈 increase this (or dynamic later)
//     );

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
//     useInfiniteQuery({
//       queryKey: ["patients", search, address],

//       initialPageParam: 1, // ✅ ADD THIS

//       queryFn: async ({ pageParam }) => {
//         const res = await graphqlRequest(
//           `
//         query Patients($page:Int!, $limit:Int!, $search:String, $address:String){
//           patients(page:$page, limit:$limit, search:$search, address:$address){
//             patients{
//               _id
//               firstName
//               middleName
//               lastName
//               birthday
//               age
//               address
//               medicines
//             }
//             totalPages
//           }
//         }
//         `,
//           { page: pageParam, limit: 50, search, address },
//         );

//         return {
//           patients: res.patients.patients,
//           nextPage:
//             pageParam < res.patients.totalPages ? pageParam + 1 : undefined,
//         };
//       },

//       getNextPageParam: (lastPage) => lastPage.nextPage,
//     });

//   const patients = useMemo(
//     () => data?.pages.flatMap((p) => p.patients) ?? [],
//     [data],
//   );

//   // 🧠 TABLE COLUMNS
//   const columns = useMemo<ColumnDef<Patient>[]>(
//     () => [
//       {
//         accessorKey: "firstName",
//         header: "First Name",
//       },
//       {
//         accessorKey: "middleName",
//         header: "Middle Name",
//       },
//       {
//         accessorKey: "lastName",
//         header: "Last Name",
//       },
//       {
//         accessorKey: "birthday",
//         header: "Birth Date",
//         cell: ({ row }) => formatDate(row.original.birthday),
//       },
//       {
//         accessorKey: "age",
//         header: "Age",
//       },
//       {
//         accessorKey: "address",
//         header: "Address",
//       },
//       {
//         accessorKey: "medicines",
//         header: "Medicines",
//       },
//     ],
//     [],
//   );

//   const table = useReactTable({
//     data: patients,
//     columns,
//     state: { sorting },
//     onSortingChange: setSorting,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//   });

//   const rows = table.getRowModel().rows;
//   const rowVirtualizer = useVirtualizer({
//     count: rows.length,
//     getScrollElement: () => parentRef.current,
//     estimateSize: () => 45, // row height (adjust if needed)
//     overscan: 10,
//   });

//   const [loading, setLoading] = useState<boolean>(false);

//   const handleExport = async () => {
//     try {
//       setLoading(true);

//       // 👇 Let React update UI first
//       await new Promise((resolve) => setTimeout(resolve, 0));

//       exportPatientsToExcel(patients);
//     } catch (error: any) {
//       toast.error("Error creating report");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const virtualItems = rowVirtualizer.getVirtualItems();

//   useEffect(() => {
//     const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

//     if (!lastItem) return;

//     if (
//       lastItem.index >= rows.length - 1 &&
//       hasNextPage &&
//       !isFetchingNextPage
//     ) {
//       fetchNextPage();
//     }
//   }, [
//     rowVirtualizer.getVirtualItems(),
//     rows.length,
//     hasNextPage,
//     isFetchingNextPage,
//   ]);

//   function exportPatientsToExcel(patients: Patient[]) {
//     // Map only the fields you want
//     const exportData = patients.map((p) => ({
//       "First Name": p.firstName,
//       "Middle Name": p.middleName || "",
//       "Last Name": p.lastName,
//       //   Birthday: p.birthday,
//       Birthday: new Date(p.birthday).toLocaleDateString("en-US", {
//         month: "long",
//         day: "numeric",
//         year: "numeric",
//       }),
//       Age: p.age,
//       Address: p.address,
//       Medicines: p.medicines?.join(", ") || "",
//     }));

//     // Create worksheet
//     const ws = XLSX.utils.json_to_sheet(exportData);

//     // Create workbook and append worksheet
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Patients");

//     // Write to binary array
//     const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

//     // Save file
//     const data = new Blob([excelBuffer], {
//       type: "application/octet-stream",
//     });
//     saveAs(data, address + " Reports.xlsx");
//   }

//   return (
//     <div className="w-full">
//       <Banner />

//       <div className="home-buttons w-full flex justify-center py-8">
//         <Link
//           href="/dashboard/medscard"
//           className="bg-green-500 text-white px-4 py-2 rounded mr-8"
//         >
//           Meds Card
//         </Link>
//         <Link
//           href={"/dashboard/maintenance"}
//           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
//         >
//           Maintenance Card
//         </Link>
//         <Link
//           href={"/dashboard/vitamins"}
//           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
//         >
//           Vitamins Card
//         </Link>
//         <Link
//           href="/dashboard"
//           className="bg-green-500 text-white px-4 py-2 rounded mr-8"
//         >
//           Dashboard
//         </Link>
//         <LogoutButton />
//       </div>

//       <div className="w-11/12 mx-auto bg-green-50 p-10">
//         <h1 className="text-4xl text-center font-bold mb-6"></h1>
//         <input
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//           }}
//           placeholder="Search name..."
//           className="border p-2 mb-4 hidden"
//         />
//         {/* FILTER */}
//         <select
//           value={address}
//           onChange={(e) => {
//             setAddress(e.target.value);
//           }}
//           className="border p-2 mb-4"
//         >
//           <option value="">All</option>
//           {addressList.map((name) => (
//             <option key={name}>{name}</option>
//           ))}
//         </select>

//         <button
//           onClick={handleExport}
//           disabled={loading}
//           className="px-4 py-2 ml-6 bg-blue-500 text-white rounded hover:bg-blue-700 mr-4 disabled:opacity-50 cursor-pointer"
//         >
//           {loading ? "Exporting to Excel..." : "Export to Excel"}
//         </button>

//         {/* TABLE */}
//         <div
//           ref={parentRef}
//           className="overflow-auto"
//           style={{ height: "500px" }} // 👈 REQUIRED (scroll container)
//         >
//           <table className="w-full border">
//             <thead className="bg-green-100 sticky top-0 z-10">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <th
//                       key={header.id}
//                       className="p-2 border cursor-pointer"
//                       onClick={header.column.getToggleSortingHandler()}
//                     >
//                       {flexRender(
//                         header.column.columnDef.header,
//                         header.getContext(),
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>

//             <tbody
//               style={{
//                 height: `${rowVirtualizer.getTotalSize()}px`,
//                 position: "relative",
//               }}
//             >
//               {rowVirtualizer.getVirtualItems().map((virtualRow) => {
//                 const row = rows[virtualRow.index];

//                 return (
//                   <tr
//                     key={row.id}
//                     className="hover:bg-gray-50"
//                     style={{
//                       position: "absolute",
//                       top: 0,
//                       transform: `translateY(${virtualRow.start}px)`,
//                       width: "100%",
//                     }}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <td key={cell.id} className="p-2 border">
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext(),
//                         )}
//                       </td>
//                     ))}
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//           {isFetchingNextPage && (
//             <div className="text-center p-2">Loading more...</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
