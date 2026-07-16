import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("admin/login", "routes/admin/login.tsx"),
  route("admin/status", "routes/admin/status.tsx"),
  route("admin/logout", "routes/admin/logout.tsx"),
] satisfies RouteConfig;
