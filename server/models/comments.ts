import { InferRawDocType, Schema, model } from 'mongoose';
import { TypeWithId } from '../utils/types';

const commentSchemaDefinition = {
	sender: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	postId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
} as const;

const commentSchema = new Schema(commentSchemaDefinition);

export const commentModel = model('comments', commentSchema);

export type Comment = TypeWithId<InferRawDocType<typeof commentSchemaDefinition>>;

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - sender
 *         - content
 *         - postId
 *       properties:
 *         sender:
 *           type: string
 *           description: The username of the commenter.
 *         content:
 *           type: string
 *           description: The content of the comment.
 *         postId:
 *           type: string
 *           format: ObjectId
 *           description: The ID of the post to which the comment belongs.
 *       example:
 *         sender: "stavby"
 *         content: "This is a comment."
 *         postId: "60d21b4667d0d8992e610c85"
 */
