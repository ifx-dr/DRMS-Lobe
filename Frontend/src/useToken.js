// export default function 

// import { useState } from 'react';

// export default function useToken() {
//   const getToken = () => {
//     const tokenString = sessionStorage.getItem('token');
//     const userToken = JSON.parse(tokenString);
//     if(userToken!=null){
//         return userToken;
//     }
//     else{
//         // default user info
//         return {
//             ID: '',
//             Name:'',
//         }
//     }
//   };

//   const [token, setToken] = useState(getToken());

//   const saveToken = userToken => {
//     sessionStorage.setItem('token', JSON.stringify(userToken));
//     setToken(userToken);
//   };

//   return {
//     setToken: saveToken,
//     token
//   }
// }