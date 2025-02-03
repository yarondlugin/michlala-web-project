import { InferRawDocType, Schema, model } from 'mongoose';
import { TypeWithId } from '../utils/types';

const postSchemaDefinition = {
	title: {
		type: String,
		required: true,
	},
	sender: {
		type: String,
		required: true,
	},
	content: String,
} as const;

const postSchema = new Schema(postSchemaDefinition);

export const postModel = model('posts', postSchema);

export type Post = TypeWithId<InferRawDocType<typeof postSchemaDefinition>>;

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       description: A user post
 *       type: object
 *       required:
 *         - title
 *         - sender
 *       properties:
 *         title:
 *           description: The title of the post
 *           type: string
 *         content:
 *           description: The content of the post
 *           type: string
 *         sender:
 *           description: The user who sent the post
 *           type: string
 *       example:
 *         title: "My first post"
 *         content: "I'm so excited and I just can't hide it!"
 *         sender: "stavby"
 */
