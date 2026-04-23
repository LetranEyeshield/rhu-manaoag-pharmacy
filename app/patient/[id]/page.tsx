"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import toast from "react-hot-toast";
import { PatientType } from "@/app/types/Patient";
import { addressList, medicinesList } from "@/app/constants/lists";
import Banner from "@/app/components/Banner";

export default function EditPatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<PatientType>({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    age: 0,
    address: "",
    medicines: [],
  });

  // ================= FETCH SINGLE =================
  const { data, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () =>
      graphqlRequest(
        `
        query Patient($id:ID!){
          patient(id:$id){
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
        { id },
      ),
    enabled: !!id,
  });

  // PREFILL FORM
  useEffect(() => {
    if (data?.patient) {
      setForm({
        firstName: data.patient.firstName,
        middleName: data.patient.middleName,
        lastName: data.patient.lastName,
        birthday: data.patient.birthday,
        age: data.patient.age,
        address: data.patient.address,
        medicines: data.patient.medicines,
      });
    }
  }, [data]);

  // ================= UPDATE =================
  const updateMutation = useMutation({
    mutationFn: (input: PatientType) =>
      graphqlRequest(
        `
        mutation UpdatePatient($id:ID!, $input:PatientInput!){
          updatePatient(id:$id, input:$input){
            _id
          }
        }
      `,
        { id, input },
      ),

    // onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ["patient"] });
    //   queryClient.invalidateQueries({ queryKey: ["patient", id] });
    //   router.push("/dashboard");
    // },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });

      toast.success("Updated Successfully", {
        duration: 3000,
        style: {
          padding: "4px",
          fontSize: "16px",
        },
      });
      queryClient.setQueryData(["patient", id], (old: any) => ({
        ...old,
        patient: { ...old.patient, ...form },
      }));
      router.push("/dashboard");
    },

    // onError: (error: any) => {
    //   console.error(error);
    //   alert(error.message || "Something went wrong");
    // },
    onError: (error: any) => {
      // const message =
      //   error?.response?.errors?.[0]?.message ||
      //   error.message ||
      //   "Error updating patient";
      const message = error.message || "Error updating patient";
      toast.error(message, {
        duration: 3000,
        style: {
          padding: "4px",
          fontSize: "16px",
        },
      });
    },
  });

  // ================= HANDLE CHANGE =================
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
      const current = prev.medicines || [];
      const updatedMedicines = checked
        ? [...current, value]
        : current.filter((m) => m !== value);
      return { ...prev, medicines: updatedMedicines };
    });
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    updateMutation.mutate(form);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="w-full">
      <Banner />
      <div className="wrapper mx-auto bg-green-50 w-9/12 p-10">
        {/* PAGE TITLE */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-green-500 text-center">
            Edit Patient
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg border border-gray-100 rounded-2xl p-8 space-y-6 w-9/12 mx-auto"
        >
          {/* GRID FORM */}
          <div className="grid md:grid-cols- gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Name
              </label>
              <input
                name="middleName"
                value={form.middleName || ""}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <input
                name="birthday"
                type="date"
                value={form.birthday}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              <input
                name="age"
                type="number"
                value={form.age || 0}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <select
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              >
                <option value="">Select Address</option>
                {addressList.map((address) => (
                  <option key={address} value={address}>
                    {address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold block">Medicines:</label>
              {medicinesList.map((med) => (
                <label key={med} className="block">
                  <input
                    type="checkbox"
                    value={med}
                    checked={form.medicines?.includes(med) || false}
                    onChange={handleMedicineChange}
                    className="mr-2"
                  />
                  {med}
                </label>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 cursor-pointer"
            >
              {updateMutation.isPending ? "Saving..." : "Update Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
