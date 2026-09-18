import { redirect } from "next/navigation";

/**
 * Route handler for /profile/whatsapp.
 *
 * The WhatsApp broadcast feature is hidden product-wide. Visiting
 * this URL directly now bounces the user back to `/profile/` so
 * existing bookmarks / shared links never land on the disabled
 * page. To restore the feature, revert this file to its previous
 * re-export of `./WhatsappPage`.
 */
export default function WhatsappPage() {
  redirect("/profile/");
}
