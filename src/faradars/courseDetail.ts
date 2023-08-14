import { createReadStream} from "fs";
import CsvReadableStream from "csv-reader";
import { createObjectCsvWriter} from "csv-writer";
import axios from "axios";
import { eachSeries} from "async";

const csvWriter = createObjectCsvWriter( {
	path: `data/faradars/detailedList/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "title", title: "title"},
		{ id: "price", title: "price"},
		{ id: "language", title: "language"},
		{ id: "categories", title: "categories"},
		{ id: "categories_fa", title: "categories_fa"},
		{ id: "createdAt", title: "createdAt"},
		{ id: "duration", title: "duration"},
		{ id: "type", title: "type"},
		{ id: "sold_n", title: "sold_n"},
		{ id: "rating", title: "rating"},
		{ id: "rating_n", title: "rating_n"}
	]
});

const getDetail = async ( slug: string) => {
	console.log( `Fetching ${ slug}`);

	const res = await axios.get( `https://faradars.org/api/v1.1/product/${ slug}`);

	const data = res.data.data;
	const row = {
		id: data.id,
		title: data.title.replaceAll( ",", " "),
		price: data.price,
		language: data.language,
		view_n: data.product_view,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		categories: data.categories.map( ( cat:any) => cat.slug).join( "|"),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		categories_fa: data.categories.map( ( cat:any) => cat.name.replace( ",", " ")).join( "|"),
		createdAt: data.created_at,
		duration: data.total_duration_minute,
		type: data.type,
		sold_n: data.sold_count,
		rating: data.rating,
		rating_n: data.rating_count
	};

	await csvWriter.writeRecords( [ row]);
};

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
				asObject: true
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

const courseDetail = async ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const slugs = await getSlugs( list) as any;

	eachSeries( slugs, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default courseDetail;