import { Router, type IRouter } from "express";
import healthRouter from "./health";
import phoneNumbersRouter from "./phone-numbers";
import plansRouter from "./plans";
import messagesRouter from "./messages";
import statsRouter from "./stats";
import webhooksRouter from "./webhooks";
import adminRouter from "./admin";
import esimRouter from "./esim";
import callsRouter from "./calls";
import voicemailRouter from "./voicemail";
import contactsRouter from "./contacts";
import numberLockRouter from "./number-lock";
import eventsRouter from "./events";
import complianceRouter from "./compliance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(phoneNumbersRouter);
router.use(plansRouter);
router.use(messagesRouter);
router.use(statsRouter);
router.use(webhooksRouter);
router.use(adminRouter);
router.use(esimRouter);
router.use(callsRouter);
router.use(voicemailRouter);
router.use(contactsRouter);
router.use(numberLockRouter);
router.use(eventsRouter);
router.use(complianceRouter);

export default router;
