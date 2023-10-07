import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";
import { load} from "cheerio";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/aghaejazeh/tutorsList/list-${ Date.now()}.csv`,
	header: [
		{ id: "link", title: "link"},
		{ id: "image", title: "image"},
		{ id: "name", title: "name"},
		{ id: "location", title: "location"},
		{ id: "fields", title: "fields"},
		{ id: "online", title: "online"},
		{ id: "present", title: "present"}
	]
});

const url = "https://aghaejazeh.org/tutors";

const totalPages = async () => {
	const res = await axios.get( url);

	const $ = load( res.data);

	const lastPageAddr = $( ".PagedList-skipToLast > a").attr()?.href;

	if( !lastPageAddr)
		return null;

	const lastPageUrl = new URL( `https://aghaejazeh.org${ lastPageAddr}`);

	const lastPage = lastPageUrl.searchParams.get( "Page");

	if( !lastPage)
		return null;
	
	const total = parseInt( lastPage);
	
	return total;
};

const getTutor = async ( url: string) => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const $ = load( res.data);

	const tutorCards = $( "article > div.row");

	const teachers = tutorCards.map( ( idx, el) => {
		const card = load( el);

		const tutorPage = card( "div > a").attr()?.href;
		const picture = card( "img.pictureProfessorList");
		const image = picture.attr()?.[ "data-src"] || picture.attr()?.src || "";
		const name = card( "h3").text();
		const location = card( "div > a > span").text();
		const fields = card( "span.catList").map( ( i, e) => clean( load( e).text()).trim()).toArray().join( "|");
		const method = card( "div.new-span-list").text();
		const online = method.indexOf( "آنلاین") > -1 ? 1 : 0;
		const present = method.indexOf( "منزل") > -1 ? 1 : 0;

		return {
			link: tutorPage ? `https://aghaejazeh.org${ tutorPage}` : "",
			image,
			name: clean( name).trim(),
			location: clean( location),
			fields,
			online,
			present
		};
	}).toArray();

	await csvWriter.writeRecords( teachers);
};

const listTutors = async () => {
	const pages = await totalPages();

	if( !pages)
		throw new Error( "Unable to get total number of items");

	console.log( `Pages: ${ pages}`);

	const urls = [];

	for( let i = 1; i <= pages; ++i)
		urls.push( `${ url}?Page=${ i}`);

	eachSeries( urls, getTutor, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default listTutors;