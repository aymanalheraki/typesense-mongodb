import { Blog, BlogCollectionSchema } from "./schema";

export const config = {
	nodes: [
		{
			host: "localhost",
			port: 8108,
			protocol: "http",
		},
	],
	apiKey: "xyz",
	connectionTimeoutSeconds: 20,
	logLevel: "info",

	collectionName: "corpus",
	collectionSchema: new BlogCollectionSchema(),
};

export type DataSchema = Blog;
