import express, { Response, Request } from "express";
import { MongoClient } from "mongodb";
import { createCollection, index, search } from "./typsense";

const client = new MongoClient("mongodb://localhost:27017/?replicaSet=rs0", {
	directConnection: true,
});

const app = express();
const port = 3001;

// Parse JSON bodies for this app.
app.use(express.json());

app.post("/search", async (req: Request, res: Response) => {
	// Extract query from request body
	const { query, query_by, page } = req.body;

	console.log(`Searching for ${query}`);

	// Search for the query in Typesense
	const results = await search({
		q: query,
		query_by: query_by,
		page: page,
		per_page: 40,
		prioritize_exact_match: true,
	});

	// Return the results
	res.status(200).json(results);
});

app.listen(port, () => {
	console.log(`App listening on http://localhost:${port}`);
});

async function watchMoviesCollection() {
	await client.connect();

	const collection = client.db("falak").collection("corpus");
	const changeStream = collection.watch();

	changeStream.on("change", async (next) => {
		console.log(next);

		// Apply the change to Typesense
		await index(next);
	});

	await closeChangeStream(60000, changeStream);
}

function closeChangeStream(timeInMs = 60000, changeStream: any) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log("Closing the change stream");
			changeStream.close();
			resolve("done");
		}, timeInMs);
	});
}

async function main() {
	//await createCollection(client);

	try {
		console.log("Connecting to MongoDB");
		await client.connect();
		await watchMoviesCollection();
	} catch (e) {
		console.error(e);
	} finally {
		await client.close();
	}
}

main().catch(console.error);
