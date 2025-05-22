import { prisma } from "./prisma-client";
import { hashSync } from "bcrypt";

async function seedUsers() {
  await prisma.user.createMany({
    data: [
      {
        fullName: "yura",
        email: "yura@test.ru",
        password: hashSync("111111", 10),
        verified: new Date(),
        role: "USER",
      },
      {
        fullName: "Admin",
        email: "admin@test.ru",
        password: hashSync("111111", 10),
        verified: new Date(),
        role: "ADMIN",
      },
    ],
  });
}

async function seedPoetsAndWorks() {
  await prisma.poet.createMany({
    data: [
      {
        name: "Лиснянская Инна Львовна",
        image: "/media/poets/[id]/photos/lisnyanskaya.jpg",
        birthDate: new Date("1928-06-24"),
        deathDate: new Date("2014-03-12"),
        description:
          "Инна Львовна Лиснянская родилась 24 июня 1928 года в городе Баку, Азербайджан. Отец – Лев Маркович Лиснянский, еврейского происхождения, был военным врачом и участником Великой Отечественной войны. Мать – Раиса Сумбатовна Адамова, армянка, работала инженером. После развода мать переехала в Москву, а Инна Лиснянская осталась с отцом в Баку. В годы войны она помогала санитаркой в госпитале.",
      },
    ],
  });

  const lisnyanskaya = await prisma.poet.findFirst({
    where: { name: "lisnyanskaya" },
  });

  if (!lisnyanskaya) {
    throw new Error("Ошибка при получении поэтов!");
  }

  await prisma.work.createMany({
    data: [
      {
        title: "Водолей",
        link: "/works/vodoley",
        poetId: lisnyanskaya.id,
        content: `Никогда ни о чём не жалей –
Никогда ничего не изменится.
Лей слезу, голубой водолей,
На голодную зимнюю мельницу.

Я, твоя лунатичная дочь,
Буду в поле позёмку толочь,
Буду вьюгу месить привокзальную.
Пролегла пешеходная ночь
Через всю мою жизнь поминальную.

В мимоходной толпе облаков
Встречу лица друзей и врагов,
И, потоком сознанья подхвачена,
Я под легкие звоны подков,
И под клёкоты колоколов,
И под всхлипы души околпаченной

Обойду все родные места
От бакинской лозы до креста
На лесистой московской окраине.
Наша память о жизни – мечта,
Наша память о смерти – раскаянье.`,
      },
      {
        title: "Виноградный свет",
        link: "/works/vingradniy_svet",
        poetId: lisnyanskaya.id,
        content: `Былое нужно ли — не знаю —
Мне освещать слезою?
Как прежде, вышка нефтяная
Соседствует с лозою.

Опять благообразен облик
Законченного лета!
Корзину с виноградом ослик
Несёт, как чашу света:

Свет полдня — в винограде белом,
А свет вечерний — в чёрном,
И я спешу заняться делом,
Непрочным, стихотворным.

Чтоб мне достался этот сладкий
Свет, из земли текущий,
Пишу стихи в своей тетрадке
О радости грядущей,

О ветре тёплом и попутном,
О свете виноградном,
О том, что снилось в детстве чудном,
Хотя и безотрадном.`,
      },
    ],
  });
}

async function resetDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Poet", "Work", "Option", "MatchPair", "Question", "Quiz", "TextAnswer" RESTART IDENTITY CASCADE`;
}

async function main() {
  try {
    await resetDatabase();
    await seedUsers();
    await seedPoetsAndWorks();
  } catch (error) {
    console.error("Ошибка при сидировании:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
