import { createReadStream} from "fs";
import CsvReadableStream from "csv-reader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getUrls = ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const urls: any[] = [];

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
				urls.push( row.link);
			})
			.on( "end", () => {
				resolve( urls);
			})
			.on( "error", err => {
				reject( err);
			});
	});
};

export {
	getUrls
};