import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogueRouter from "./catalogue";
import customerRouter from "./customer";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogueRouter);
router.use(customerRouter);
router.use(adminRouter);

export default router;