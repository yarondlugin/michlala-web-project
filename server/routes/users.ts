import express from 'express';
import { getUserByDetails, getUserById, updateUserById, deleteUserById } from '../controllers/users';
import { createErrorHandler } from '../utils/createErrorHandler';

export const usersRouter = express.Router();

usersRouter.get('/', getUserByDetails);
usersRouter.get('/:id', getUserById);
usersRouter.put('/:id', updateUserById);
usersRouter.delete('/:id', deleteUserById);
usersRouter.use(createErrorHandler('users'));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a user by details
 *     tags:
 *       - Users
 *     parameters:
 *       - name: username
 *         in: query
 *         schema:
 *           type: string
 *         description: Find user by username
 *       - name: email
 *         in: query
 *         schema:
 *           type: string
 *         description: Find user by email
 *     responses:
 *       200:
 *         description: A user's details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request (Invalid query parameters)
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to get
 *     responses:
 *       200:
 *         description: A user's details
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request (Invalid ID)
 *   put:
 *     summary: Update a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request (Invalid ID or missing fields)
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad Request (Invalid ID)
 */
