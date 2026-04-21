// import axios from "axios";

// export const graphqlRequest = async (query: string, variables?: any) => {
//   const res = await axios.post("/api/graphql", {
//     query,
//     variables,
//   });

//   return res.data.data;
// };

// import axios from "axios";

// export const graphqlRequest = async (query: string, variables?: any) => {
//   const res = await axios.post(
//     "/api/graphql",
//     {
//       query,
//       variables,
//     },
//     {
//       withCredentials: true, // 🔥 THIS IS THE FIX
//     }
//   );

//   return res.data.data;
// };


import axios from "axios";

export const graphqlRequest = async (query: string, variables?: any) => {
  const res = await axios.post(
    "/api/graphql",
    {
      query,
      variables,
    },
    {
      withCredentials: true,
    }
  );

  // 🔥 IMPORTANT: handle GraphQL errors properly
  // if (res.data.errors && res.data.errors.length > 0) {
  //   throw {
  //     message: res.data.errors[0].message,
  //     graphQLErrors: res.data.errors,
  //   };
  // }

  if (res.data.errors && res.data.errors.length > 0) {
  const error = res.data.errors[0];

  throw {
    message:
      error.extensions?.originalError?.message || // ✅ real message
      error.message || // fallback
      "Something went wrong",
    graphQLErrors: res.data.errors,
  };
}

  return res.data.data;
};

