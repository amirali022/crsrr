import { createObjectCsvWriter} from "csv-writer";
import axios from "axios";
import { eachSeries} from "async";
import { load} from "cheerio";
import getKeys from "../utils/getKeys";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/aghaejazeh/tutorsDetail/list-${ Date.now()}.csv`,
	header: [
		{ id: "url", title: "url"},
		{ id: "phone", title: "phone"}
	]
});

const getDetail = async ( url: string) => {
	try {
		if( !url) return;

		console.log( `Fetching ${ url}`);

		const res = await axios.get( url);
	
		const $ = load( res.data);

		const phones = $( "i.fa.fa-phone + a[href]");

		const phone = phones.length > 2 ? load( phones[ 0]).text() : "";

		const detail = {
			url,
			phone: clean( phone),
		};
	
		await csvWriter.writeRecords( [ detail]);
	} catch( err) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if( ( err as any).code !== "ERR_BAD_REQUEST") {
			throw err;
		} else {
			console.error( "404");
		}
	}
};

const tutorDetail = async ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const urls = await getKeys( list, "link") as any;

	console.log( `Total Number of IDs: ${ urls.length}`);
	
	eachSeries( urls, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default tutorDetail;