-- AlterTable Exam - Add new columns
ALTER TABLE "Exam" ADD COLUMN "options" JSONB DEFAULT '[]',
ADD COLUMN "correctAnswer" TEXT DEFAULT '' NOT NULL,
ADD COLUMN "description" TEXT,
ADD COLUMN "explanation" TEXT,
ADD COLUMN "difficulty" TEXT NOT NULL DEFAULT 'media',
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "createdBy" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex - Performance improvements
CREATE INDEX "Exam_courseId_idx" ON "Exam"("courseId");
CREATE INDEX "Exam_lessonId_idx" ON "Exam"("lessonId");
CREATE INDEX "Exam_createdBy_idx" ON "Exam"("createdBy");

-- AlterTable ExamResult - Change structure
ALTER TABLE "ExamResult" DROP COLUMN IF EXISTS "score",
ADD COLUMN "selectedAnswer" TEXT,
ADD COLUMN "isCorrect" BOOLEAN DEFAULT false,
ADD COLUMN "scorePoints" INTEGER DEFAULT 0,
ADD COLUMN "timeSpent" INTEGER;

-- AddConstraint - Ensure unique user answer per exam
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_userId_key" UNIQUE("examId", "userId");

-- CreateIndex - Performance improvements  
CREATE INDEX "ExamResult_examId_idx" ON "ExamResult"("examId");
CREATE INDEX "ExamResult_userId_idx" ON "ExamResult"("userId");
