# 수원평안교회 웹사이트 SEO / GEO 구현 가이드

> 담당: Claude Code (AI 개발 어시스턴트)  
> 작성일: 2026-04-05  
> 대상: 향후 유지보수 및 인수인계 담당 웹 개발사

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 교회명 | 대한예수교장로회 수원평안교회 |
| 담임목사 | 정재광 목사 |
| 주소 | 경기도 수원시 권선구 호매실로 218번길 110 (우편번호 16556) |
| 전화 | 031-292-8119 |
| 이메일 | info@peacechurch.kr |
| 웹사이트 | https://peacechurch.kr |
| 유튜브 | https://youtube.com/channel/UC9c1llukhxYQ5nma355O-kg |
| 기술 스택 | Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL (Neon) |
| 배포 | Netlify / Vercel |

---

## 2. SEO (검색엔진 최적화)

### 2-1. 전역 메타데이터 (`app/layout.tsx`)

- **title template**: `%s | 수원평안교회 정재광 목사` — 모든 페이지 제목에 자동으로 교회명과 목사명이 붙습니다.
- **description**: 교단명(대한예수교장로회) + 교회명 + 담임목사 + 핵심 서비스 + 지역(경기도 수원시 권선구 호매실)을 명시합니다.
- **keywords**: 교단/교회/목사/지역/서비스 조합 19개 키워드 포함.
- **openGraph**: `og:type=website`, `og:locale=ko_KR`, og-image.png (1200×630).
- **twitter card**: `summary_large_image`.
- **robots**: `index: true, follow: true`, `max-video-preview: -1` (유튜브 설교 미리보기 허용).
- **alternates.canonical**: 정규 URL 명시 (중복 색인 방지).
- **alternates.languages**: `ko-KR` hreflang 설정.

### 2-2. 페이지별 메타데이터

각 페이지(`app/*/page.tsx`)에 `export const metadata: Metadata = { ... }`를 선언합니다.

| 페이지 | 주요 키워드 | canonical |
|--------|-------------|-----------|
| `/` | 수원평안교회, 정재광목사, 설교 | `BASE_URL` |
| `/sermons` | 설교 말씀, 주일예배, 카테고리 | `BASE_URL/sermons` |
| `/sermons/[id]` | 설교 제목, 성경 본문, 날짜 | `BASE_URL/sermons/{id}` |
| `/devotional` | 오늘의 묵상, QT, 성경 | `BASE_URL/devotional` |
| `/bible` | 성경 찾기, 개역개정 | `BASE_URL/bible` |
| `/hymnal` | 찬송가 | `BASE_URL/hymnal` |
| `/about` | 교회소개, 예배시간, 오시는길 | `BASE_URL/about` |
| `/faq` | 자주묻는질문, 헌금계좌 | `BASE_URL/faq` |
| `/donate` | 헌금 안내, 농협 계좌 | `BASE_URL/donate` |

### 2-3. Sitemap (`app/sitemap.ts`)

- 정적 페이지 8개: 홈, 설교, 묵상, 성경, 찬송가, 헌금, 소개, FAQ
- **동적 설교 페이지**: DB에서 최신 200개 설교를 조회하여 `/sermons/{id}` 항목 생성
- **동적 묵상 페이지**: DB에서 최근 90일치 묵상을 조회하여 `/devotional?date=YYYY-MM-DD` 항목 생성
- 빌드 시 DB 오류가 발생해도 정적 페이지는 정상 포함됩니다 (`try/catch`).

### 2-4. robots.txt (`app/robots.ts`)

```
User-agent: *
Allow: /

User-agent: GPTBot          ← OpenAI
Allow: /

User-agent: ClaudeBot        ← Anthropic
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://peacechurch.kr/sitemap.xml
```

> **GEO 핵심**: GPTBot, ClaudeBot, PerplexityBot 등 AI 크롤러를 명시적으로 허용합니다.  
> 이렇게 하면 ChatGPT, Claude, Perplexity 등 AI 검색에 교회 정보가 포함됩니다.

---

## 3. GEO (생성형 엔진 최적화)

GEO는 ChatGPT, Claude, Perplexity, Gemini 등 AI 기반 검색에서 교회 정보가 정확하게 노출되도록 하는 최적화입니다.

### 3-1. 핵심 원칙

1. **NAP 일관성**: 이름(수원평안교회), 주소(경기도 수원시 권선구 호매실로 218번길 110), 전화(031-292-8119)가 모든 페이지에서 동일해야 합니다.
2. **엔티티 명확화**: 교회 = 법인/단체, 목사 = 사람, 예배 = 이벤트로 Schema.org 타입을 명시합니다.
3. **FAQ 구조화**: AI가 질의응답 형태로 정보를 추출하기 쉽도록 FAQPage 스키마를 제공합니다.
4. **AI 봇 허용**: robots.txt에서 주요 AI 크롤러를 명시적으로 허용합니다.

