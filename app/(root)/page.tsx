"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Poet {
  id: number;
  name: string;
  image: string;
}

export default function Home() {
  const [poets, setPoets] = useState<Poet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPoets() {
      try {
        const response = await fetch("/api/poets");
        if (response.ok) {
          setPoets(await response.json());
        } else {
          console.error("Ошибка при загрузке поэтов");
        }
      } catch (error) {
        console.error("Ошибка при запросе поэтов:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPoets();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <main className="container mx-auto py-10 pt-24">
      <h1 className="text-3xl font-bold text-center mb-8">
        Знаменитые поэты XX-XXI в.
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 auto-rows-fr">
        {poets.length > 0 ? (
          poets.map((poet) => (
            <div
              key={poet.id}
              className="h-full flex flex-col items-center justify-end text-center"
            >
              <Link href={`/poet/${poet.id}`} className="block mb-2">
                <Image
                  src={poet.image}
                  alt={poet.name}
                  width={200}
                  height={200}
                  className="object-contain rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <Link
                href={`/poet/${poet.id}`}
                className="block text-lg font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis hover:underline"
              >
                {poet.name}
              </Link>
            </div>
          ))
        ) : (
          <p>Поэты не найдены.</p>
        )}
      </div>
    </main>
  );
}
