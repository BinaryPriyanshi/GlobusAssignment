import {Router} from 'express';
import { evaluateQuestion, getAllQuestions, getQuestions, saveQuestion } from '../controllers/questions.controller.js';

const router = Router();

router.route('/save_question').post(saveQuestion);
router.route('/get_questions').get(getQuestions);
router.route('/get_all_questions').get(getAllQuestions);
router.route('/evaluate_question').post(evaluateQuestion);

export default router;