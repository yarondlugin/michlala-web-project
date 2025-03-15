import express from 'express';
import multer from 'multer';
import { deleteUserById, getUserByDetails, getUserById, updateUserById, updateUserProfilePictureById } from '../controllers/users';
import { createErrorHandler, NOT_AN_IMAGE_ERROR } from '../utils/createErrorHandler';
import path from 'path';

export const usersRouter = express.Router();
const upload = multer({
	storage: multer.diskStorage({
		destination: 'public/profilePictures/',
		filename: (request, file, callback) => {
			const { id: userId } = request.params;
			const ext = path.extname(file.originalname);
			callback(null, `${userId}${Date.now()}${ext}`);
		},
	}),
	fileFilter: (_request, file, callback) => {
		if (!path.extname(file.originalname).match(/^\.(jpg|jpeg|png)$/)) {
			return callback(new Error(NOT_AN_IMAGE_ERROR));
		}
		callback(null, true);
	},
});

usersRouter.get('/', getUserByDetails);
usersRouter.get('/:id', getUserById);
usersRouter.put('/:id', updateUserById);
usersRouter.put('/:id/profilePicture', upload.single('profilePicture'), updateUserProfilePictureById);
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
