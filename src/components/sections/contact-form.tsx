"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { submitContactAction } from "@/lib/actions/submit-contact";

const SERVICE_KEYS = [
  "web",
  "mobile",
  "ecommerce",
  "saas",
  "branding",
  "other",
] as const;

const BUDGET_KEYS = [
  "under10k",
  "10to25k",
  "25to50k",
  "over50k",
  "notSure",
] as const;

function buildSchema(tErrors: (key: string) => string) {
  return z.object({
    name: z.string().min(1, tErrors("required")).min(2, tErrors("tooShort")),
    email: z
      .string()
      .min(1, tErrors("required"))
      .email(tErrors("invalidEmail")),
    service: z.string().min(1, tErrors("required")),
    budget: z.string().min(1, tErrors("required")),
    message: z
      .string()
      .min(1, tErrors("required"))
      .min(10, tErrors("tooShort")),
    // Honeypot — real visitors never see or fill this field (see the
    // sr-only input below); a filled value marks the submission as spam.
    company: z.string().optional(),
  });
}

type ContactFormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function ContactForm() {
  // Moved out of `home.contact.form` when /contact started rendering this
  // same component — the i18n-keys rule is that anything used on two or
  // more pages lives in `common` rather than under one page's namespace.
  const t = useTranslations("common.contactForm");
  const tErrors = useTranslations("common.errors");
  const tActions = useTranslations("common.actions");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const schema = buildSchema((key) => tErrors(key));

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      service: "",
      budget: "",
      message: "",
      company: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("idle");
    const result = await submitContactAction(values);
    if (result.success) {
      setStatus("success");
      reset();
    } else {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
          {...register("company")}
        />

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
          <Field data-invalid={!!errors.name || undefined}>
            <FieldLabel htmlFor="contact-name">{t("nameLabel")}</FieldLabel>
            <Input
              id="contact-name"
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <FieldError id="contact-name-error">
                {errors.name.message}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor="contact-email">{t("emailLabel")}</FieldLabel>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? "contact-email-error" : undefined
              }
              {...register("email")}
            />
            {errors.email && (
              <FieldError id="contact-email-error">
                {errors.email.message}
              </FieldError>
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
          <Field data-invalid={!!errors.service || undefined}>
            <FieldLabel htmlFor="contact-service">
              {t("serviceLabel")}
            </FieldLabel>
            <Controller
              control={control}
              name="service"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="contact-service"
                    aria-invalid={!!errors.service}
                    aria-describedby={
                      errors.service ? "contact-service-error" : undefined
                    }
                  >
                    <SelectValue placeholder={t("servicePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`serviceOptions.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.service && (
              <FieldError id="contact-service-error">
                {errors.service.message}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={!!errors.budget || undefined}>
            <FieldLabel htmlFor="contact-budget">{t("budgetLabel")}</FieldLabel>
            <Controller
              control={control}
              name="budget"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="contact-budget"
                    aria-invalid={!!errors.budget}
                    aria-describedby={
                      errors.budget ? "contact-budget-error" : undefined
                    }
                  >
                    <SelectValue placeholder={t("budgetPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`budgetOptions.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.budget && (
              <FieldError id="contact-budget-error">
                {errors.budget.message}
              </FieldError>
            )}
          </Field>
        </div>

        <Field data-invalid={!!errors.message || undefined}>
          <FieldLabel htmlFor="contact-message">{t("messageLabel")}</FieldLabel>
          <Textarea
            id="contact-message"
            placeholder={t("messagePlaceholder")}
            aria-invalid={!!errors.message}
            className="border"
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            {...register("message")}
          />
          {errors.message && (
            <FieldError id="contact-message-error">
              {errors.message.message}
            </FieldError>
          )}
        </Field>

        <Button type="submit" loading={isSubmitting} className="w-full">
          {isSubmitting ? tActions("sending") : tActions("submit")}
        </Button>

        <div aria-live="polite" className="text-14 min-h-20">
          {status === "success" && (
            <p className="text-text-secondary">{t("successMessage")}</p>
          )}
          {status === "error" && (
            <p className="text-error">{tErrors("somethingWentWrong")}</p>
          )}
        </div>
      </FieldGroup>
    </form>
  );
}
