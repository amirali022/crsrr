import { createObjectCsvWriter} from "csv-writer";
import axios from "axios";
import { eachSeries} from "async";
import { load} from "cheerio";
import FormData from "form-data";
import getKeys from "../utils/getKeys";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/iranmodares/tutorDetail/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "phone", title: "phone"},
		{ id: "email", title: "email"}
	]
});

const getDetail = async ( id: string) => {
	console.log( `Fetching ${ id}`);

	const form = new FormData();

	form.append( "Vphone", "yes");

	const res = await axios.post( `https://teaching.iranmodares.com/teaching-index.php?ID=${ id}`, form, {
		headers: { "Content-Type": "multipart/form-data"}
	});

	const $ = load( res.data);

	const phone = $( ".phone").text();
	const email = $( ".email").text();

	const detail = {
		id,
		phone: clean( phone),
		email: clean( email)
	};

	await csvWriter.writeRecords( [ detail]);
};

const tutorDetail = async ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Ids = await getKeys( list, "id") as any;
	
	console.log( `Total Number of IDs: ${ Ids.length}`);

	eachSeries( Ids, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default tutorDetail;