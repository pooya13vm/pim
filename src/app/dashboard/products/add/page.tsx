"use client";
import { Suspense } from "react";
import DynamicFormContent from "@/app/form/DynamicFormContent";

export default function AddProductPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <DynamicFormContent mode="add" />
    </Suspense>
  );
}
