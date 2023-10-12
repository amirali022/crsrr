import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";
import { load} from "cheerio";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/iranostad/list-${ Date.now()}.csv`,
	header: [
		{ id: "title", title: "title"},
		{ id: "image", title: "image"},
		{ id: "name", title: "name"},
		{ id: "phone", title: "phone"}
	]
});

const url = "https://iranostad.com/";
const params = "?post_type=hp_listing&_category&s";

const totalPages = async () => {
	const res = await axios.get( `${ url}${ params}`);

	const $ = load( res.data);

	const href = $( "a.page-numbers:nth-child(4)").attr()?.href;

	if( !href)
		return null;

	const lastPageUrl = new URL( href);

	const total = parseInt( lastPageUrl.pathname.split( "/")[ 2]);
	
	return total;
};

const getTutor = async ( url: string) => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const $ = load( res.data);

	const tutorCards = $( "div.hp-grid__item");

	const tutors = tutorCards.map( ( idx, el) => {
		const card = load( el);

		const title = card( "article > div > h4 > a").text();
		const picture = card( "header > div > a > img");
		const image = picture.attr()?.[ "data-src"] || picture.attr()?.src || "";
		const name = card( "div.hp-listing__attribute--name-surename").text();
		const phone = card( "div.hp-listing__attribute--mobile > a").text();

		return {
			title: clean( title),
			image,
			name: clean( name),
			phone: clean( phone)
		};
	}).toArray();

	await csvWriter.writeRecords( tutors);
};

const listTutors = async () => {
	const pages = await totalPages();

	if( !pages)
		throw new Error( "Unable to get total number of items");

	console.log( `Pages: ${ pages}`);

	const urls = [];

	for( let i = 1; i <= pages; ++i)
		urls.push( `${ url}page/${ i}/${ params}`);

	eachSeries( urls, getTutor, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default listTutors;