import axios from "axios";
import { createObjectCsvWriter} from "csv-writer";
import { load} from "cheerio";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/tamland/list-${ Date.now()}.csv`,
	header: [
		{ id: "name", title: "name"},
		{ id: "field", title: "field"},
		{ id: "img", title: "img"},
		{ id: "ig", title: "ig"}
	]
});

const url = "https://tamland.ir/tamland-teachers/";

const getTutorList = async () => {
	console.log( "Getting Page:");
	console.log( url);

	const res = await axios.get( url);

	const $ = load( res.data);

	const tutorCards = $( "div.team-item");

	const tutors = tutorCards.map( ( idx, el) => {
		const card = load( el);

		const name = card( "h2.team-title > a").text();
		const field = card( "div.team-department").text();
		const img = card ( "div.team-image > img").attr()?.src || "";
		const ig = card( "a.fa-instagram").attr()?.href || "";

		return {
			name: clean( name),
			field: clean( field),
			img: clean( img),
			ig: clean( ig)
		};
	}).toArray();

	await csvWriter.writeRecords( tutors);
};

const listTutors = async () => {
	getTutorList();
};

export default listTutors;