import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

// Shared timestamp helpers
const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow();

// 1. users -----------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  // 'user' | 'admin'
  role: text("role").notNull().default("user"),
  // Preferred UI locale
  locale: text("locale").notNull().default("ja"),
  createdAt,
  updatedAt,
});

// 2. profiles (Step 1 + Step 2) -- one per user ----------------------------
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  // Step 1: basic info
  fullName: text("full_name"),
  fullNameKana: text("full_name_kana"),
  romajiName: text("romaji_name"),
  birthDate: date("birth_date"),
  email: text("email"),
  phone: text("phone"),
  currentAddress: text("current_address"),
  contactAddress: text("contact_address"),
  // 'unspecified' | 'male' | 'female' | 'other' -- defaults to not disclosing
  gender: text("gender").notNull().default("unspecified"),
  photoUrl: text("photo_url"),
  // Step 2: working-in-Japan info (all optional)
  residenceStatus: text("residence_status"),
  residenceExpiry: date("residence_expiry"),
  workRestriction: text("work_restriction"),
  japaneseLevel: text("japanese_level"),
  jlpt: text("jlpt"),
  englishLevel: text("english_level"),
  nativeLanguage: text("native_language"),
  // Whether to show residence status / expiry on the resume (default hidden)
  showResidenceOnResume: boolean("show_residence_on_resume")
    .notNull()
    .default(false),
  createdAt,
  updatedAt,
});

// 3. educations (Step 3) ---------------------------------------------------
export const educations = pgTable("educations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  schoolName: text("school_name"),
  schoolNameJa: text("school_name_ja"),
  country: text("country"),
  faculty: text("faculty"),
  degree: text("degree"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  // 'graduated' | 'expected' | 'enrolled' | 'withdrawn'
  status: text("status"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

// 4. work_experiences (Step 4) ---------------------------------------------
export const workExperiences = pgTable("work_experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  companyNameJa: text("company_name_ja"),
  country: text("country"),
  department: text("department"),
  position: text("position"),
  employmentType: text("employment_type"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isCurrent: boolean("is_current").notNull().default(false),
  description: text("description"),
  achievements: text("achievements"),
  tools: text("tools"),
  managementCount: integer("management_count"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
  updatedAt,
});

// 5. skills (Step 5) -------------------------------------------------------
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // 'pc' | 'professional' | 'industry' | 'tag'
  category: text("category").notNull().default("tag"),
  name: text("name").notNull(),
  level: text("level"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
});

// 6. certifications (Step 5) -----------------------------------------------
export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  issuer: text("issuer"),
  acquiredDate: date("acquired_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
});

// 7. language_skills (Step 2) ----------------------------------------------
export const languageSkills = pgTable("language_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  level: text("level"),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt,
});

// 8. job_preferences (Step 5 + Step 6) -- one per user ---------------------
export const jobPreferences = pgTable("job_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  desiredJobType: text("desired_job_type"),
  desiredLocation: text("desired_location"),
  desiredEmploymentType: text("desired_employment_type"),
  availableFrom: text("available_from"),
  // Step 6 self-PR / motivation source answers (free-form Q&A)
  prAnswers: jsonb("pr_answers").$type<Record<string, string>>().default({}),
  selfPr: text("self_pr"),
  motivation: text("motivation"),
  careerSummary: text("career_summary"),
  personalRequest: text("personal_request"),
  createdAt,
  updatedAt,
});

// 9. documents -------------------------------------------------------------
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // 'resume' | 'cv'
  type: text("type").notNull(),
  title: text("title"),
  // 'draft' | 'completed'
  status: text("status").notNull().default("draft"),
  completionScore: integer("completion_score").notNull().default(0),
  // Document-specific overrides / cached content
  data: jsonb("data").$type<Record<string, unknown>>().default({}),
  createdAt,
  updatedAt,
});

// 10. document_versions ----------------------------------------------------
export const documentVersions = pgTable("document_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  snapshot: jsonb("snapshot").notNull(),
  changeSummary: text("change_summary"),
  createdAt,
});

// 11. pdf_exports ----------------------------------------------------------
export const pdfExports = pgTable("pdf_exports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  fileName: text("file_name").notNull(),
  // 'resume' | 'cv' | 'set'
  kind: text("kind").notNull().default("resume"),
  createdAt,
});

// 12. ai_suggestions -------------------------------------------------------
export const aiSuggestions = pgTable("ai_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),
  // 'improve' | 'translate' | 'selfPr' | 'motivation' | 'careerSummary' | 'consistency'
  kind: text("kind").notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  createdAt,
});

// 13. consents -- append-only history --------------------------------------
export const consents = pgTable("consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // 'career_support' | 'third_party_company_submission'
  consentType: text("consent_type").notNull(),
  isGranted: boolean("is_granted").notNull(),
  consentText: text("consent_text").notNull(),
  policyVersion: text("policy_version").notNull(),
  locale: text("locale").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt,
});

// 14. audit_logs -----------------------------------------------------------
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetId: text("target_id"),
  metadata: jsonb("metadata"),
  createdAt,
});

// Convenience type exports
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Education = typeof educations.$inferSelect;
export type WorkExperience = typeof workExperiences.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Certification = typeof certifications.$inferSelect;
export type LanguageSkill = typeof languageSkills.$inferSelect;
export type JobPreference = typeof jobPreferences.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type PdfExport = typeof pdfExports.$inferSelect;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type Consent = typeof consents.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
