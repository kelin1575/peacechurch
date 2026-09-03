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
  process.env.BULLETIN_BOARD_URL || "https://www.peacechurch.kr/Board/Index/46";

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

/** 여러 줄을 읽기 좋게 다듬습니다. */
function tidy(text: string): string {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => (/^[·\-*•]/.test(l) ? l : l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 4000);
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

export async function fetchLatestBulletin(
  boardUrl: string = DEFAULT_BOARD_URL
): Promise<BulletinResult> {
  const steps: BulletinStep[] = [];
  const boardId = boardIdFrom(boardUrl);
  const push = (label: string, detail: string, ok: boolean) =>
    steps.push({ label, detail, ok });

  // ── 1. 목록 페이지 ──
  const list = await fetchText(boardUrl);
  push(
    "주보 목록 페이지 읽기",
    `${boardUrl} → ${list.status || "연결 실패"}${
      list.ok ? ` (${list.body.length.toLocaleString()}자)` : ` · ${list.body.slice(0, 200)}`
    }`,
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

  // 원본이 있으면 원본을, 없으면 축소본을 씁니다.
  const original = pool.find((a) => !/\/resized_/.test(a.url));
  const imageUrl = (original ?? pool[0])?.url;
  push(
    "주보 이미지 찾기",
    pool.length
      ? `${pool.length}개 발견 · 사용: ${imageUrl}`
      : "이미지를 찾지 못했습니다.",
    pool.length > 0
  );

  // ── 5. 본문 ──
  const text = htmlToText(detailHtml);
  const { content, matched } = extractNewsSection(text);
  const tidied = tidy(content);
  push(
    "교회소식 부분 골라내기",
    matched
      ? `"교회소식" 표제를 찾았습니다 · ${tidied.length}자`
      : `표제를 못 찾아 본문 전체에서 정리했습니다 · ${tidied.length}자`,
    matched
  );

  // ── 6. 게시해도 될 만큼 확실한가 ──
  const confident =
    Boolean(imageUrl) && matched && tidied.length >= 40 && tidied.length <= 4000;

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
    imageCandidates: pool.map((a) => a.url),
    steps,
    htmlSample: detailHtml.slice(0, 3000),
    message: confident
      ? "게시할 수 있을 만큼 확실하게 읽었습니다."
      : "확실하지 않아 자동 게시는 하지 않습니다. 아래 내용을 확인하고 직접 등록해 주세요.",
  };
}
