import type { NextConfig } from "next";

const DASHBOARD_PATHS = [
  "/Features/manager_dashboard/:path*",
  "/Features/company-admin_dashboard/:path*",
  "/Features/platform-admin_dashboard/:path*",
  "/Features/department_dashboard/:path*",
  "/Features/casual-staff_dashboard/:path*",
];

const nextConfig: NextConfig = {
  async headers() {
    return DASHBOARD_PATHS.map((source) => ({
      source,
      headers: [
        { key: "Cache-Control", value: "no-store, must-revalidate" },
      ],
    }));
  },
};

export default nextConfig;
