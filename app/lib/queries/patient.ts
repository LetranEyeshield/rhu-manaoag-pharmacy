import { graphqlRequest } from "../graphql-client";


export const fetchPatients = (page:number, search:string) =>
  graphqlRequest(
    `
    query Patients($page:Int!, $limit:Int!, $search:String){
      patients(page:$page, limit:$limit, search:$search){
        patients{
          _id
          patientId
          fullname
          age
          address
          dateSigned
          diagnosis
          remarks
        }
        totalCount
        totalPages
      }
    }
  `,
    { page, limit: 10, search }
  );

export const fetchPatientInfoAndMedcertDateSigned = (page:number, search:string) =>
graphqlRequest(
`
query PatientInfoAndMedcertDateSigned($page:Int!, $limit:Int!, $search:String){
  patients(page:$page, limit:$limit, search:$search){
    patients{
      _id
      patientId
      fullname
      age
      address
      diagnosis
      remarks
      medcerts{
        dateSigned
      }
    }
    totalCount
    totalPages
  }
}
`,
{ page, limit:10, search }
);