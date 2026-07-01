import { Redirect } from "expo-router";
import React from "react";


export default function Index() {
  // For now, redirect to login page
  // Later, this will check if user is authenticated and redirect accordingly
  return <Redirect href="/login" />;
}
