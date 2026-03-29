import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("workouts", "routes/workouts._index.tsx"),
  route("workouts/new", "routes/workouts.new.tsx"),
  route("workouts/:id", "routes/workouts.$id.tsx"),
  route("stats", "routes/stats.tsx"),
  route("profile", "routes/profile.tsx"),
  route("share/:id", "routes/share.$id.tsx"),
] satisfies RouteConfig;