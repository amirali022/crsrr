import { createReadStream} from "fs";
import CsvReadableStream from "csv-reader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getKeys = ( list: string, key: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const keys: any[] = [];

	return new Promise( ( resolve, reject) => {
		const inputStream = createReadStream( list, "utf8");
		inputStream
			.pipe( new CsvReadableStream( {
				parseNumbers: true,
				parseBooleans: true,
				trim: true,
				asObject: true
			}))
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.on( "data", ( row: any) => {
				keys.push( row[ key]);
			})
			.on( "end", () => {
				resolve( keys);
			})
			.on( "error", err => {
				reject( err);
			});
	});
};

export {
	getKeys
};