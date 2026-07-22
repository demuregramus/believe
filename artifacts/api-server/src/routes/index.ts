import { Router, type IRouter } from "express";
import healthRouter from "./health";
import phoneNumbersRouter from "./phone-numbers";
import plansRouter from "./plans";
import messagesRouter from "./messages";
import statsRouter from "./stats";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(phoneNumbersRouter);
router.use(plansRouter);
router.use(messagesRouter);
router.use(statsRouter);
router.use(webhooksRouter);

export default router;
