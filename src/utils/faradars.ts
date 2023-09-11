import { createReadStream} from "fs";
import CsvReadableStream from "csv-reader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSlugs = ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const slugs: any[] = [];

	return new Promise( ( resolve, reject) => {
		const inputStream = createReadStream( list, "utf8");
		inputStream
			.pipe( new CsvReadableStream( {
				parseNumbers: true,
				parseBooleans: true,
				trim: true,
				asObject: true,
				skipLines: 6654
			}))
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.on( "data", ( row: any) => {
				slugs.push( row.slug);
			})
			.on( "end", () => {
				resolve( slugs);
			})
			.on( "error", err => {
				reject( err);
			});
	});
};

export {
	getSlugs
};