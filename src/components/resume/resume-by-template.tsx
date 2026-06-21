import type { ResumeFormValues } from "@/lib/validation/resume";
import type { ResumeTemplate } from "@/lib/actions/documents";
import { ResumeDocument } from "@/components/resume/resume-document";
import { ResumeDocumentModern } from "@/components/resume/resume-document-modern";

export function ResumeByTemplate({
  values,
  template,
}: {
  values: ResumeFormValues;
  template: ResumeTemplate;
}) {
  return template === "modern" ? (
    <ResumeDocumentModern values={values} />
  ) : (
    <ResumeDocument values={values} />
  );
}
