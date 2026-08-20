import React from "react";
import { ProtectedRoute as CentralProtectedRoute, type ProtectedRouteProps } from "../components/auth/access-control";

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  return <CentralProtectedRoute {...props} />;
};


