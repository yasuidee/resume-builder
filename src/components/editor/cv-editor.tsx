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
import { computeCvCompletion, type CvFormValues } from "@/lib/validation/cv";
import { saveCv } from "@/lib/actions/documents";
import {
  aiImproveText,
  aiGenerateSelfPR,
  aiGenerateMotivation,
  aiSummarizeCareer,
} from "@/lib/actions/ai";
import { useDebouncedCallback } from "@/lib/use-debounced-callback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StepCard, Field } from "@/components/editor/fields";
import { AiAssist } from "@/components/editor/ai-assist";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved";
const STEPS = [4, 5, 6] as const;

export function CvEditor({
  documentId,
  initialValues,
}: {
  documentId: string;
  initialValues: CvFormValues;
}) {
  const t = useTranslations("CvEditor");
  const te = useTranslations("Editor");
  const ta = useTranslations("Ai");
  const [step, setStep] = useState(4);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const form = useForm<CvFormValues>({
    defaultValues: initialValues,
    mode: "onChange",
  });
  const { register, control, watch, setValue, getValues } = form;
  const works = useFieldArray({ control, name: "works" });
  const certs = useFieldArray({ control, name: "certifications" });

  const values = watch();
  const completion = computeCvCompletion(values as CvFormValues);

  const persist = useDebouncedCallback((data: CvFormValues) => {
    void saveCv(documentId, data).then(() => setStatus("saved"));
  }, 1500);

  useEffect(() => {
    const sub = form.watch((data) => {
      setStatus("saving");
      persist(data as CvFormValues);
    });
    return () => sub.unsubscribe();
  }, [form, persist]);

  // Force a save so AI generation reads the latest answers from the DB.
  async function flush() {
    await saveCv(documentId, getValues());
    setStatus("saved");
  }

  function applyTo(name: keyof CvFormValues, text: string) {
    setValue(name, text, { shouldDirty: true });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {status === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {te("autosaveSaving")}
            </>
          ) : status === "saved" ? (
            <>
              <Check className="size-4 text-emerald-600" />
              {te("autosaveSaved")}
            </>
          ) : (
            <span>{te("autosaveIdle")}</span>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/documents/${documentId}/preview`}>
            <Eye className="size-4" />
            {te("preview")}
          </Link>
        </Button>
      </div>

      {/* Completion */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{te("completion")}</span>
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
            <span className="block text-[11px] text-slate-400">STEP {s}</span>
            <span className="font-medium">{t(`step${s}` as const)}</span>
          </button>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* STEP 4 — work history */}
        {step === 4 && (
          <StepCard lead={t("step4Lead")}>
            {works.fields.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                {t("workEmpty")}
              </p>
            )}
            <div className="grid gap-4">
              {works.fields.map((f, index) => (
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
                        onClick={() => works.remove(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                        {t("removeWork")}
                      </Button>
                    </div>
                    <Field label={t("companyName")} required>
                      <Input {...register(`works.${index}.companyName`)} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t("companyNameJa")} optional>
                        <Input {...register(`works.${index}.companyNameJa`)} />
                      </Field>
                      <Field label={t("position")} optional>
                        <Input {...register(`works.${index}.position`)} />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label={t("startDate")} optional>
                        <Input
                          type="month"
                          {...register(`works.${index}.startDate`)}
                        />
                      </Field>
                      <Field label={t("endDate")} optional>
                        <Input
                          type="month"
                          {...register(`works.${index}.endDate`)}
                        />
                      </Field>
                      <Field label={t("employmentType")} optional>
                        <Input {...register(`works.${index}.employmentType`)} />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        {...register(`works.${index}.isCurrent`)}
                        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {t("isCurrent")}
                    </label>
                    <Field label={t("description")} optional>
                      <Textarea {...register(`works.${index}.description`)} />
                    </Field>
                    <AiAssist
                      label={ta("assist")}
                      run={() =>
                        aiImproveText(
                          documentId,
                          t("description"),
                          "cv",
                          getValues(`works.${index}.description`) || "",
                        )
                      }
                      onApply={(text) =>
                        setValue(`works.${index}.description`, text, {
                          shouldDirty: true,
                        })
                      }
                    />
                    <Field label={t("achievements")} optional>
                      <Textarea {...register(`works.${index}.achievements`)} />
                    </Field>
                    <Field label={t("tools")} optional>
                      <Input {...register(`works.${index}.tools`)} />
                    </Field>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                works.append({
                  companyName: "",
                  companyNameJa: "",
                  country: "",
                  department: "",
                  position: "",
                  employmentType: "",
                  startDate: "",
                  endDate: "",
                  isCurrent: false,
                  description: "",
                  achievements: "",
                  tools: "",
                })
              }
            >
              <Plus className="size-4" />
              {t("addWork")}
            </Button>
          </StepCard>
        )}

        {/* STEP 5 — skills / certifications / preferences */}
        {step === 5 && (
          <StepCard lead={t("step5Lead")}>
            <Field label={t("skills")} hint={t("skillsHint")} optional>
              <Textarea
                {...register("skillsText")}
                placeholder="Python, React, 英語, プロジェクト管理"
              />
            </Field>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">
                  {t("addCertification").replace("追加", "")}
                </span>
              </div>
              {certs.fields.map((f, index) => (
                <Card key={f.id} className="border-slate-200">
                  <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                    <Field label={t("certName")} optional>
                      <Input {...register(`certifications.${index}.name`)} />
                    </Field>
                    <Field label={t("certIssuer")} optional>
                      <Input {...register(`certifications.${index}.issuer`)} />
                    </Field>
                    <div className="grid gap-1.5">
                      <Field label={t("certDate")} optional>
                        <Input
                          type="month"
                          {...register(`certifications.${index}.acquiredDate`)}
                        />
                      </Field>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => certs.remove(index)}
                        className="justify-self-start text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                        {t("removeCertification")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  certs.append({ name: "", issuer: "", acquiredDate: "" })
                }
              >
                <Plus className="size-4" />
                {t("addCertification")}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("desiredJob")} required>
                <Input {...register("desiredJob")} />
              </Field>
              <Field label={t("desiredLocation")} optional>
                <Input {...register("desiredLocation")} />
              </Field>
              <Field label={t("desiredEmploymentType")} optional>
                <Input {...register("desiredEmploymentType")} />
              </Field>
              <Field label={t("availableFrom")} optional>
                <Input {...register("availableFrom")} />
              </Field>
            </div>
          </StepCard>
        )}

        {/* STEP 6 — self-PR / motivation */}
        {step === 6 && (
          <StepCard lead={t("step6Lead")}>
            <Field label={t("qPraised")} optional>
              <Textarea {...register("prAnswers.praised")} />
            </Field>
            <Field label={t("qHardWork")} optional>
              <Textarea {...register("prAnswers.hardWork")} />
            </Field>
            <Field label={t("qWantToDo")} optional>
              <Textarea {...register("prAnswers.wantToDo")} />
            </Field>
            <Field label={t("qTeamwork")} optional>
              <Textarea {...register("prAnswers.teamwork")} />
            </Field>
            <Field label={t("qNumbers")} optional>
              <Textarea {...register("prAnswers.numbers")} />
            </Field>

            <hr className="border-slate-200" />

            <Field label={t("careerSummary")} optional>
              <Textarea {...register("careerSummary")} className="min-h-24" />
            </Field>
            <AiAssist
              label={t("generateSummary")}
              run={async () => {
                await flush();
                return aiSummarizeCareer(documentId);
              }}
              onApply={(text) => applyTo("careerSummary", text)}
            />

            <Field label={t("selfPr")} optional>
              <Textarea {...register("selfPr")} className="min-h-24" />
            </Field>
            <AiAssist
              label={t("generateSelfPr")}
              withTone
              run={async (tone) => {
                await flush();
                return aiGenerateSelfPR(documentId, tone);
              }}
              onApply={(text) => applyTo("selfPr", text)}
            />

            <Field label={t("targetCompany")} optional>
              <Input id="cv-target-company" />
            </Field>
            <Field label={t("motivation")} optional>
              <Textarea {...register("motivation")} className="min-h-24" />
            </Field>
            <AiAssist
              label={t("generateMotivation")}
              withTone
              run={async (tone) => {
                await flush();
                const company =
                  (
                    document.getElementById(
                      "cv-target-company",
                    ) as HTMLInputElement | null
                  )?.value ?? "";
                return aiGenerateMotivation(
                  documentId,
                  getValues("desiredJob") || "",
                  company,
                  tone,
                );
              }}
              onApply={(text) => applyTo("motivation", text)}
            />
          </StepCard>
        )}

        {/* Step pager */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 4}
            onClick={() => setStep((s) => Math.max(4, s - 1))}
          >
            <ChevronLeft className="size-4" />
            もどる
          </Button>
          {step < 6 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              つぎへ
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/documents/${documentId}/preview`}>
                <Eye className="size-4" />
                {te("preview")}
              </Link>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
