export interface User {
  id: string;
  username: string;
  email: string;
  role: "student" | "senior" | "admin";
  is_verified_senior: boolean;
  phone_verified: boolean;
}
