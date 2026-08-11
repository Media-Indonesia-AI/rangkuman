import { CategoryPageView } from "@/components/CategoryPageView";
import { notFound } from "next/navigation";

export default function KebijakanPage() {
  notFound();
  return <CategoryPageView category="kebijakan" />;
}