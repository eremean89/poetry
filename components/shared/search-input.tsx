"use client";

import { cn } from "@/lib/utils";
import { Api } from "@/services/api-client";
import { Poet } from "@prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useClickAway, useDebounce } from "react-use";

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [poets, setPoets] = React.useState<Poet[]>([]);
  const ref = React.useRef(null);
  useClickAway(ref, () => {
    setFocused(false);
  });

  useDebounce(
    async () => {
      try {
        const response = await Api.poets.search(searchQuery);
        setPoets(response);
      } catch (error) {
        console.log(error);
      }
    },
    250,
    [searchQuery]
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery("");
    setPoets([]);
  };

  return (
    <>
      {focused && (
        <div className="fixed top-0 left-0 bottom-0 right-0 bg-black/50 z-30" />
      )}
      <div
        ref={ref}
        className={cn(
          "flex rounded-2xl flex-1 justify-between relative h-11",
          className
        )}
      >
        <Search className="absolute top-1/2 translate-y-[-50%] left-3 h-5 text-gray-400 z-40" />
        <input
          className="rounded-2xl outline-none w-full bg-[#f1eeea] pl-11 h-11 z-30"
          type="text"
          placeholder="Найти поэта или стихотворение..."
          onFocus={() => setFocused(true)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {poets.length > 0 && (
          <div
            className={cn(
              "absolute w-full bg-white rounded-xl py-2 top-14 shadow-md transition-all duration-200 invisible opacity-0 z-30",
              focused && "visible opacity-100 top-12"
            )}
          >
            {poets.map((poet) => (
              <Link
                onClick={onClickItem}
                key={poet.id}
                href={`/poet/${poet.id}`}
                className="flex items-center gap-3 w-full px-3 py-2 hover:bg-[#f1eeea]"
              >
                <span>{poet.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
