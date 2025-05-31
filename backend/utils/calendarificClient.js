// // utils/calendarificClient.js

// import axios from 'axios';

// const API_KEY = process.env.CALENDARIFIC_API_KEY;
// if (!API_KEY) {
//   throw new Error(
//     "CALENDARIFIC_API_KEY not set in environment. Please add it to your .env file."
//   );
// }

// const DEFAULT_COUNTRY = "IN";

// export const isHoliday = async (dateObj, user) => {
//   if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
//     throw new Error("Invalid date object passed to CalendarificClient.isHoliday");
//   }

//   const countryCode = (user?.countryCode || DEFAULT_COUNTRY).toUpperCase();
//   const year = dateObj.getUTCFullYear();
//   const month = dateObj.getUTCMonth() + 1;
//   const day = dateObj.getUTCDate();

//   const url = "https://calendarific.com/api/v2/holidays";
//   const params = { api_key: API_KEY, country: countryCode, year, month, day };

//   try {
//     const response = await axios.get(url, { params });
//     if (
//       !response.data ||
//       !response.data.response ||
//       !Array.isArray(response.data.response.holidays)
//     ) {
//       console.error(
//         "CalendarificClient: unexpected response shape:",
//         JSON.stringify(response.data)
//       );
//       return false;
//     }
//     return response.data.response.holidays.length > 0;
//   } catch (err) {
//     if (err.response) {
//       const status = err.response.status;
//       const data = err.response.data;

//       // 401/403 → invalid API key
//       if (status === 401 || status === 403) {
//         console.error(
//           `Calendarific API auth error (HTTP ${status}):`,
//           JSON.stringify(data)
//         );
//         throw new Error(
//           `Calendarific API authentication failed (HTTP ${status}).`
//         );
//       }

//       // 400 → invalid params (treat as no holiday)
//       if (status === 400) {
//         console.warn(
//           `CalendarificClient: 400 response (invalid params?):`,
//           JSON.stringify(data)
//         );
//         return false;
//       }

//       // 5xx → server error (treat as no holiday)
//       console.error(
//         `CalendarificClient: server error (HTTP ${status}):`,
//         JSON.stringify(data)
//       );
//       return false;
//     } else if (err.request) {
//       console.error("CalendarificClient: no response from Calendarific", err.request);
//       return false;
//     } else {
//       console.error("CalendarificClient: unexpected error:", err.message);
//       return false;
//     }
//   }
// };

// export default { isHoliday };


// utils/calendarificClient.js

import axios from 'axios';

// Only read the API key at runtime; do NOT throw here.
const API_KEY = process.env.CALENDARIFIC_API_KEY || "";

const DEFAULT_COUNTRY = "IN";

export const isHoliday = async (dateObj, user) => {
  // If no API key, skip all holiday checks:
  if (!API_KEY) {
    console.log("CALENDARIFIC_API_KEY not set in environment. Skipping holiday checks.");
    return false;
  }

  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    throw new Error("Invalid date object passed to CalendarificClient.isHoliday");
  }

  const countryCode = (user?.countryCode || DEFAULT_COUNTRY).toUpperCase();
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  const day = dateObj.getUTCDate();

  const url = "https://calendarific.com/api/v2/holidays";
  const params = { api_key: API_KEY, country: countryCode, year, month, day };

  try {
    const response = await axios.get(url, { params });
    if (
      !response.data ||
      !response.data.response ||
      !Array.isArray(response.data.response.holidays)
    ) {
      console.error(
        "CalendarificClient: unexpected response shape:",
        JSON.stringify(response.data)
      );
      return false;
    }
    return response.data.response.holidays.length > 0;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const data = err.response.data;

      // 401/403 → invalid API key
      if (status === 401 || status === 403) {
        console.error(
          `Calendarific API auth error (HTTP ${status}):`,
          JSON.stringify(data)
        );
        return false;
      }

      // 400 → invalid params (treat as no holiday)
      if (status === 400) {
        console.warn(
          `CalendarificClient: 400 response (invalid params?):`,
          JSON.stringify(data)
        );
        return false;
      }

      // 5xx → server error (treat as no holiday)
      console.error(
        `CalendarificClient: server error (HTTP ${status}):`,
        JSON.stringify(data)
      );
      return false;
    } else if (err.request) {
      console.error("CalendarificClient: no response from Calendarific", err.request);
      return false;
    } else {
      console.error("CalendarificClient: unexpected error:", err.message);
      return false;
    }
  }
};

export default { isHoliday };
