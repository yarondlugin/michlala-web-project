import express from 'express';
import { createPost, getAllPosts, getPostById, updatePostById } from '../controllers/posts';
import { createErrorHandler } from '../utils/createErrorHandler';

export const postsRouter = express.Router();

postsRouter.post('/', createPost);
postsRouter.get('/', getAllPosts);
postsRouter.get('/:id', getPostById);
postsRouter.put('/:id', updatePostById);
postsRouter.use(createErrorHandler('posts'));

/**
 * @swagger
 * /posts:
 *  post:
 *    summary: Create a new post
 *    tags:
 *      - Posts
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Post'
 *    responses:
 *      201:
 *        description: Post created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      400:
 *        description: Bad Request (Missing required fields)
 *  get:
 *    summary: Get all posts
 *    tags:
 *      - Posts
 *    parameters:
 *      - name: sender
 *        in: query
 *        schema:
 *          type: string
 *        description: Filter posts by sender
 *        example: sender username
 *    responses:
 *      200:
 *        description: All posts
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Post'
 * /posts/{id}:
 *  get:
 *    summary: Get a post by ID
 *    tags:
 *      - Posts
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The ID of the post to get
 *    responses:
 *      200:
 *        description: The requested post
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      400:
 *        description: The ID is invalid
 *      404:
 *        description: Post not found (this ID doesn't exist)
 *
 *  put:
 *    summary: Update a post by ID
 *    tags:
 *      - Posts
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The ID of the post to update
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Post'
 *    responses:
 *      200:
 *        description: Updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      404:
 *        description: Post not found
 *      400:
 *        description: The ID or request body is invalid
 */
