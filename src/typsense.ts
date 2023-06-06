import { Client } from "typesense";
import { ChangeStreamDocument, Document, MongoClient } from "mongodb";
import { TypesenseError } from "typesense/lib/Typesense/Errors";
import { config, DataSchema } from "./config";
import {
	SearchParams,
	SearchParamsWithPreset,
} from "typesense/lib/Typesense/Documents";

let typesense = new Client({
	nodes: config.nodes,
	apiKey: config.apiKey,
	connectionTimeoutSeconds: config.connectionTimeoutSeconds,
	logLevel: config.logLevel as any,
});

export async function search(
	searchParameters: SearchParams | SearchParamsWithPreset
) {
	try {
		const searchResults = await typesense
			.collections(config.collectionName)
			.documents()
			.search(searchParameters);

		console.log(searchResults);

		return searchResults;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

export async function createCollection(client: MongoClient) {
	try {
		// Define the schema for the collection.
		const schema = config.collectionSchema;

		console.log(
			`Creating collection ${schema.name} with the following schema:\n${schema.name}`
		);

		const exists = await typesense.collections(config.collectionName).exists();

		if (!exists) {
			await typesense.collections().create(schema);
		}

		console.log("Collection created successfully!");
		let processed = 0;

		const batchSize = 10000;
		const collection = client.db('falak').collection(config.collectionName);
		const count = await collection.countDocuments(undefined, {
			readPreference: "primaryPreferred",
		});

		console.log(`Found ${count} documents in the collection`);

		while (processed < count) {
			const batch = collection
				.find(
					{},
					{
						limit: batchSize,
						readPreference: "primaryPreferred",
					}
				)
				.sort({ _id: 1 })
				.skip(processed);

			const documents = await batch.toArray();

			console.log("Importing data into collection...");

			// Convert each document to the format required by Typesense
			const typesenseDocuments = documents.map((doc: any) => {
				const data = { id: doc._id.toString(), text: doc.raw[0] };
				return data as DataSchema;
			});

			try {
				await typesense
					.collections(config.collectionName)
					.documents()
					.import(typesenseDocuments, {
						action: "create",
						batch_size: batchSize,
						dirty_values: "drop",
					});
			} catch (error) {
				processed += batchSize;

				console.error(error);
				continue;
			}

			processed += batchSize;

			console.log(`Processed ${processed} documents, moving to next batch...`);
			console.log(`${((processed / count) * 100).toPrecision(2)}% completed`);
		}
	} catch (e) {
		const error = e as TypesenseError;

		// If the collection already exists, skip the error.
		if (error.httpStatus == 409) {
			console.log("Collection already exists, skipping...");
			return;
		}

		throw error;
	}
}

export async function index(next: ChangeStreamDocument<Document>) {
	const col = typesense.collections(config.collectionName);
	const operationType = next.operationType;

	switch (operationType) {
		case "delete": {
			try {
				const id = next.documentKey._id.toString();
				await col.documents(id).delete();
			} catch (e) {
				const error = e as TypesenseError;
				if (error.httpStatus == 404) {
					console.log("Document not found, skipping...");
					return;
				}
			}

			break;
		}
		case "update": {
			try {
				const id = next.documentKey._id.toString();
				let data = next.fullDocument as DataSchema;
				await col.documents(id).update(data);
			} catch (e) {
				const error = e as TypesenseError;
				if (error.httpStatus == 404) {
					console.log("Document not found, skipping...");
					return;
				}
			}

			break;
		}
		case "insert": {
			const id = next.documentKey._id.toString();

			const data = { ...next.fullDocument } as DataSchema;
			await col.documents().upsert({ ...data, id });

			break;
		}
		default:
			break;
	}

	try {
		if (next.operationType == "delete") {
		} else if (next.operationType == "update") {
		} else if (next.operationType == "insert") {
		}
	} catch (error) {
		console.error((error as TypesenseError).message);
	}
}
