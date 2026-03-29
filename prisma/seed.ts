import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Sample sermons
  await prisma.sermon.upsert({
    where: { youtubeId: "sample-yt-1" },
    update: {},
    create: {
      youtubeId: "sample-yt-1",
      title: "주일예배 - 하나님의 은혜 (2024.03.10)",
      description: "오늘 말씀: 요한복음 3:16",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      publishedAt: new Date("2024-03-10"),
      category: "주일예배",
      scripture: "요한복음 3:16",
      summary: "하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니, 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라. 오늘 말씀은 하나님의 무한한 사랑과 그 사랑의 표현인 예수 그리스도에 대해 가르쳐 줍니다.",
      interpretation: "요한복음 3:16은 성경 전체의 복음을 한 절에 담고 있습니다. '세상'은 하나님을 거역하는 모든 인류를 의미하며, '이처럼 사랑하사'는 십자가의 희생으로 나타난 하나님의 사랑의 깊이를 보여줍니다. 우리의 삶에서 이 사랑을 받아들이고, 이 사랑으로 다른 사람을 사랑하는 것이 그리스도인의 삶입니다.",
    },
  });

  // Sample devotional for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.devotional.upsert({
    where: { date: today },
    update: {},
    create: {
      title: "하나님의 은혜로 충분합니다",
      scripture: "고린도후서 12:9",
      content: `오늘의 본문은 사도 바울이 "가시"라고 부른 고난을 통해 하나님의 은혜를 깊이 경험하는 이야기입니다.

바울은 세 번이나 이 고통을 제거해 달라고 간구했습니다. 그러나 하나님의 응답은 예상과 달랐습니다. "내 은혜가 네게 족하도다."

우리도 인생의 여러 어려움 앞에서 하나님께 제거해 달라고 기도합니다. 때로는 질병, 때로는 관계의 상처, 때로는 경제적 어려움... 그런데 하나님은 때때로 상황을 바꾸시는 대신 우리 안에 역사하시는 은혜를 주십니다.

"내 능력이 약한 데서 온전하여짐이라" - 이 말씀은 우리의 약함이 하나님의 강함이 나타나는 통로가 됨을 가르쳐 줍니다. 오늘 우리의 약함을 인정하고, 그 자리에서 하나님의 은혜를 경험하는 하루가 되기를 소망합니다.`,
      prayer: `하나님 아버지, 오늘 저의 연약함을 주님 앞에 내려놓습니다. 제 힘으로 해결하려 했던 문제들을 주님께 맡깁니다. 주님의 은혜가 제게 족함을 믿으며, 그 은혜 안에서 오늘 하루를 걸어가게 하소서. 예수님의 이름으로 기도합니다. 아멘.`,
      date: today,
    },
  });

  // Yesterday's devotional
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.devotional.upsert({
    where: { date: yesterday },
    update: {},
    create: {
      title: "구하라, 그리하면 받으리라",
      scripture: "마태복음 7:7-8",
      content: `예수님께서는 기도에 대해 명확하게 가르쳐 주셨습니다. "구하라 그리하면 너희에게 주실 것이요, 찾으라 그리하면 찾아낼 것이요, 문을 두드리라 그리하면 너희에게 열릴 것이니."

이 말씀은 단순한 약속이 아닙니다. 이것은 하나님과 우리의 관계에 대한 선언입니다. 하나님은 우리의 기도를 들으시고, 때를 따라 가장 좋은 것으로 응답하십니다.

기도는 우리의 욕구를 채우는 수단이 아니라, 하나님과의 친밀한 교제입니다. 구하는 행위 자체가 하나님에 대한 신뢰를 표현합니다.`,
      prayer: `주님, 오늘도 기도로 주님 앞에 나아옵니다. 제 마음의 소원들을 주님께 아뢰며, 주님의 뜻이 이루어지기를 원합니다. 믿음으로 구하며, 믿음으로 기다리는 하루가 되게 하소서. 아멘.`,
      date: yesterday,
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
