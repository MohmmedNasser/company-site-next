import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

interface ContactDetailsProps {
  email: string;
  phone: string;
  address: string;
}

/**
 * Strips a phone number down to what `tel:` accepts.
 *
 * A displayed number carries spaces and grouping for readability
 * ("+20 100 000 0000"); `tel:` wants digits and an optional leading plus.
 * Handing the display string straight to the href works in most dialers and
 * silently fails in some, which is the worst kind of bug to ship on a
 * contact page.
 */
function telHref(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `tel:${phone.trim().startsWith("+") ? "+" : ""}${digits}`;
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-16">
      {/* Same bordered circle the home contact section uses for its phone
          row — reused so the two treatments of the same information stay
          recognisably one thing. */}
      <span className="border-border flex size-40 shrink-0 items-center justify-center rounded-full border">
        {icon}
      </span>
      <div className="flex flex-col gap-4">
        <dt className="text-12 text-text-secondary font-medium">{label}</dt>
        <dd className="text-16 text-text-primary font-medium">{children}</dd>
      </div>
    </div>
  );
}

/**
 * Email, phone, and address — the ways to reach the studio without filling
 * in a form.
 *
 * A <dl>, because these are genuinely term/value pairs and the pairing is
 * what a screen reader needs to convey. Social links are deliberately not
 * here: the footer carries them on every page including this one, and
 * repeating them a few hundred pixels above would be the same list twice.
 */
export default async function ContactDetails({
  email,
  phone,
  address,
}: ContactDetailsProps) {
  const t = await getTranslations("contact.details");

  const iconClasses = "text-text-primary size-16";
  const linkClasses =
    "hover:text-text-secondary duration-micro transition-colors";

  return (
    <div className="flex flex-col gap-24">
      <h2 className="text-20 text-text-primary font-semibold">
        {t("heading")}
      </h2>

      <dl className="flex flex-col gap-24">
        <DetailRow
          label={t("emailLabel")}
          icon={<Mail aria-hidden="true" className={iconClasses} />}
        >
          {/* dir="ltr" on the address itself: an email or phone number is a
              Latin-script identifier, and the bidi algorithm otherwise
              reorders its punctuation when it sits inside Arabic copy. */}
          <a href={`mailto:${email}`} dir="ltr" className={linkClasses}>
            {email}
          </a>
        </DetailRow>

        <DetailRow
          label={t("phoneLabel")}
          icon={<Phone aria-hidden="true" className={iconClasses} />}
        >
          <a href={telHref(phone)} dir="ltr" className={linkClasses}>
            {phone}
          </a>
        </DetailRow>

        <DetailRow
          label={t("addressLabel")}
          // MapPin is not directional — it must NOT mirror under RTL, unlike
          // the arrows and chevrons elsewhere in this project.
          icon={<MapPin aria-hidden="true" className={iconClasses} />}
        >
          {address}
        </DetailRow>
      </dl>
    </div>
  );
}
