import jwt from "jsonwebtoken";

export const GenerateJwt = (value, type = "id") => {
  const payload = type === "email" ? { email: value } : { id: value };
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "10d" });
};

// export const calculateDistance = (coords1, coords2) => {
//   const [lat1, lon1] = coords1;
//   const [lat2, lon2] = coords2;
//   const R = 6371; // Radius of the Earth in km

//   const dLat = ((lat1) - (lat2)) * (Math.PI / 180);
//   const dLon = ((lon1) - (lon2)) * (Math.PI / 180);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * (Math.PI / 180)) *
//       Math.cos(lat2 * (Math.PI / 180)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c; // Distance in km
// };

export const calculateDistance = (coords1, coords2) => {
  const [lat1, lon1] = coords1.map(Number);
  const [lat2, lon2] = coords2.map(Number);
  const R = 6371; // Radius of the Earth in km

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
    Math.cos(lat2Rad) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
};

