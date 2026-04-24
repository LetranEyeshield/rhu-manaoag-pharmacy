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

  type Medscard {
    _id: ID!
    cardName: String!
    cardDate: String!
    initialStock: String
    qtyIn: String
    lotNoIn: String
    expiryIn: String
    qtyOut: String
    lotNoOut: String
    expiryOut: String
    balance: String
  }

  type MedscardPagination {
    medscards: [Medscard]
    totalCount: Int!
    totalPages: Int!
  }

  input MedscardInput {
    cardName: String!
    cardDate: String!
    initialStock: String
    qtyIn: String
    lotNoIn: String
    expiryIn: String
    qtyOut: String
    lotNoOut: String
    expiryOut: String
    balance: String
  }

  type Query {
    medscards(page: Int!, limit: Int!, search: String): MedscardPagination
    medscard(id: ID!): Medscard
  }

  type Mutation {
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: PatientInput!): Patient!
    deletePatient(id: ID!): Boolean!

    createMedscard(input: MedscardInput): Medscard
    updateMedscard(id: ID!, input: MedscardInput): Medscard
    deleteMedscard(id: ID!): Boolean!
  }
`;
