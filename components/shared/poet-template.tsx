import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import DOMPurify from "dompurify";
import PhotoGallery from "./photo-gallery";
import { ListChecks } from "lucide-react";
import { useSession } from "next-auth/react";

interface Work {
  id: number;
  title: string;
  link: string;
  audioUrl?: string;
  quizzes?: { id: number }[];
}

interface Video {
  title: string;
  url: string;
}

interface PoetTemplateProps {
  name: string;
  image: string;
  description: string;
  birthDate: string;
  deathDate: string;
  photos?: string[];
  videos?: Video[];
  audios?: { title: string; url: string }[];
  works: Work[];
  onWorkClick: (workId: number) => void;
  mainQuizId?: number;
}

export default function PoetTemplate({
  name,
  image,
  description,
  birthDate,
  deathDate,
  photos = [],
  videos = [],
  works,
  onWorkClick,
  mainQuizId,
}: PoetTemplateProps) {
  const galleryPhotos = photos.map((src) => ({
    src,
  }));
  const { data: session, status } = useSession();
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="container mx-auto py-10 pt-24 px-4 space-y-10">
      {/* Фото и карточка с информацией */}
      <div className="flex items-center gap-8 mb-8">
        {/* Фото, вынесенное отдельно */}
        <div className="flex-shrink-0">
          <img
            src={image}
            alt={name}
            width={300}
            height={400}
            className="rounded-lg shadow-lg object-cover"
          />
        </div>

        {/* Карточка с информацией */}
        <section className="bg-white shadow-lg rounded-lg p-6 flex-1 flex divide-x-2 divide-gray-400">
          {/* Левая колонка: Имя и даты */}
          <div className="flex flex-col space-y-4 pr-6 w-1/2 text-center">
            <h1 className="text-2xl font-bold mb-2">{name}</h1>
            <p className="text-gray-700">
              <strong className="text-xl">Дата рождения:</strong>{" "}
              <span className="ml-2">{formatDate(birthDate)}</span>
            </p>
            {deathDate && (
              <p className="text-gray-700">
                <strong className="text-xl">Дата смерти:</strong>{" "}
                <span className="ml-2">{formatDate(deathDate)}</span>
              </p>
            )}
            {mainQuizId && (
              <div className="flex justify-center mt-6">
                {status === "loading" ? (
                  <div>Загрузка...</div>
                ) : session ? (
                  <Button
                    variant="ghost"
                    className="bg-transparent hover:bg-transparent hover:text-[#3D3329] text-[#3D3329] text-lg rounded-2xl px-4 py-2 flex items-center gap-1 mb-2"
                  >
                    <ListChecks className="w-5 h-5" />
                    <Link href={`/user/quiz/${mainQuizId}`}>Пройти тест</Link>
                  </Button>
                ) : (
                  <p>Для прохождения теста необходима авторизация</p>
                )}
              </div>
            )}
          </div>

          {/* Правая колонка: Произведения и кнопка */}
          <div className="flex flex-col pl-6 w-1/2">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Знаменитые произведения
            </h2>
            <div className=" flex-1 ">
              {works.length > 0 ? (
                works.map((work) => (
                  <div
                    key={work.id}
                    className="p-1 w-max rounded-lg cursor-pointer text-lg hover:underline"
                    onClick={() => onWorkClick(work.id)}
                  >
                    {work.title}
                  </div>
                ))
              ) : (
                <p>Произведения не найдены.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Биография */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Биография</h2>
        <div
          className="bg-white p-6 rounded-lg shadow text-lg prose prose-lg space-y-3 max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
        />
      </section>

      {/* Фотогалерея */}
      <PhotoGallery photos={galleryPhotos} />

      {/* Видеогалерея */}
      {videos && videos.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Видеоматериалы</h2>

          {/* Сетка: 1 колонка на мобилке, 2 — на sm, 3 — на md, 4 — на lg */}
          <div
            className="grid gap-4  
     grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
          >
            {videos.map((video, i) => (
              <div key={i} className="flex flex-col">
                <div className="relative w-full aspect-video">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={video.url}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
                <p className="mt-2 text-center font-medium">{video.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
