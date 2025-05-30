// import axios from 'axios';

// // export async function signIn(email: string, password: string) {
// //   const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
// //     email,
// //     password,
// //   }, {
// //     withCredentials: true, 
// //   });

// //   console.log('Login:', response.data);
// // }

// export async function signIn(email: string, password: string) {
//   const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
//     email,
//     password,
//   }, {
//     withCredentials: true,
//   });

//   console.log('Login:', response.data);
//   return response.data; // return the response so the caller can use tokens, etc.
// }


// export async function refreshAccessToken() {
//   const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, {
//     withCredentials: true,
//   });

//   console.log('Refreshed Access Token:', response.data.accessToken);
//   return response.data.accessToken;
// }

import axios from 'axios';

export async function signIn(email: string, password: string) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    { email, password },
    { withCredentials: true }
  );

  return response.data; // contains: accessToken, user
}

export async function refreshAccessToken() {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );

  return response.data.accessToken;
}
