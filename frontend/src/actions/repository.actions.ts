"use server";

// import { redirect } from "next/navigation";
import { LinkRepositoryInput, linkRepositorySchema } from "./schemas";

export async function linkRepositoryAction(values: LinkRepositoryInput) {
  const { data, success, error } = linkRepositorySchema.safeParse(values);

  if (success) {
    try {
      const response = await fetch("http://localhost:3000/api/repositories", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      //   if(response_data.ok) redirect('')
    } catch (error) {
      console.error(error);
      throw Error("Algo deu errado, tente novamente!");
    }
  } else {
    throw error;
  }
}