### 3-2. JSON-LD 구조화 데이터 (`components/JsonLd.tsx`)

#### OrganizationSchema (모든 페이지 공통)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Church", "Organization"],
      "@id": "https://peacechurch.kr/#church",
      "name": "수원평안교회",
      "alternateName": ["대한예수교장로회 수원평안교회", "Peace Church Suwon", "평안교회"],
      "address": { ... },
      "geo": { "latitude": "37.2386", "longitude": "126.9756" },
      "telephone": "031-292-8119",
      "openingHoursSpecification": [ 일/수/금 예배시간 ],
      "event": [ 주일 1·2·3부 예배 Schedule ],
      "member": { 담임목사 Person 엔티티 }
    },
    {
      "@type": "WebSite",
      "potentialAction": { "SearchAction": "/sermons?q={search_term_string}" }
    }
  ]
}
```

#### BreadcrumbSchema
- 각 페이지의 계층 구조를 `BreadcrumbList`로 표현합니다.
- 사용 예: `홈 > 설교 말씀 > {설교 제목}`

#### SermonVideoSchema (`/sermons/[id]`)
```json
{
  "@type": "VideoObject",
  "name": "설교 제목",
  "embedUrl": "https://www.youtube.com/embed/{youtubeId}",
  "genre": "Religious Sermon",
  "author": { "name": "정재광", "jobTitle": "담임목사" },
  "keywords": "정재광목사 설교, 수원평안교회 설교, ..."
}
```

#### FAQSchema (`/faq`)
- `FAQPage` + `Question` + `Answer` 구조로 16개 Q&A를 마크업합니다.
- AI 검색 엔진이 "수원평안교회 예배 시간", "헌금 계좌" 등 질의에 직접 답변 생성에 활용합니다.

#### DevotionalArticleSchema (`/devotional`)
- `Article` 타입으로 묵상 본문을 마크업합니다.
- `author`(정재광 목사) + `publisher`(수원평안교회) + `about`(성경 본문) 포함.

---

## 4. 주요 콘텐츠 페이지 정보

### 4-1. 교회 정보 (`app/about/page.tsx`)
- 담임목사 인사말 (전문)
- 예배 시간표:

| 예배 | 시간 | 장소 |
|------|------|------|
| 주일 1부 | 오전 9:00 | 3층 대예배실 |
| 주일 2부 (주예배) | 오전 11:00 | 3층 대예배실 |
| 주일 3부 | 오후 2:00 | 3층 대예배실 |
| 수요예배 | 저녁 8:00 | 3층 대예배실 |
| 금요기도회 | 저녁 8:00 | 3층 대예배실 |
| 유아·유치부 | 오전 11:00 | 1층 유치부실 |
| 아동부 | 오전 11:00 / 오후 2:00 | 2층 중예배실 |
| 청소년부 | 오전 9:30 | 2층 중예배실 |
| 청년부 | 오후 3:30 | 2층 청년부실 |
| 어와나(Sparks·T&T) | 주일 오후 3:30 | 4층 체육관 |
| 어와나(Trek·Journey) | 토요일 오전 10:00 | 4층 체육관 |
| 영어주일학교(RTA) | 오후 2:00 | 2층 유년부실 |

- 담임목사 학력: Azusa Pacific University(M.div), Calvin Theological Seminary(Th.M), 총신대학교 신학대학원(M.div), Westminster Theological Seminary(D.min)

### 4-2. 헌금 안내 (`app/donate/page.tsx`)
- 일반 헌금 계좌: **농협은행 351-1062-3026-93** (예금주: 수원평안교회)
- 계좌번호 복사 버튼 (클라이언트 컴포넌트 `DonateClient`)
- 헌금 종류: 십일조, 주일헌금, 선교헌금, 감사헌금, 건축헌금, 구제헌금
- 기부금 영수증 안내

### 4-3. 자주 묻는 질문 (`app/faq/page.tsx`)
5개 그룹 16개 Q&A:
1. 예배 안내 (4개)
2. 오시는 길 & 연락처 (3개)
3. 새가족 & 등록 (3개)
4. 헌금 & 후원 (2개)
5. 설교 & 콘텐츠 (3개 + 세움 프로그램)

---

## 5. 자동화 기능

### 5-1. 매일 오전 7시 자동 배치 (`netlify/functions/daily-sync.ts`)

```
cron: "0 22 * * *"   (UTC 22:00 = KST 07:00)
```

실행 순서:
1. YouTube API로 교회 채널의 최신 영상 동기화
2. 오늘 날짜 묵상이 이미 있는지 확인
3. 없으면 Claude AI(claude-opus-4-6)로 묵상 생성
4. DB(PostgreSQL/Neon)에 저장

### 5-2. 수동 트리거 (`POST /api/daily-sync`)

```bash
curl -X POST "https://your-domain/api/daily-sync?secret=YOUR_DEBUG_SECRET"
```

환경변수 `DEBUG_SECRET` 설정 필요 (Netlify/Vercel 환경변수 패널에서 설정).

---

## 6. 환경변수 목록

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://...@neon.tech/...` |
| `NEXT_PUBLIC_SITE_URL` | 사이트 기본 URL | `https://peacechurch.kr` |
| `YOUTUBE_API_KEY` | YouTube Data API v3 키 | `AIza...` |
| `YOUTUBE_CHANNEL_ID` | 교회 유튜브 채널 ID | `UC9c1llukhxYQ5nma355O-kg` |
| `ANTHROPIC_API_KEY` | Claude AI API 키 | `sk-ant-...` |
| `DEBUG_SECRET` | 수동 배치 트리거 시크릿 | 임의 문자열 |

