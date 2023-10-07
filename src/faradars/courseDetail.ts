import { createObjectCsvWriter} from "csv-writer";
import axios from "axios";
import { eachSeries} from "async";
import { getKeys} from "../utils/getKeys";

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

const courseDetail = async ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const slugs = await getKeys( list, "slug") as any;

	eachSeries( slugs, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default courseDetail;