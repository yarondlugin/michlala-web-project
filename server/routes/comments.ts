import express from 'express';
import { createComment, getComments, getCommentById, updateCommentById, deleteCommentById } from '../controllers/comments';
import { createErrorHandler } from '../utils/createErrorHandler';

export const commentsRouter = express.Router();

commentsRouter.post('/', createComment);
commentsRouter.get('/', getComments);
commentsRouter.get('/:id', getCommentById);
commentsRouter.put('/:id', updateCommentById);
commentsRouter.delete('/:id', deleteCommentById);
commentsRouter.use(createErrorHandler('comments'));

/**
 * @swagger
 * /comments:
 *  post:
 *    summary: Create a new comment
 *    tags:
 *      - Comments
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Comment'
 *    responses:
 *      201:
 *        description: Comment created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Comment'
 *      400:
 *        description: Bad Request (Missing required fields)
 *  get:
 *    summary: Get all comments
 *    tags:
 *      - Comments
 *    parameters:
 *      - name: sender
 *        in: query
 *        schema:
 *          type: string
 *        description: Filter comments by sender
 *      - name: postId
 *        in: query
 *        schema:
 *          type: string
 *        description: Filter comments by postId
 *    responses:
 *      200:
 *        description: All comments
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Comment'
 * /comments/{id}:
 *  get:
 *    summary: Get a comment by ID
 *    tags:
 *      - Comments
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The ID of the comment to get
 *    responses:
 *      200:
 *        description: The requested comment
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Comment'
 *      400:
 *        description: The ID is invalid
 *      404:
 *        description: Comment not found (this ID doesn't exist)
 *  put:
 *    summary: Update a comment by ID
 *    tags:
 *      - Comments
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The ID of the comment to update
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Comment'
 *    responses:
 *      200:
 *        description: Updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Comment'
 *      404:
 *        description: Comment not found
 *      400:
 *        description: The ID or request body is invalid
 *  delete:
 *    summary: Delete a comment by ID
 *    tags:
 *      - Comments
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The ID of the comment to delete
 *    responses:
 *      200:
 *        description: Deleted successfully
 *      404:
 *        description: Comment not found
 *      400:
 *        description: The ID is invalid
 */
