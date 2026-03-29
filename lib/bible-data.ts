// 개역개정 성경 책 목록
export const BIBLE_BOOKS = {
  구약: [
    { id: "gen", name: "창세기", abbr: "창", chapters: 50 },
    { id: "exo", name: "출애굽기", abbr: "출", chapters: 40 },
    { id: "lev", name: "레위기", abbr: "레", chapters: 27 },
    { id: "num", name: "민수기", abbr: "민", chapters: 36 },
    { id: "deu", name: "신명기", abbr: "신", chapters: 34 },
    { id: "jos", name: "여호수아", abbr: "수", chapters: 24 },
    { id: "jdg", name: "사사기", abbr: "삿", chapters: 21 },
    { id: "rut", name: "룻기", abbr: "룻", chapters: 4 },
    { id: "1sa", name: "사무엘상", abbr: "삼상", chapters: 31 },
    { id: "2sa", name: "사무엘하", abbr: "삼하", chapters: 24 },
    { id: "1ki", name: "열왕기상", abbr: "왕상", chapters: 22 },
    { id: "2ki", name: "열왕기하", abbr: "왕하", chapters: 25 },
    { id: "1ch", name: "역대상", abbr: "대상", chapters: 29 },
    { id: "2ch", name: "역대하", abbr: "대하", chapters: 36 },
    { id: "ezr", name: "에스라", abbr: "스", chapters: 10 },
    { id: "neh", name: "느헤미야", abbr: "느", chapters: 13 },
    { id: "est", name: "에스더", abbr: "에", chapters: 10 },
    { id: "job", name: "욥기", abbr: "욥", chapters: 42 },
    { id: "psa", name: "시편", abbr: "시", chapters: 150 },
    { id: "pro", name: "잠언", abbr: "잠", chapters: 31 },
    { id: "ecc", name: "전도서", abbr: "전", chapters: 12 },
    { id: "sng", name: "아가", abbr: "아", chapters: 8 },
    { id: "isa", name: "이사야", abbr: "사", chapters: 66 },
    { id: "jer", name: "예레미야", abbr: "렘", chapters: 52 },
    { id: "lam", name: "예레미야애가", abbr: "애", chapters: 5 },
    { id: "ezk", name: "에스겔", abbr: "겔", chapters: 48 },
    { id: "dan", name: "다니엘", abbr: "단", chapters: 12 },
    { id: "hos", name: "호세아", abbr: "호", chapters: 14 },
    { id: "jol", name: "요엘", abbr: "욜", chapters: 3 },
    { id: "amo", name: "아모스", abbr: "암", chapters: 9 },
    { id: "oba", name: "오바댜", abbr: "옵", chapters: 1 },
    { id: "jon", name: "요나", abbr: "욘", chapters: 4 },
    { id: "mic", name: "미가", abbr: "미", chapters: 7 },
    { id: "nam", name: "나훔", abbr: "나", chapters: 3 },
    { id: "hab", name: "하박국", abbr: "합", chapters: 3 },
    { id: "zep", name: "스바냐", abbr: "습", chapters: 3 },
    { id: "hag", name: "학개", abbr: "학", chapters: 2 },
    { id: "zec", name: "스가랴", abbr: "슥", chapters: 14 },
    { id: "mal", name: "말라기", abbr: "말", chapters: 4 },
  ],
  신약: [
    { id: "mat", name: "마태복음", abbr: "마", chapters: 28 },
    { id: "mrk", name: "마가복음", abbr: "막", chapters: 16 },
    { id: "luk", name: "누가복음", abbr: "눅", chapters: 24 },
    { id: "jhn", name: "요한복음", abbr: "요", chapters: 21 },
    { id: "act", name: "사도행전", abbr: "행", chapters: 28 },
    { id: "rom", name: "로마서", abbr: "롬", chapters: 16 },
    { id: "1co", name: "고린도전서", abbr: "고전", chapters: 16 },
    { id: "2co", name: "고린도후서", abbr: "고후", chapters: 13 },
    { id: "gal", name: "갈라디아서", abbr: "갈", chapters: 6 },
    { id: "eph", name: "에베소서", abbr: "엡", chapters: 6 },
    { id: "php", name: "빌립보서", abbr: "빌", chapters: 4 },
    { id: "col", name: "골로새서", abbr: "골", chapters: 4 },
    { id: "1th", name: "데살로니가전서", abbr: "살전", chapters: 5 },
    { id: "2th", name: "데살로니가후서", abbr: "살후", chapters: 3 },
    { id: "1ti", name: "디모데전서", abbr: "딤전", chapters: 6 },
    { id: "2ti", name: "디모데후서", abbr: "딤후", chapters: 4 },
    { id: "tit", name: "디도서", abbr: "딛", chapters: 3 },
    { id: "phm", name: "빌레몬서", abbr: "몬", chapters: 1 },
    { id: "heb", name: "히브리서", abbr: "히", chapters: 13 },
    { id: "jas", name: "야고보서", abbr: "약", chapters: 5 },
    { id: "1pe", name: "베드로전서", abbr: "벧전", chapters: 5 },
    { id: "2pe", name: "베드로후서", abbr: "벧후", chapters: 3 },
    { id: "1jn", name: "요한일서", abbr: "요일", chapters: 5 },
    { id: "2jn", name: "요한이서", abbr: "요이", chapters: 1 },
    { id: "3jn", name: "요한삼서", abbr: "요삼", chapters: 1 },
    { id: "jud", name: "유다서", abbr: "유", chapters: 1 },
    { id: "rev", name: "요한계시록", abbr: "계", chapters: 22 },
  ],
};

// Well-known verses for display/search purposes
export const FAMOUS_VERSES = [
  { ref: "요 3:16", text: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라" },
  { ref: "빌 4:13", text: "내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라" },
  { ref: "시 23:1", text: "여호와는 나의 목자시니 내게 부족함이 없으리로다" },
  { ref: "롬 8:28", text: "우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라" },
  { ref: "잠 3:5-6", text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라" },
  { ref: "사 40:31", text: "오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 달음박질하여도 곤비하지 아니하겠고 걸어가도 피곤하지 아니하리로다" },
  { ref: "마 11:28", text: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라" },
  { ref: "렘 29:11", text: "여호와의 말씀이니라 너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라" },
  { ref: "고후 12:9", text: "내 은혜가 네게 족하도다 이는 내 능력이 약한 데서 온전하여짐이라 하신지라 그러므로 도리어 크게 기뻐함으로 나의 여러 약한 것들에 대하여 자랑하리니 이는 그리스도의 능력이 내게 머물게 하려 함이라" },
  { ref: "시 46:1", text: "하나님은 우리의 피난처시요 힘이시니 환난 중에 만날 큰 도움이시라" },
  { ref: "수 1:9", text: "내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라" },
  { ref: "엡 2:8", text: "너희는 그 은혜에 의하여 믿음으로 말미암아 구원을 받았으니 이것은 너희에게서 난 것이 아니요 하나님의 선물이라" },
];

export function getAllBooks() {
  return [...BIBLE_BOOKS.구약, ...BIBLE_BOOKS.신약];
}

export function findBook(query: string) {
  const all = getAllBooks();
  return all.find(
    (b) =>
      b.name.includes(query) ||
      b.abbr === query ||
      b.id === query.toLowerCase()
  );
}
