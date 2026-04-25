"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import toast from "react-hot-toast";
import { MedscardType } from "@/app/types/Medscard";
import Banner from "@/app/components/Banner";
import Link from "next/link";
import { medsCardList } from "@/app/constants/lists";

export default function EditMedscardPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<MedscardType>({
    cardName: "",
    cardDate: "",
    initialStock: "",
    qtyIn: "",
    lotNoIn: "",
    expiryIn: "",
    qtyOut: "",
    lotNoOut: "",
    expiryOut: "",
    balance: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= FETCH SINGLE =================
  const { data, isLoading } = useQuery({
    queryKey: ["medscard", id],
    queryFn: () =>
      graphqlRequest(
        `
        query Medscard($id:ID!){
          medscard(id:$id){
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
        }
      `,
        { id },
      ),
    enabled: !!id,
  });

  // PREFILL FORM
  useEffect(() => {
    if (data?.medscard) {
      setForm({
        cardName: data.medscard.cardName,
        cardDate: data.medscard.cardDate,
        initialStock: data.medscard.initialStock,
        qtyIn: data.medscard.qtyIn,
        lotNoIn: data.medscard.lotNoIn,
        expiryIn: data.medscard.expiryIn,
        qtyOut: data.medscard.qtyOut,
        lotNoOut: data.medscard.lotNoOut,
        expiryOut: data.medscard.expiryOut,
        balance: data.medscard.balance,
      });
    }
  }, [data]);

  // ================= UPDATE =================
  const updateMutation = useMutation({
    mutationFn: (input: MedscardType) =>
      graphqlRequest(
        `
        mutation UpdateMedscard($id:ID!, $input:MedscardInput!){
          updateMedscard(id:$id, input:$input){
            _id
          }
        }
      `,
        { id, input },
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medscards"] });
      queryClient.invalidateQueries({ queryKey: ["medscard", id] });

      toast.success("Updated Successfully", {
        duration: 3000,
        style: {
          padding: "4px",
          fontSize: "16px",
        },
      });
      queryClient.setQueryData(["medscard", id], (old: any) => ({
        ...old,
        medscard: { ...old.medscard, ...form },
      }));
       router.push("/dashboard/medscard");
    },

    onError: (error: any) => {
      const message = error.message || "Error updating meds card!";
      toast.error(message, {
        duration: 10000,
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
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    updateMutation.mutate(form);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="patient-form-div w-full pb-10">
      <Banner />
      <div className="px-4 pt-7 pb-14 mx-auto bg-green-50 mt-8 w-9/12">
        <form
          onSubmit={handleSubmit}
          className="w-9/12 mx-auto p-10 bg-white border rounded shadow mt-10"
        >
          <h2 className="font-bold text-xl sm:text-3xl mx-auto text-center mb-8">
            EDIT MEDS CARD
          </h2>
          <select
            name="cardName"
            value={form.cardName}
            onChange={handleChange}
            required
            className="border p-2 w-full mb-4"
          >
            <option value="" disabled>
              Select Card Name
            </option>
            {medsCardList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <label htmlFor="date">DATE:</label>
          {/* <input
            type="date"
            name="cardDate"
            value={form.cardDate.toISOString().split("T")[0]} // format to YYYY-MM-DD
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                cardDate: new Date(e.target.value), // parse back to Date
              }))
            }
            // value={form.cardDate}
            //onChange={handleChange}
            required
            className="border p-2 w-full"
          /> */}
          <input
            type="date"
            name="cardDate"
            value={form.cardDate.toString()}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <label htmlFor="initialStock"></label>
          <input
            type="text"
            name="initialStock"
            value={form.initialStock}
            onChange={handleChange}
            placeholder="Initial Stock"
            className="border p-2 w-full mt-3 mb-4"
          />
          <div className="card-in w-full">
            <h3 className="text-center font-bold text-xl sm:text-4xl my-3 bg-green-300">
              Card In
            </h3>
            <label htmlFor="qtyIn"></label>
            <input
              type="text"
              name="qtyIn"
              value={form.qtyIn}
              onChange={handleChange}
              placeholder="Qty"
              className="border p-2 w-full mt-3"
            />
            <label htmlFor="lotNoIN"></label>
            <input
              type="text"
              name="lotNoIn"
              value={form.lotNoIn}
              onChange={handleChange}
              placeholder="Lot No"
              className="border p-2 w-full mt-3 mb-2"
            />
            <label htmlFor="expiryIn">EXPIRY DATE:</label>
            <input
              type="date"
              name="expiryIn"
              value={form.expiryIn ? form.expiryIn.toString() : ""}
              onChange={handleChange}
              className="border p-2 w-full mb-3"
            />
          </div>

          <div className="card-in div w-full">
            <h3 className="text-center font-bold text-xl sm:text-4xl my-3 bg-green-300">
              Card OUT
            </h3>
            <label htmlFor="qtyOut"></label>
            <input
              type="text"
              name="qtyOut"
              value={form.qtyOut}
              onChange={handleChange}
              placeholder="Qty"
              className="border p-2 w-full"
            />
            <label htmlFor="lotNoOut"></label>
            <input
              type="text"
              name="lotNoOut"
              value={form.lotNoOut}
              onChange={handleChange}
              placeholder="Lot No"
              className="border p-2 w-full mb-2 mt-3"
            />
            <label htmlFor="expiryOut">EXPIRY DATE:</label>
            <input
              type="date"
              name="expiryOut"
              // value={
              //   form.expiryOut ? form.expiryOut.toISOString().split("T")[0] : ""
              // }
              value={form.expiryOut ? form.expiryOut.toString() : ""}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </div>
          <label htmlFor="balance"></label>
          <input
            type="text"
            name="balance"
            value={form.balance}
            onChange={handleChange}
            placeholder="Balance"
            className="border p-2 w-full mt-3"
          />

          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 cursor-pointer mr-6"
          >
            {updateMutation.isPending ? "Updating Card..." : "Update Card"}
          </button>
          <Link
            href={"/dashboard/medscard"}
            onClick={() => setLoading(true)}
            className="back-btn mt-4 bg-green-500 text-white px-4 py-3 rounded hover:bg-green-700 cursor-pointer"
          >
            {loading ? "Going Back..." : "Go Back"}
          </Link>
        </form>
      </div>
    </div>
  );
}
