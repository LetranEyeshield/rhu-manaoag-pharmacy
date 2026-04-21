export default function Banner() {
  return (
    <div className="banner-div">
      {/* <h1 className="text-2xl sm:text-5xl times-new-roman font-bold text-center my-10 bg-green-300 rounded w-9/12 mx-auto py-6">
        PHARM NCD PATIENT LIST
      </h1> */}
      <h1 className="text-2xl sm:text-5xl times-new-roman font-bold text-center mt-10 mb-2 bg-green-300 rounded w-9/12 mx-auto py-6">
        RHU-MANAOAG PHARMACY
      </h1>
      <img
        // src="/images/pharm-banner.jpg"
        // src="/images/the-best-rhu-friends.jpg"
         src="/images/logo.jpg"
        alt="Pharm Banner"
        className="banner-img mx-auto"
      />
    </div>
  );
}
