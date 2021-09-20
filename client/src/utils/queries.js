import { gql } from '@apollo/client';

export const GET_ME = gql`
  query me {
    me {
      _id
      bookCount
      savedBooks {
        authors
        description
        bookId
        image
        link
        title
      }
    }
  }
`;