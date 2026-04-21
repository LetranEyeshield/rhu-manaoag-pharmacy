"use client";
import Link from "next/link";
import Banner from "../components/Banner";
import LogoutButton from "../components/Logout";
// import PatientList from "./components/PatientList";

export default function Dashboard() {

  return (
    <div className="w-full">
      <main className="container flex flex-col ">
        <Banner />
        <div className="home-buttons w-full flex justify-center py-8">
          <Link
            href={"/patientForm"}
            className="patientform-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
          >
            Add New Patient
          </Link>
          <Link
            href={"/reports"}
            className="reports-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
          >
            Reports
          </Link>
          <Link
            href={"/cards"}
            className="reports-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
          >
            Meds Card
          </Link>
          <Link
            href={"/maintenance"}
            className="reports-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
          >
            Maintenance Card
          </Link>
          <Link
            href={"/vitamins"}
            className="reports-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 mr-8"
          >
            Vitamins Card
          </Link>
          <LogoutButton />
        </div>
        {/* <PatientList /> */}
      </main>
    </div>
  );
}
