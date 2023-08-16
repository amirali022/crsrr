import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";

const baseUrl = "https://api.linom.org/api/v2/course?category_slug=&sub-category=&sort=-default";

const csvWriter = createObjectCsvWriter( {
	path: `data/linom/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "title", title: "title"},
		{ id: "slug", title: "slug"},
		{ id: "price", title: "price"},
		{ id: "length", title: "length"},
		{ id: "createdAt", title: "createdAt"},
		{ id: "rate_avg", title: "rate_avg"},
		{ id: "rate_n", title: "rate_n"},
		{ id: "category", title: "category"}
	]
});

const totalPages = async () => {
	const res = await axios.get( baseUrl);

	const lastPage = parseInt( res.data?.courses?.last_page);
	
	return lastPage;
};

const getCourseDetail = async ( url: string) => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const data = res.data?.courses?.data;

	if( !data)
		throw new Error( "Unable to get page!");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const courses = data.map( ( d: any) => {
		return {
			id: d.id,
			title: d.title,
			slug: d.slug,
			price: d.price,
			length: d.length,
			createdAt: d.created_at,
			rate_avg: parseFloat( d.ratings_avg_rating),
			rate_n: d.ratings_count,
			category: d.category.title
		};
	});

	await csvWriter.writeRecords( courses);
};

const listCourses = async () => {
	const total = await totalPages();

	if( !total)
		throw new Error( "Unable to get total number of items");

	console.log( `Total Pages: ${ total}`);

	const urls = [];

	for( let i = 1; i <= total; ++i)
		urls.push( `${ baseUrl}&page=${ i}`);

	eachSeries( urls, getCourseDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished!");
	});
};

export default listCourses;