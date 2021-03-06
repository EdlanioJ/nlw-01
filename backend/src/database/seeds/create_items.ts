import Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("items").insert([
    { title: "Lâmpada", image: "lampadas.svg" },
    { title: "Pilhas e Baterias", image: "baterias.svg" },
    { title: "Papeis e Papelão", image: "papeis-papelao.svg" },
    { title: "Residuos Eletrônicos", image: "eletronicos.svg" },
    { title: "Residuos Orgânicos", image: "organicos.svg" },
    { title: "Óleo de Cozinha", image: "oleo.svg" },
  ]);
}
