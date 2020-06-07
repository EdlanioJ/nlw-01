import { Request, Response } from "express";

import knex from "../database/connection";

interface IPointInsert {
  name: string;
  email: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  items: string;
}

interface IPointRequest {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
}

class PointsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
      items,
    }: IPointInsert = request.body;

    const trx = await knex.transaction();

    try {
      const insertedIds = await trx("points").insert({
        image: request.file.filename,
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        state,
      });

      const point_id = insertedIds[0];

      const pointItems = items
        .split(",")
        .map((item) => Number(item.trim()))
        .map((item_id) => ({
          item_id,
          point_id,
        }));

      await trx("point_items").insert(pointItems);

      await trx.commit();

      return response.json({ success: true });
    } catch (err) {
      trx.rollback();

      return response.status(400).json(err);
    }
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const point: IPointRequest = await knex("points").where("id", id).first();

    if (!point) response.status(400).json({ message: "Point not found" });

    const serializedPoint = {
      ...point,
      image_url: `http://localhost:3333${point.image}`,
    };

    const items = knex("items")
      .join("point_items", "items.id", "=", "point_items.items_id")
      .where("point_items.point_id", id)
      .select("items.title");

    return response.json({ serializedPoint, items });
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { city, state, items } = request.query;

    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("point")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.items_id", parsedItems)
      .where("city", String(city))
      .where("state", String(state))
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => ({
      ...point,
      image_url: `http://localhost:3333${point.image}`,
    }));

    return response.json(serializedPoints);
  }
}

export default PointsController;
