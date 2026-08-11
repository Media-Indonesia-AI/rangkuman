import { CategoryPageView } from "@/components/CategoryPageView";
import { notFound } from "next/navigation";

export default function BisnisPage() {
  notFound();
  return <CategoryPageView category="bisnis" />;
}
