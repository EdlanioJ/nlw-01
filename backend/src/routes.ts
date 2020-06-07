import { Router } from "express";
import { Joi, celebrate } from "celebrate";

import multer from "multer";
import multerConfig from "./config/multer";

import PointsController from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";

const routes = Router();
const upload = multer(multerConfig);

const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get("/items", itemsController.index);

routes.post(
  "/points",
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        whatsapp: Joi.number().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        items: Joi.string().required(),
      }),
    },
    { abortEarly: false }
  ),
  upload.single("image"),
  pointsController.create
);
routes.get("/points/:id", pointsController.show);
routes.get("/points", pointsController.index);

export default routes;