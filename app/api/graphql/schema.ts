export const typeDefs = /* GraphQL */ `
  type Patient {
    _id: ID!
    firstName: String!
    middleName: String
    lastName: String!
    birthday: String!
    age: Int!
    address: String!
    medicines: [String!]!
    createdAt: String
    updatedAt: String
  }

  type PatientPagination {
    patients: [Patient!]!
    totalCount: Int!
    totalPages: Int!
  }

  input PatientInput {
    firstName: String!
    middleName: String
    lastName: String!
    birthday: String!
    age: Int!
    address: String!
    medicines: [String!]!
  }


  type Query {
    patients(page: Int!, limit: Int!, search: String): PatientPagination!
    patient(id: ID!): Patient
  }

  type Mutation {
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: PatientInput!): Patient!
    deletePatient(id: ID!): Boolean!
  }
`;
