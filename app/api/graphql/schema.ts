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

  type Maintenancecard {
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

  type MaintenancecardPagination {
    maintenancecards: [Maintenancecard]
    totalCount: Int!
    totalPages: Int!
  }

  input MaintenancecardInput {
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

  type Vitaminscard {
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

  type VitaminscardPagination {
    vitaminscards: [Vitaminscard]
    totalCount: Int!
    totalPages: Int!
  }

  input VitaminscardInput {
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
    patients(page: Int!, limit: Int!, search: String): PatientPagination!
    patient(id: ID!): Patient

    medscards(page: Int!, limit: Int!, search: String): MedscardPagination
    medscard(id: ID!): Medscard

    maintenancecards(
      page: Int!
      limit: Int!
      search: String
    ): MaintenancecardPagination
    maintenancecard(id: ID!): Maintenancecard

     vitaminscards(
      page: Int!
      limit: Int!
      search: String
    ): VitaminscardPagination
    vitaminscard(id: ID!): Vitaminscard
  }

  type Mutation {
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: PatientInput!): Patient!
    deletePatient(id: ID!): Boolean!

    createMedscard(input: MedscardInput): Medscard
    updateMedscard(id: ID!, input: MedscardInput): Medscard
    deleteMedscard(id: ID!): Boolean!

    createMaintenancecard(input: MaintenancecardInput): Maintenancecard
    updateMaintenancecard(id: ID!, input: MaintenancecardInput): Maintenancecard
    deleteMaintenancecard(id: ID!): Boolean!

    createVitaminscard(input: VitaminscardInput): Vitaminscard
    updateVitaminscard(id: ID!, input: VitaminscardInput): Vitaminscard
    deleteVitaminscard(id: ID!): Boolean!
  }
`;
