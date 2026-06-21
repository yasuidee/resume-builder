"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Check,
  Loader2,
  Plus,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  computeResumeCompletion,
  GENDERS,
  EDU_STATUSES,
  type ResumeFormValues,
} from "@/lib/validation/resume";
import { saveResume } from "@/lib/actions/documents";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StepCard, Field } from "@/components/editor/fields";
import { VersionSaveButton } from "@/components/editor/version-save-button";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved";

const STEPS = [1, 2, 3] as const;

export function ResumeEditor({
  documentId,
  initialValues,
}: {
  documentId: string;
  initialValues: ResumeFormValues;
}) {
  const t = useTranslations("Editor");
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const form = useForm<ResumeFormValues>({
    defaultValues: initialValues,
    mode: "onChange",
  });
  const { register, control, watch } = form;
  const educations = useFieldArray({ control, name: "educations" });

  const values = watch();
  const completion = computeResumeCompletion(values as ResumeFormValues);

  const persist = useDebouncedCallback((data: ResumeFormValues) => {
    void saveResume(documentId, data).then(() => setStatus("saved"));
  }, 1500);

  useEffect(() => {
    const sub = form.watch((data) => {
      setStatus("saving");
      persist(data as ResumeFormValues);
    });
    return () => sub.unsubscribe();
  }, [form, persist]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {status === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("autosaveSaving")}
            </>
          ) : status === "saved" ? (
            <>
              <Check className="size-4 text-emerald-600" />
              {t("autosaveSaved")}
            </>
          ) : (
            <span>{t("autosaveIdle")}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <VersionSaveButton documentId={documentId} />
          <Button asChild variant="outline" size="sm">
            <Link href={`/documents/${documentId}/preview`}>
              <Eye className="size-4" />
              {t("preview")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Completion */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{t("completion")}</span>
          <span className="font-semibold text-slate-700">{completion}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Step nav */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {STEPS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
              step === s
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            <span className="block text-[11px] text-slate-400">
              STEP {s}
            </span>
            <span className="font-medium">{t(`step${s}` as const)}</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {step === 1 && (
          <StepCard lead={t("step1Lead")}>
            <Field label={t("fullName")} required hint={t("whyName")}>
              <Input
                {...register("fullName")}
                placeholder={t("placeholderName")}
              />
            </Field>
            <Field label={t("fullNameKana")} required hint={t("whyKana")}>
              <Input
                {...register("fullNameKana")}
                placeholder={t("placeholderKana")}
              />
            </Field>
            <Field label={t("romajiName")} optional>
              <Input {...register("romajiName")} placeholder="Taro Yamada" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("birthDate")} required>
                <Input type="date" {...register("birthDate")} />
              </Field>
              <Field label={t("gender")} optional>
                <Select {...register("gender")}>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {t(
                        `gender${g.charAt(0).toUpperCase()}${g.slice(1)}` as const,
                      )}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label={t("email")} required>
              <Input
                type="email"
                {...register("email")}
                placeholder="you@example.com"
              />
            </Field>
            <Field label={t("phone")} required>
              <Input
                type="tel"
                {...register("phone")}
                placeholder="090-1234-5678"
              />
            </Field>
            <Field label={t("currentAddress")} required>
              <Input {...register("currentAddress")} />
            </Field>
            <Field label={t("contactAddress")} optional>
              <Input {...register("contactAddress")} />
            </Field>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard lead={t("step2Lead")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("residenceStatus")} optional hint={t("whyResidence")}>
                <Input {...register("residenceStatus")} />
              </Field>
              <Field label={t("residenceExpiry")} optional>
                <Input type="date" {...register("residenceExpiry")} />
              </Field>
            </div>
            <Field label={t("workRestriction")} optional>
              <Input {...register("workRestriction")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("japaneseLevel")} required>
                <Input
                  {...register("japaneseLevel")}
                  placeholder="日常会話／ビジネス など"
                />
              </Field>
              <Field label={t("jlpt")} optional>
                <Select {...register("jlpt")}>
                  <option value="">—</option>
                  {["N1", "N2", "N3", "N4", "N5"].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("nativeLanguage")} required>
                <Input {...register("nativeLanguage")} />
              </Field>
              <Field label={t("englishLevel")} optional>
                <Input {...register("englishLevel")} />
              </Field>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="checkbox"
                {...register("showResidenceOnResume")}
                className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  {t("showResidenceOnResume")}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {t("showResidenceHint")}
                </span>
              </span>
            </label>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard lead={t("step3Lead")}>
            {educations.fields.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                {t("educationEmpty")}
              </p>
            )}
            <div className="grid gap-4">
              {educations.fields.map((f, index) => (
                <Card key={f.id} className="border-slate-200">
                  <CardContent className="grid gap-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">
                        #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => educations.remove(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                        {t("removeEducation")}
                      </Button>
                    </div>
                    <Field label={t("schoolName")} required>
                      <Input
                        {...register(`educations.${index}.schoolName`)}
                        placeholder={t("placeholderSchool")}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t("schoolNameJa")} optional>
                        <Input
                          {...register(`educations.${index}.schoolNameJa`)}
                        />
                      </Field>
                      <Field label={t("country")} optional>
                        <Input {...register(`educations.${index}.country`)} />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t("faculty")} optional>
                        <Input {...register(`educations.${index}.faculty`)} />
                      </Field>
                      <Field label={t("degree")} optional>
                        <Input {...register(`educations.${index}.degree`)} />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label={t("startDate")} optional>
                        <Input
                          type="month"
                          {...register(`educations.${index}.startDate`)}
                        />
                      </Field>
                      <Field label={t("endDate")} optional>
                        <Input
                          type="month"
                          {...register(`educations.${index}.endDate`)}
                        />
                      </Field>
                      <Field label={t("eduStatus")} optional>
                        <Select {...register(`educations.${index}.status`)}>
                          <option value="">—</option>
                          {EDU_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {t(
                                `edu${s.charAt(0).toUpperCase()}${s.slice(1)}` as const,
                              )}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                educations.append({
                  schoolName: "",
                  schoolNameJa: "",
                  country: "",
                  faculty: "",
                  degree: "",
                  startDate: "",
                  endDate: "",
                  status: "",
                })
              }
            >
              <Plus className="size-4" />
              {t("addEducation")}
            </Button>
          </StepCard>
        )}

        {/* Step pager */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            <ChevronLeft className="size-4" />
            もどる
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              つぎへ
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/documents/${documentId}/preview`}>
                <Eye className="size-4" />
                {t("preview")}
              </Link>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
