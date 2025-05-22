import { Poet } from "@prisma/client";
import { axiosInstance } from "./instance";
import { ApiRoutes } from "./constants";

export const search = async (query: string): Promise<Poet[]> => {
  return (
    await axiosInstance.get<Poet[]>(ApiRoutes.SEARCH_POETS, {
      params: { query },
    })
  ).data;
};
