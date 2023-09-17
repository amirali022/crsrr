import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";
import { load} from "cheerio";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/iranmodares/tutorList/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "title", title: "title"},
		{ id: "city", title: "city"},
		{ id: "phone", title: "phone"},
		{ id: "img", title: "img"}
	]
});

const url = "https://teaching.iranmodares.com/teaching-index.php";

const totalPages = async () => {
	const res = await axios.get( url);

	const $ = load( res.data);

	const total = parseInt( $( ".page-number-item5 > span:nth-child(2)").text());
	
	return total;
};

const getTutorPage = async ( url: string) => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const $ = load( res.data);

	let tutorCards = $( ".block2 > .index-tutor");

	tutorCards = tutorCards.slice( 0, -1);

	const tutors = tutorCards.map( ( idx, el) => {
		const card = load( el);

		const link = card( ".teacher-tdars > a").attr()?.href;
		const id = link?.match( /ID=(\d+)$/i)?.at( 1) || "";
		const title = card( ".teacher-name").text();
		const img = card ( "img.teacher-pic").attr()?.src || "";
		const city = card( ".teacher-city > span:nth-child(2)").text();
		const phone = card( ".phone").text();

		return {
			id: clean( id),
			title: clean( title),
			city: clean( city),
			phone: clean( phone),
			img: clean( img)
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
		urls.push( `${ url}?page=${ i}`);

	eachSeries( urls, getTutorPage, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default listTutors;