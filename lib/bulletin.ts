/**
 * 주보 읽어오기.
 *
 * 교회 홈페이지의 주보 게시판에서 가장 최근 주보를 찾아
 * 교회소식 텍스트와 주보 이미지를 뽑아냅니다.
 *
 * 이 파일을 쓴 시점에는 대상 페이지의 실제 HTML을 확인할 수 없었습니다.
 * 그래서 한 가지 규칙에 기대지 않고 여러 방법을 순서대로 시도하며,
 * 무엇을 어떻게 찾았는지(또는 왜 못 찾았는지)를 진단 정보로 함께 돌려줍니다.
 * 관리자 화면의 "주보 미리보기"가 그 진단을 그대로 보여주므로,
 * 실제 페이지 구조를 보고 규칙을 좁혀갈 수 있습니다.
 *
 * 확실하지 않으면 게시하지 않습니다. 교회 공개 페이지에 잘못 뽑힌 글이
 * 자동으로 올라가는 것보다, 아무것도 올라가지 않는 편이 낫습니다.
 */

export const DEFAULT_BOARD_URL =
  process.env.BULLETIN_BOARD_URL || "http://peacechurch.kr/Board/Index/46";

/** 주보 이미지가 올라가는 곳 */
const IMAGE_HOST = "data.dimode.co.kr";

/** 게시판 번호 — 이미지 경로 files/{board}/{post}/ 에 쓰입니다 */
function boardIdFrom(url: string): string {
  const m = url.match(/\/Board\/\w+\/(\d+)/);
  return m ? m[1] : "46";
}

export interface BulletinStep {
  label: string;
  detail: string;
  ok: boolean;
}

export interface BulletinResult {
  ok: boolean;
  /** 게시해도 될 만큼 확실하게 뽑혔는지 */
  confident: boolean;
  title?: string;
  /** 교회소식 본문 */
  content?: string;
  imageUrl?: string;
  sourceUrl?: string;
  postId?: string;
  /** 찾은 이미지 후보 전부 (미리보기에서 고를 수 있게) */
  imageCandidates: string[];
  /** 무엇을 시도했고 어떻게 됐는지 */
  steps: BulletinStep[];
  /** 규칙을 다듬기 위한 원본 조각 */
  htmlSample?: string;
  message: string;
}

const UA =
  "Mozilla/5.0 (compatible; PeaceChurchBot/1.0; +https://peacechurch.kr)";

async function fetchText(
  url: string
): Promise<{ ok: boolean; status: number; body: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      body: error instanceof Error ? error.message : String(error),
    };
  }
}

/** 태그를 걷어내고 사람이 읽는 텍스트만 남깁니다. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "· ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

/**
 * 페이지 안에서 주보 첨부 이미지 주소를 모읍니다.
 * files/{board}/{post}/ 규칙을 쓰므로 글 번호도 함께 얻을 수 있습니다.
 */
function findAttachmentImages(
  html: string,
  boardId: string
): { url: string; postId: string }[] {
  const found: { url: string; postId: string }[] = [];
  const seen = new Set<string>();
  const re = new RegExp(
    `https?://${IMAGE_HOST.replace(/\./g, "\\.")}/UserData/[^"'\\s)]*?/files/${boardId}/(\\d+)/[^"'\\s)]+?\\.(?:jpe?g|png|gif|webp)`,
    "gi"
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = m[0].replace(/&amp;/g, "&");
    if (seen.has(url)) continue;
    seen.add(url);
    found.push({ url, postId: m[1] });
  }
  return found;
}

/** 목록 페이지에서 글 번호 후보를 찾습니다. */
function findPostIds(html: string, boardId: string): string[] {
  const ids = new Set<string>();

  // 1) 첨부 이미지 경로에서 (가장 확실함)
  for (const a of findAttachmentImages(html, boardId)) ids.add(a.postId);

  // 2) 링크 주소에서 — /Board/View/46/22381, ?idx=22381, ?bidx=22381 등
  const patterns = [
    new RegExp(`/Board/\\w+/${boardId}/(\\d{3,})`, "gi"),
    /[?&](?:idx|bidx|no|seq|id)=(\d{3,})/gi,
    /goView\D{0,12}(\d{3,})/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) ids.add(m[1]);
  }

  // 큰 번호가 최신입니다.
  return [...ids].sort((a, b) => Number(b) - Number(a));
}

