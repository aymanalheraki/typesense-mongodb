import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

export class BlogCollectionSchema implements CollectionCreateSchema {
	constructor() {
		// The name of the collection.
		this.name = "falak";

		// The fields that we want to index in the collection.
		this.fields = Blog.fieldsSchema();
	}

	name: string;
	default_sorting_field?: string | undefined;
	fields?: CollectionFieldSchema[] | undefined;
	symbols_to_index?: string[] | undefined;
	token_separators?: string[] | undefined;
	enable_nested_fields?: boolean | undefined;
}

export class Blog {
	constructor(public text: string) {}

	static fieldsSchema(): CollectionFieldSchema[] {
		return [
			{
				name: "text",
				type: "string",
				facet: false,
			},
		];
	}
}
