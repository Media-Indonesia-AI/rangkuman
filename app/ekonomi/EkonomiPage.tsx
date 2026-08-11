import { CategoryPageView } from "@/components/CategoryPageView";
import { notFound } from "next/navigation";

export default function EkonomiPage() {
  notFound();
  return <CategoryPageView category="ekonomi" />;
}
