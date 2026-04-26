import React from "react";
import { useParams } from "react-router-dom";
import CategoryDynamicForm from "../components/CategoryDynamicForm";

export default function CategoryFormPage() {
  const { categoryId } = useParams();

  return <CategoryDynamicForm categoryId={categoryId} />;
}
