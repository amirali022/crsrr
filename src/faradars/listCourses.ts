import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";

const csvWriter = createObjectCsvWriter( {
	path: `data/faradars/courseList/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "title", title: "title"},
		{ id: "sku", title: "sku"},
		{ id: "slug", title: "slug"},
		{ id: "price", title: "price"},
		{ id: "duration", title: "duration"},
		{ id: "product_view", title: "product_view"}
	]
});

const totalItems = async () => {
	const url = "https://faradars.org/api/v1.1/explore";

	const res = await axios.get( url);

	const total = parseInt( res.data?.pagination?.total);
	
	return total;
};

const getCoursePage = async ( url: string) => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const data = res.data?.data;

	if( !data)
		throw new Error( "Unable to get page!");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const courses = data.map( ( d: any) => {
		return {
			id: d.id,
			title: d.title,
			sku: d.sku,
			slug: d.slug,
			price: d.price,
			duration: d.duration,
			product_view: d.product_view
		};
	});

	await csvWriter.writeRecords( courses);
};

const listCourses = async ( perPage: number) => {
	const total = await totalItems();

	if( !total)
		throw new Error( "Unable to get total number of items");

	const pages = Math.ceil( total / perPage);
		
	console.log( `Total item listed: ${ total}`);
	console.log( `Items per pages: ${ perPage}`);
	console.log( `Pages: ${ pages}`);

	const urls = [];

	for( let i = 1; i <= pages; ++i)
		urls.push( `https://faradars.org/api/v1.1/explore?page=${ i}&limit=${ perPage}&orderby=created_time&status=published`);

	eachSeries( urls, getCoursePage, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default listCourses;