/**
 * 교회소식/광고에 해당하는 부분을 골라냅니다.
 * 주보 본문에 그런 표제가 없으면 본문 전체를 정리해 돌려줍니다.
 */
function extractNewsSection(text: string): { content: string; matched: boolean } {
  const startRe =
    /(교회\s*소식|교회소식|광\s*고|알\s*림|주간\s*소식|이번\s*주\s*소식)/;
  const idx = text.search(startRe);
  if (idx === -1) return { content: text, matched: false };

  let section = text.slice(idx);

  // 다음 표제가 나오면 거기서 끊습니다.
  const endRe =
    /\n\s*(예배\s*순서|헌금\s*안내|섬기는\s*이|다음\s*주\s*예배|주일\s*예배\s*순서|봉사자)/;
  const endIdx = section.search(endRe);
  if (endIdx > 0) section = section.slice(0, endIdx);

  return { content: section.trim(), matched: true };
}

/** 메뉴·머리말·꼬리말을 걷어내고 글 본문으로 보이는 부분만 남깁니다. */
function narrowToContent(html: string): { html: string; matched: boolean } {
  // 머리말·꼬리말·메뉴는 통째로 버립니다.
  let body = html
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<select[\s\S]*?<\/select>/gi, " ")
    .replace(/<form[\s\S]*?<\/form>/gi, " ");

  // 글 본문이 담기는 흔한 상자들
  const containers = [
    /<div[^>]*class="[^"]*(?:view_content|board_view|bbs_content|view_cont|contents_view)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<td[^>]*class="[^"]*(?:view_content|content)[^"]*"[^>]*>([\s\S]*?)<\/td>/i,
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*id="[^"]*(?:content|container)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];
  for (const re of containers) {
    const m = body.match(re);
    if (m && m[1].length > 120) return { html: m[1], matched: true };
  }
  return { html: body, matched: false };
}

/** 메뉴 항목처럼 본문이 아닌 줄 */
const JUNK_LINE =
  /^(홈|home|로그인|로그아웃|회원가입|검색|목록|이전|다음|글쓰기|수정|삭제|답글|인쇄|공유|top|맨위로|더보기|전체보기|\d+|[<>«»·\-—|]+)$/i;

/** 사람이 읽기 좋은 짧은 텍스트로 다듬습니다. */
function tidy(text: string): string {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line) continue;
    if (JUNK_LINE.test(line)) continue;
    // 한 글자짜리 조각은 대개 메뉴가 부서진 것입니다.
    if (line.length < 2) continue;
    // 같은 줄이 여러 번 나오면 한 번만 (메뉴가 반복되는 경우)
    const key = line.replace(/[\s·\-*•]/g, "");
    if (seen.has(key)) continue;
    seen.add(key);
    lines.push(line.replace(/^[·\-*•]\s*/, "· "));
  }

  return lines.join("\n").slice(0, 1500).trim();
}

/** 상세 페이지 주소로 시도해 볼 후보들 */
function detailUrlCandidates(boardUrl: string, boardId: string, postId: string) {
  const origin = new URL(boardUrl).origin;
  return [
    `${origin}/Board/View/${boardId}/${postId}`,
    `${origin}/Board/Read/${boardId}/${postId}`,
    `${origin}/Board/Index/${boardId}/${postId}`,
    `${boardUrl}?idx=${postId}`,
  ];
}


/**
 * 이 CMS 는 한 장을 세 벌로 만들어 둡니다.
 *   files/46/22381/원본.jpg
 *   files/46/22381/resized_원본.jpg        ← 화면용 (보통 이게 가장 큰 실제 파일)
 *   files/46/22381/thumb/thumb_resized_원본.jpg  ← 목록용 작은 그림
 * 목록 페이지에는 썸네일만 실리는 경우가 많아, 그대로 쓰면 흐릿하게 나옵니다.
 */
function sizeRank(url: string): number {
  if (/\/thumb\/|thumb_/.test(url)) return 2; // 가장 작음
  if (/\/resized_/.test(url)) return 1;
  return 0; // 원본
}

