import axios from 'axios';
import { appConfig } from '../utils/appConfig';
import { Post, postModel } from '../models/posts';

const aiClient = axios.create({
	baseURL: `${appConfig.aiClient.apiUrl}:generateContent?key=${appConfig.aiClient.apiKey}`,
	withCredentials: true,
});

const POST_GENERATION_AMOUNT = 20;

const POST_GENERATION_PROMPT = `
Generate ${POST_GENERATION_AMOUNT} posts, where each posts is 2-3 sentences long about a random topic from the last month.
Generate the posts as a JSON array, with each post being an object with a title field and a content field.
The posts should feel authentic and vary in formality and information.
All of the posts should present ideas in the theme of "shower thoughts".
Make some posts quirky, weird, classic shower thoughts, and make some posts informative about the latest trending topics from this month, while keeping the general theme.
-------------
IMPORTANT: Return ONLY valid JSON with no extra text or explanation. The response should be parseable JSON.
`;

const JSON_REGEX = /\[[\s\S]*\]/;

export const generateAIPosts = async () => {
	console.log('Generating AI posts');
	const response = await aiClient.post(
		'',
		{ contents: [{ parts: [{ text: POST_GENERATION_PROMPT }] }] },
		{ headers: { 'Content-Type': 'application/json' } }
	);

	const generatedText = response.data.candidates[0].content.parts[0].text;
	const regexMatch = generatedText.match(JSON_REGEX);
	
    if (!regexMatch) {
      throw new Error('Failed to extract JSON from API response');
    }

    const generatedPosts: Pick<Post, 'title' | 'content'>[] = JSON.parse(regexMatch[0]);

	const posts = await postModel.create(generatedPosts.map(post => ({...post, sender: '@ai-generated'})));
	return posts;
};
