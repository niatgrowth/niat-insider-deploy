// eslint-config-next@16 default export is a flat config array (length 3).
// Spread it directly — this is the correct Next.js 16 pattern.
import nextConfig from "eslint-config-next";

export default [...nextConfig];