---

## 7. 파일 구조 요약

```
peacechurch/
├── app/
│   ├── layout.tsx          ← 전역 SEO 메타데이터, OrganizationSchema
│   ├── sitemap.ts          ← 동적 sitemap (설교 + 묵상 날짜 포함)
│   ├── robots.ts           ← AI 봇 허용 robots.txt
│   ├── about/page.tsx      ← 교회소개 (인사말, 예배표, 오시는길)
│   ├── donate/page.tsx     ← 헌금 안내 (농협 계좌)
│   ├── faq/page.tsx        ← FAQ (FAQSchema + 16 Q&A)
│   ├── sermons/
│   │   ├── page.tsx        ← 설교 목록
│   │   └── [id]/page.tsx   ← 설교 상세 (SermonVideoSchema)
│   └── devotional/
│       └── page.tsx        ← 오늘의 묵상 (날짜 네비게이션)
├── components/
│   ├── JsonLd.tsx          ← 모든 JSON-LD 스키마 컴포넌트
│   ├── Header.tsx          ← GNB (외부 로고 이미지)
│   ├── Footer.tsx          ← 푸터 (외부 로고 이미지, NAP 정보)
│   └── DonateClient.tsx    ← 계좌번호 복사 버튼 (client component)
├── netlify/
│   └── functions/
│       └── daily-sync.ts   ← 매일 7시 자동 배치
└── netlify.toml            ← Netlify 설정 (functions, esbuild)
```

---

## 8. 외부 로고 이미지 처리

GNB와 Footer에서 교회 공식 로고를 외부 URL로 로드합니다:

```tsx
// ✅ <img> 태그 + onError fallback 사용 (Next.js Image 컴포넌트 불필요)
<img
  src="https://peacechurch.kr/UserData/pyunganch/Layouts/pyunganch2025_Layout/Images/1_logo_2.png"
  alt="수원평안교회 PEACE CHURCH"
  className="h-9 w-auto"
  onError={(e) => { (e.target as HTMLImageElement).src = "/logo.svg"; }}
/>
```

> **주의**: Next.js `<Image>` 컴포넌트를 사용할 경우 `next.config.ts`의 `remotePatterns`에 `peacechurch.kr` 도메인을 추가해야 합니다. 현재는 `<img>` 태그를 사용하여 도메인 설정 없이도 동작합니다. 로드 실패 시 로컬 `/logo.svg`로 자동 대체됩니다.

---

## 9. 체크리스트 (향후 작업)

- [ ] Google Search Console에서 사이트 등록 및 sitemap 제출
- [ ] 네이버 서치어드바이저 등록 (`naver-site-verification` 메타 태그 추가)
- [ ] 네이버 플레이스 / 카카오맵 교회 정보 업데이트 (NAP 일치 확인)
- [ ] Google Business Profile 등록 (지도 검색 최적화)
- [ ] `og-image.png` 제작 및 교체 (1200×630px, 교회 외관 또는 로고)
- [ ] Google Search Console에서 `layout.tsx`의 `verification.google` 코드 설정
- [ ] 네이버 `other["naver-site-verification"]` 코드 설정
- [ ] YouTube 채널 설명에 웹사이트 URL 추가
- [ ] Core Web Vitals 점수 모니터링 (Lighthouse)

---

## 10. 참고 자료

- [Schema.org Church](https://schema.org/Church)
- [Schema.org VideoObject](https://schema.org/VideoObject)
- [Schema.org FAQPage](https://schema.org/FAQPage)
- [Google 구조화 데이터 테스트](https://search.google.com/test/rich-results)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Netlify Scheduled Functions](https://docs.netlify.com/functions/scheduled-functions/)
