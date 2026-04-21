import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen wrapper bg-green-100 flex flex-col px-6">
      <h1 className="text-2xl sm:text-5xl times-new-roman font-bold text-center mt-10 mb-2 bg-green-300 rounded w-9/12 mx-auto py-6">
        RHU-MANAOAG PHARMACY
      </h1>
      <img
        // src="/images/pharm-banner.jpg"
        // src="/images/the-best-rhu-friends.jpg"
        src="/images/logo.jpg"
        alt="Pharm Banner"
        className="banner-img-in-page mx-auto"
      />
      {/* <div className="mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 md:p-12 max-w-xl w-full text-center text-white">
        <div className="mt-8 flex flex-col sm:flex-row gap-4"> */}
          {/* <Link
            href="/register"
            className="flex-1 bg-white text-indigo-600 font-semibold py-3 rounded-xl hover:bg-gray-100 transition"
          >
            Register User
          </Link> */}

          <Link
            href="/login"
            className="inline-block mx-auto mt-10 bg-green-500 border border-white/30 py-3 px-6 text-white font-semibold rounded-xl hover:bg-green-600 hover:text-black transition"
          >
            Click Here To Log In
          </Link>
        {/* </div>
      </div> */}
    </div>
  );
}
