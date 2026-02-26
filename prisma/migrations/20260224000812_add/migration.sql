/*
  Warnings:

  - You are about to drop the column `correct_option` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `option_a` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `option_b` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `option_c` on the `Exam` table. All the data in the column will be lost.
  - Made the column `options` on table `Exam` required. This step will fail if there are existing NULL values in that column.
  - Made the column `selectedAnswer` on table `ExamResult` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isCorrect` on table `ExamResult` required. This step will fail if there are existing NULL values in that column.
  - Made the column `scorePoints` on table `ExamResult` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_examId_fkey";

-- DropForeignKey
ALTER TABLE "ExamResult" DROP CONSTRAINT "ExamResult_userId_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "correct_option",
DROP COLUMN "option_a",
DROP COLUMN "option_b",
DROP COLUMN "option_c",
ALTER COLUMN "options" SET NOT NULL,
ALTER COLUMN "options" DROP DEFAULT,
ALTER COLUMN "correctAnswer" DROP DEFAULT,
ALTER COLUMN "createdBy" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ExamResult" ALTER COLUMN "selectedAnswer" SET NOT NULL,
ALTER COLUMN "isCorrect" SET NOT NULL,
ALTER COLUMN "scorePoints" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "resources" JSONB DEFAULT '[]';

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
