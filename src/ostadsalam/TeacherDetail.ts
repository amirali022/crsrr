import { createObjectCsvWriter} from "csv-writer";
import axios from "axios";
import { eachSeries} from "async";
import { load} from "cheerio";
import FormData from "form-data";
import { getKeys} from "../utils/getKeys";
import clean from "../utils/clean";

const csvWriter = createObjectCsvWriter( {
	path: `data/ostadsalam/teacherDetail/list-${ Date.now()}.csv`,
	header: [
		{ id: "url", title: "url"},
		{ id: "fields", title: "fields"},
		{ id: "city", title: "city"},
		{ id: "img", title: "img"},
		{ id: "name", title: "name"},
		{ id: "phone", title: "phone"},
		{ id: "mobile", title: "mobile"}
	]
});

const getDetail = async ( url: string) => {
	try {
		if( !url) return;

		console.log( `Fetching ${ url}`);

		const res = await axios.get( url);
	
		const $ = load( res.data);
	
		const fields = $( ".teacher-detail-keyword > a").map( ( idx, el) => {
			const field = load( el);
			return field.text();
		}).toArray().map( f => f.trim()).join( "|");
	
		const location = $( "ul.teacher-detail-description > li").filter( function( this) {
			return load( this).text().indexOf( "محل") > -1;
		});
	
		const city = location.children( "p").text();
		
		const image = $( ".course-detail-content-tool > div > img");
	
		const img = image[ 0]?.attribs.src || image[ 0]?.attribs[ "data-src"] || "";
	
		const name = $( ".course-detail-content-tool > div > span:nth-child(2)").text();
	
		const onclick = $( ".course-detail-content-tool > div > div > a")[ 0]?.attribs.onclick || "";
	
		const token = onclick ? onclick.split( ",")[ 1].slice( 1, -1) : "";
	
		let phone = "";
		let mobile = "";
	
		if( token) {
			const form = new FormData();
	
			form.append( "token", token);
			const res2 = await axios.post( "https://ostadsalam.ir/api/BaseApi/GetContactNumber", form);
	
			phone = res2.data?.result?.phone || "";
			mobile = res2.data?.result?.mobile || "";
		}
	
		const detail = {
			url,
			fields: clean( fields),
			city: clean( city),
			img: clean( img),
			name: clean( name),
			phone: clean( phone),
			mobile: clean( mobile)
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

const teacherDetail = async ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const urls = await getKeys( list, "link") as any;

	console.log( `Total Number of IDs: ${ urls.length}`);

	eachSeries( urls, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default teacherDetail;