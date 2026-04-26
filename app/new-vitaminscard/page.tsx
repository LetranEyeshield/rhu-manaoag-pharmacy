"use client";

import Link from "next/link";
import { useState } from "react";
import { vitaminsCardList } from "../constants/lists";
import Banner from "../components/Banner";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "@/app/lib/graphql-client";
import { VitaminscardType } from "../types/Vitaminscard";
import { useRouter } from "next/navigation";

export default function VitaminscardForm() {
  const [form, setForm] = useState<VitaminscardType>({
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

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  // ================= MUTATION =================
  const createMutation = useMutation({
    mutationFn: (input: VitaminscardType) =>
      graphqlRequest(
        `
      mutation CreateVitaminscard($input:VitaminscardInput!){
        createVitaminscard(input:$input){
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
        { input },
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vitaminscards"] });
      toast.success("New Vitamins Card Added Successfully", {
        duration: 3000,
        style: {
          padding: "4px",
          fontSize: "16px",
        },
      });
      router.push("/dashboard/vitamins");
    },

    onError: (error: any) => {
      const message = error.message || "Error creating vitamins card";

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

    createMutation.mutate(form);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="vitamins-form-div w-full pb-10">
      <Banner />
      <div className="px-4 pt-7 pb-14 mx-auto bg-green-50 mt-8 w-9/12">
        <form
          onSubmit={handleSubmit}
          className="w-9/12 mx-auto p-10 bg-white border rounded shadow mt-10"
        >
          <h2 className="font-bold text-xl sm:text-3xl mx-auto text-center mb-8">
            ADD CARD RECORD
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
            {vitaminsCardList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <label htmlFor="date">DATE:</label>

          <input
            type="date"
            name="cardDate"
            value={form.cardDate}
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
            {createMutation.isPending ? "Saving Card..." : "Save Card"}
          </button>
          <Link
            href={"/dashboard/vitamins"}
            className="back-btn mt-4 bg-green-500 text-white px-4 py-3 rounded hover:bg-green-700 cursor-pointer"
            onClick={() => setLoading(true)}
          >
            {loading ? "Going Back..." : "Go Back"}
          </Link>
        </form>
      </div>
    </div>
  );
}