/** 썸네일 주소에서 한 단계 큰 주소를 만들어 봅니다. */
function upscaleCandidates(url: string): string[] {
  const out = [url];
  // .../thumb/thumb_resized_X.jpg → .../resized_X.jpg
  const noThumb = url.replace(/\/thumb\/thumb_/, "/");
  if (noThumb !== url) out.push(noThumb);
  // .../resized_X.jpg → .../X.jpg
  const noResized = noThumb.replace(/\/resized_/, "/");
  if (noResized !== noThumb) out.push(noResized);
  return out;
}

/** 큰 그림이 앞에 오도록 정리합니다(중복 제거 포함). */
function rankBySize(urls: string[]): string[] {
  const all = new Set<string>();
  for (const u of urls) for (const c of upscaleCandidates(u)) all.add(c);
  return [...all].sort((a, b) => sizeRank(a) - sizeRank(b));
}

/** 그 주소에 파일이 실제로 있는지 봅니다. */
async function imageExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 큰 것부터 차례로 열어보고, 실제로 있는 첫 번째를 씁니다.
 *
 * 썸네일 주소에서 이름을 깎아 더 큰 주소를 만들어내지만, 그 파일이 늘
 * 있는 것은 아닙니다(이 CMS 는 resized_ 까지만 두는 경우가 많습니다).
 * 확인하지 않고 고르면 깨진 그림이 올라갑니다.
 */
async function pickExistingImage(
  ranked: string[]
): Promise<{ url?: string; checked: string[] }> {
  const checked: string[] = [];
  for (const url of ranked.slice(0, 4)) {
    const ok = await imageExists(url);
    checked.push(`${ok ? "있음" : "없음"} ${url.split("/").pop()}`);
    if (ok) return { url, checked };
  }
  // 하나도 확인되지 않으면(연결 문제 등) 가장 큰 것을 그대로 씁니다.
  return { url: ranked[0], checked };
}


/**
 * 같은 게시판을 가리키는 주소 변형들.
 *
 * 교회 홈페이지가 http 로만 열리는지, www 가 붙는지 확실하지 않습니다.
 * 하나가 막히면 전부 실패하므로, 응답하는 주소를 찾을 때까지 순서대로 시도합니다.
 */
function boardUrlVariants(url: string): string[] {
  const out = [url];
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    for (const scheme of ["https:", "http:"]) {
      for (const h of [host, `www.${host}`]) {
        const v = new URL(url);
        v.protocol = scheme;
        v.hostname = h;
        const str = v.toString();
        if (!out.includes(str)) out.push(str);
      }
    }
  } catch {
    // 주소 형태가 아니면 원래 것만 씁니다.
  }
  return out;
}

