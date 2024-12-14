import { Router } from "express";
import { parsePdf } from "../controllers/parsePdf.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { generalTalk } from "../controllers/generalTalk.controller.js";
const router = Router();

router.route("/parse_pdf").post(upload.single('file'), parsePdf);
router.route("/generate_questions").post(generalTalk);

export default router;