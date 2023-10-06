import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";
import { load} from "cheerio";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/ostadsalam/teachersList/list-${ Date.now()}.csv`,
	header: [
		{ id: "name", title: "name"},
		{ id: "link", title: "link"}
	]
});

const url = "https://ostadsalam.ir/lessons";

const totalPages = async () => {
	const res = await axios.get( url);

	const $ = load( res.data);

	const lastPageAddr = $( "li.paginate_button:last-child > a").attr()?.href;

	if( !lastPageAddr)
		return null;

	const lastPageUrl = new URL( lastPageAddr);

	const lastPage = lastPageUrl.searchParams.get( "page");

	if( !lastPage)
		return null;
	
	const total = parseInt( lastPage);
	
	return total;
};

const getTeachers = async ( url: string) => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const $ = load( res.data);

	const teacherCards = $( "div.col-sm-6");

	const teachers = teacherCards.map( ( idx, el) => {
		const card = load( el);

		const name = card( "div.teacher-name > b").text();
		const link1 = card( "div.teacher-l > a").attr()?.href;
		const onclick = card( "div > div > div:nth-child(2) > div.btn").attr()?.onclick;
		const link2 = onclick ? /\('([^)]+)'\)/.exec( onclick)?.at( 1) : "";

		const link = link1 || link2;

		return {
			link: link ? `https://ostadsalam.ir${ link}` : "",
			name: clean( name).trim()
		};
	}).toArray();

	await csvWriter.writeRecords( teachers);
};

const listTeachers = async () => {
	const pages = await totalPages();

	if( !pages)
		throw new Error( "Unable to get total number of items");

	console.log( `Pages: ${ pages}`);

	const urls = [];

	for( let i = 1; i <= pages; ++i)
		urls.push( `${ url}?page=${ i}`);

	eachSeries( urls, getTeachers, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default listTeachers;