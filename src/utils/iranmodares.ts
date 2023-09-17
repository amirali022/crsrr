import { createReadStream} from "fs";
import CsvReadableStream from "csv-reader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIds = ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const ids: any[] = [];

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
				ids.push( row.id);
			})
			.on( "end", () => {
				resolve( ids);
			})
			.on( "error", err => {
				reject( err);
			});
	});
};

export {
	getIds
};