"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";
import { subscribeNewsletterAction } from "@/lib/actions/subscribe-newsletter";

// Client component: the only interactive piece of Footer. Receives already-
// localized heading/subtext as plain strings from the Server Component
// parent — it cannot import @/lib/content itself (server-only boundary,
// see footer.tsx's top comment).
interface NewsletterFormProps {
  heading: string;
  subtext: string;
}

function buildSchema(tErrors: (key: string) => string) {
  return z.object({
    email: z
      .string()
      .min(1, tErrors("required"))
      .email(tErrors("invalidEmail")),
  });
}

type NewsletterFormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function NewsletterForm({
  heading,
  subtext,
}: NewsletterFormProps) {
  const t = useTranslations("common.footer.newsletter");
  const tErrors = useTranslations("common.errors");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const schema = buildSchema((key) => tErrors(key));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: NewsletterFormValues) => {
    setStatus("idle");
    const result = await subscribeNewsletterAction(values);
    if (result.success) {
      setStatus("success");
      reset();
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col gap-8">
        <h2 className="text-text-primary text-32 leading-tight font-semibold tracking-[-0.03em]">
          {heading}
        </h2>
        <p className="text-14 text-text-secondary">{subtext}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex w-full max-w-sm flex-col gap-12"
      >
        <Field data-invalid={!!errors.email || undefined}>
          <label htmlFor="footer-newsletter-email" className="sr-only">
            {t("emailLabel")}
          </label>
          <Input
            id="footer-newsletter-email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email ? "footer-newsletter-email-error" : undefined
            }
            {...register("email")}
          />
          {errors.email && (
            <FieldError id="footer-newsletter-email-error">
              {errors.email.message}
            </FieldError>
          )}
        </Field>

        <Button type="submit" loading={isSubmitting} className="w-full">
          {t("subscribeButton")}
        </Button>

        <div aria-live="polite" className="text-13 min-h-16">
          {status === "success" && (
            <p className="text-text-secondary">{t("successMessage")}</p>
          )}
          {status === "error" && (
            <p className="text-error">{tErrors("somethingWentWrong")}</p>
          )}
        </div>
      </form>
    </div>
  );
}
