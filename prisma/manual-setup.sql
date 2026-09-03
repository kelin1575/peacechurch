-- 기도의 벽(PrayerRequest) · 평안소식(News) 표 만들기
--
-- 이 파일은 관리자 화면의 "표 만들기" 버튼이나
-- `npx prisma db push` 를 쓸 수 없을 때를 위한 것입니다.
-- Neon 콘솔의 SQL Editor에 통째로 붙여넣고 실행하시면 됩니다.
--
-- 안전합니다:
--   · 모두 IF NOT EXISTS 라 여러 번 실행해도 괜찮습니다
--   · 기존 표(Sermon, Comment, Devotional, DonationInfo)는 건드리지 않습니다
--   · 지우거나 바꾸는 문장이 하나도 없습니다

CREATE TABLE IF NOT EXISTS "PrayerRequest" (
  "id"        TEXT NOT NULL,
  "author"    TEXT NOT NULL DEFAULT '익명',
  "category"  TEXT NOT NULL DEFAULT '기타',
  "content"   TEXT NOT NULL,
  "prayCount" INTEGER NOT NULL DEFAULT 0,
  "status"    TEXT NOT NULL DEFAULT 'published',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrayerRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PrayerRequest_status_createdAt_idx"
  ON "PrayerRequest" ("status", "createdAt");

CREATE TABLE IF NOT EXISTS "News" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "category"    TEXT NOT NULL DEFAULT '교회소식',
  "isPinned"    BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "News_publishedAt_idx" ON "News" ("publishedAt");

-- 나중에 추가된 칸들 (이미 표가 있어도 안전하게 붙습니다)
ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "isOfficial" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;
