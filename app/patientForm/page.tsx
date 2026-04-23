"use client";

import Link from "next/link";
import { useState } from "react";
import { addressList, medicinesList } from "../constants/lists";
import Banner from "../components/Banner";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import { PatientType } from "../types/Patient";
import { truncate } from "node:fs";

export default function PatientForm() {
  const [form, setForm] = useState<PatientType>({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    age: 0,
    address: "",
    medicines: [],
  });

  const [loading, setLoading] = useState(false);

  //   const queryClient = useQueryClient();

  //   const fetchTotalPatients = () =>
  //     graphqlRequest(
  //       `
  //     query {
  //       patients(page:1, limit:1){
  //         totalCount
  //       }
  //     }
  //     `,
  //     );

  //   const { data } = useQuery({
  //     queryKey: ["totalPatients"],
  //     queryFn: fetchTotalPatients,
  //   });

  // ================= MUTATION =================
  const createMutation = useMutation({
    mutationFn: (input: PatientType) =>
      graphqlRequest(
        `
      mutation CreatePatient($input:PatientInput!){
        createPatient(input:$input){
          _id
          firstName
          middleName
          lastName
          birthday
          age
          address
          medicines
        }
      }
      `,
        { input },
      ),

    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("New Patient Added Successfully", {
        duration: 3000,
        style: {
          padding: "4px",
          fontSize: "16px",
        },
      });
    },

    // onError: (error: any) => {
    //   console.error(error);
    //   alert(error.message || "Something went wrong");
    // },
    onError: (error: any) => {
      // const message =
      //   error?.response?.errors?.[0]?.message ||
      //   error?.graphQLErrors?.[0]?.message ||
      //   error.message || error.response?.data?.message ||
      //   "Error creating patient";

      const message = error.message || "Error creating patient";
     
      toast.error(message, {
        duration: 10000,
        style: {
          padding: "4px",
          fontSize: "16px",
          whiteSpace: "pre-line",
        },
      });
    },
  });

  // ================= HANDLE SUBMIT =================
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    // Send mutation
    //createMutation.mutate({ ...form, });
    createMutation.mutate(form);

    // Reset form
    //   setForm({
    //     firstName: "",
    //     middleName: "",
    //     lastName: "",
    //     birthday: "",
    //     age: 0,
    //     address: "",
    //     medicines: [],
    //   });
    //   setLoading(true);

    //   // Simulate loading state for 2 seconds
    //   setTimeout(() => {
    //     setLoading(false);
    //   }, 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "birthday") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setForm((prev) => ({ ...prev, age, birthday: value }));
    }
  };

  const handleMedicineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const newMedicines = checked
        ? [...prev.medicines, value]
        : prev.medicines.filter((m) => m !== value);
      return { ...prev, medicines: newMedicines };
    });
  };

  // useEffect(() => {
  //   console.log("Medicines updated:", form.medicines);
  //   alert("Medicines: " + form.medicines.join(", "));
  // }, [form.medicines]);

  return (
    <div className="patient-form-div w-full pb-10">
      <Banner />
      <div className="p-4 mx-auto border rounded shadow bg-green-50 mt-8 w-9/12">
        <h2 className="font-bold text-xl sm:text-3xl mx-auto text-center mb-12 mt-6">
          ADD NEW PATIENT
        </h2>
        <form onSubmit={handleSubmit} className="mx-auto bg-white p-10 w-8/12">
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="border p-2 w-full mb-6"
          />

          <input
            type="text"
            name="middleName"
            value={form.middleName || ""}
            onChange={handleChange}
            placeholder="Middle Name (optional)"
            className="border p-2 w-full mb-6"
          />

          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="border p-2 w-full mb-6"
          />

          <input
            type="date"
            name="birthday"
            value={form.birthday}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-6"
          />

          <input
            type="number"
            name="age"
            value={form.age || "0"}
            readOnly
            placeholder="Age"
            className="border p-2 w-full bg-gray-100 cursor-not-allowed mb-6"
          />

          <select
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-6"
          >
            <option value="">Select Address</option>
            {addressList.map((address) => (
              <option key={address} value={address}>
                {address}
              </option>
            ))}
          </select>
          <div className="space-y-2">
            <label className="font-semibold block">Medicines:</label>
            {medicinesList.map((medicine) => (
              <label key={medicine} className="block">
                <input
                  type="checkbox"
                  value={medicine}
                  name="medicines"
                  checked={form.medicines.includes(medicine)}
                  onChange={handleMedicineChange}
                  className="mr-2"
                />
                {medicine}
              </label>
            ))}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer mr-6 mt-6"
          >
            {createMutation.isPending ? "Saving Patient..." : "Save Patient"}
          </button>
          <Link
            href={"/dashboard"}
            className={
              loading
                ? "bg-green-300 text-white px-4 py-3 rounded cursor-not-allowed"
                : "bg-green-500 text-white px-4 py-3 rounded hover:bg-green-700 cursor-pointer"
            }
            onClick={()=>setLoading(true)}
          >
            {loading ? "Going Back..." : "Go Back"}
          </Link>
        </form>
      </div>
    </div>
  );
}
