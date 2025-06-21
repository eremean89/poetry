"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import PoetTemplate from "@/components/shared/poet-template";
import Modal from "@/components/shared/modal";
import { useModal } from "@/components/shared/context/modal-context";


interface Work {
  id: number;
  title: string;
  link: string;
  content: string;
  audios?: { title: string; url: string }[];
  quizzes?: { id: number }[];
}

interface Poet {
  id: number;
  name: string;
  image: string;
  description: string;
  birthDate: string;
  deathDate: string;
  works: Work[];
  photos?: string[];
  videos?: { title: string; url: string }[];
  audios?: { title: string; url: string }[];
}

export default function PoetPage() {
  const { id } = useParams();
  const [poet, setPoet] = useState<Poet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const { isModalOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    async function fetchPoetData() {
      try {
        const res = await fetch(`/api/poets/${id}`);
        const data = await res.json();

        const photoBase = `/media/poets/${data.id}/photos/`;
        const fullPhotos = (data.photos || []).map(
          (f: string) => photoBase + f
        );

        setPoet({ ...data, photos: fullPhotos });
      } catch (error) {
        console.error("Ошибка при загрузке данных поэта:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPoetData();
  }, [id]);
  
  const handleWorkClick = async (workId: number) => {
    try {
      const response = await fetch(`/api/works/${workId}`);
      if (!response.ok) throw new Error("Произведение не найдено");
      const workData = (await response.json()) as Work;
      setSelectedWork(workData);
      openModal();
    } catch (error) {
      console.error("Ошибка при загрузке стихотворения:", error);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!poet) return notFound();

  return (
    <>
      <PoetTemplate
        name={poet.name}
        image={poet.image}
        description={poet.description}
        birthDate={poet.birthDate}
        deathDate={poet.deathDate || ""}
        works={poet.works}
        photos={poet.photos}
        videos={poet.videos}
        audios={poet.audios}
        onWorkClick={handleWorkClick}
        mainQuizId={poet.id}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          setSelectedWork(null);
        }}
        title={selectedWork?.title || ""}
        audios={selectedWork?.audios || []}
      >
        {selectedWork && <div>{selectedWork.content}</div>}
      </Modal>
    </>
  );
}
