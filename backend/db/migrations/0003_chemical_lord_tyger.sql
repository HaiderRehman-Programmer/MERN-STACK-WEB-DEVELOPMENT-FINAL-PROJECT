ALTER TABLE "user_auth" ADD COLUMN "verification_token" text;--> statement-breakpoint
ALTER TABLE "user_auth" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_enrollment_purchased" ON "enrollments" USING btree ("purchased_at");--> statement-breakpoint
CREATE INDEX "idx_progress_completion" ON "lesson_progress" USING btree ("student_id","is_completed");