export async function fetchLatestBulletin(
  boardUrlInput: string = DEFAULT_BOARD_URL
): Promise<BulletinResult> {
  let boardUrl = boardUrlInput;
  const steps: BulletinStep[] = [];
  const boardId = boardIdFrom(boardUrl);
  const push = (label: string, detail: string, ok: boolean) =>
    steps.push({ label, detail, ok });

  // ── 1. 목록 페이지 ──
  // 주소 형태(http/https, www 유무)가 확실하지 않아 응답하는 것을 찾습니다.
  const variants = boardUrlVariants(boardUrl);
  const tried: string[] = [];
  let list = { ok: false, status: 0, body: "" };
  let usedUrl = boardUrl;

  for (const candidate of variants) {
    const res = await fetchText(candidate);
    tried.push(`${res.status || "실패"} ${candidate}`);

    // 제대로 된 목록 페이지로 보이면 그것으로 확정합니다.
    if (res.ok && res.body.length > 500) {
      list = res;
      usedUrl = candidate;
      break;
    }
    // 아직 쓸 만한 것이 없으면, 응답이라도 한 주소를 기억해 둡니다.
    // 주소까지 함께 남겨야 상세 페이지를 같은 곳에서 찾습니다.
    if (!list.ok) {
      list = res;
      if (res.ok) usedUrl = candidate;
    }
  }
  boardUrl = usedUrl;

  push(
    "주보 목록 페이지 읽기",
    list.ok
      ? `${usedUrl} → ${list.status} (${list.body.length.toLocaleString()}자)` +
        (tried.length > 1 ? ` · 시도: ${tried.join(" / ")}` : "")
      : `모두 실패 · 시도: ${tried.join(" / ")} · ${list.body.slice(0, 160)}`,
    list.ok
  );

  if (!list.ok) {
    return {
      ok: false,
      confident: false,
      imageCandidates: [],
      steps,
      message:
        "주보 목록 페이지를 읽지 못했습니다. 주소가 바뀌었거나 사이트가 응답하지 않습니다.",
    };
  }

  // ── 2. 최신 글 번호 ──
  const postIds = findPostIds(list.body, boardId);
  push(
    "최신 주보 글 번호 찾기",
    postIds.length
      ? `후보 ${postIds.length}개 중 가장 큰 번호 ${postIds[0]} 사용 (상위: ${postIds
          .slice(0, 5)
          .join(", ")})`
      : "글 번호를 찾지 못했습니다. 목록 페이지의 링크 형태가 예상과 다릅니다.",
    postIds.length > 0
  );

  // ── 3. 상세 페이지 ──
  let detailHtml = "";
  let sourceUrl = boardUrl;
  let postId = postIds[0];

  if (postId) {
    for (const candidate of detailUrlCandidates(boardUrl, boardId, postId)) {
      const res = await fetchText(candidate);
      // 글 번호에 해당하는 첨부가 실제로 들어 있어야 맞는 페이지입니다.
      const hasAttachment = res.ok && res.body.includes(`/files/${boardId}/${postId}/`);
      if (res.ok && (hasAttachment || res.body.length > 3000)) {
        detailHtml = res.body;
        sourceUrl = candidate;
        push(
          "주보 상세 페이지 읽기",
          `${candidate} → ${res.status}${hasAttachment ? " · 첨부 확인됨" : " · 첨부는 못 찾음"}`,
          true
        );
        break;
      }
    }
  }

  if (!detailHtml) {
    // 상세를 못 열면 목록 페이지에서라도 뽑아 봅니다.
    detailHtml = list.body;
    push(
      "주보 상세 페이지 읽기",
      "상세 페이지를 열지 못해 목록 페이지 내용으로 대신합니다.",
      false
    );
  }

  // ── 4. 이미지 ──
  const attachments = findAttachmentImages(detailHtml, boardId);
  const scoped = postId
    ? attachments.filter((a) => a.postId === postId)
    : attachments;
  const pool = scoped.length ? scoped : attachments;
  if (!postId && pool.length) postId = pool[0].postId;

  // 가장 큰 그림을 고릅니다.
  const ranked = rankBySize(pool.map((a) => a.url));
  const picked = await pickExistingImage(ranked);
  const imageUrl = picked.url;
  push(
    "주보 이미지 찾기",
    ranked.length
      ? `${pool.length}개 발견 → 큰 순서로 ${ranked.length}개 확인 (${picked.checked.join(", ")}) · 사용: ${imageUrl}`
      : "이미지를 찾지 못했습니다.",
    ranked.length > 0
  );

  // ── 5. 본문 ──
  const narrowed = narrowToContent(detailHtml);
  const text = htmlToText(narrowed.html);
  const { content, matched } = extractNewsSection(text);
  const tidied = tidy(content);
  push(
    "본문 영역 좁히기",
    narrowed.matched
      ? "글 본문 상자를 찾아 메뉴·머리말을 걷어냈습니다."
      : "본문 상자를 못 찾아 페이지 전체에서 정리했습니다.",
    narrowed.matched
  );
  push(
    "교회소식 부분 골라내기",
    matched
      ? `"교회소식" 표제를 찾았습니다 · ${tidied.length}자`
      : `표제를 못 찾아 본문 전체에서 정리했습니다 · ${tidied.length}자`,
    matched
  );

  // ── 6. 게시해도 될 만큼 확실한가 ──
  const confident =
    Boolean(imageUrl) && matched && tidied.length >= 40 && tidied.length <= 1500;

  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const title = `${kstNow.getUTCFullYear()}년 ${kstNow.getUTCMonth() + 1}월 ${
    kstNow.getUTCDate()
  }일 주보 · 교회소식`;

  return {
    ok: true,
    confident,
    title,
    content: tidied || undefined,
    imageUrl,
    sourceUrl,
    postId,
    imageCandidates: ranked,
    steps,
    htmlSample: detailHtml.slice(0, 3000),
    message: confident
      ? "게시할 수 있을 만큼 확실하게 읽었습니다."
      : "확실하지 않아 자동 게시는 하지 않습니다. 아래 내용을 확인하고 직접 등록해 주세요.",
  };
}
