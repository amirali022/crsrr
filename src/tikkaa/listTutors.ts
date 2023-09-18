import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";

const csvWriter = createObjectCsvWriter( {
	path: `data/tikkaa/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "name", title: "name"},
		{ id: "family", title: "family"},
		{ id: "url", title: "url"},
		{ id: "image", title: "image"},
		{ id: "country", title: "country"},
		{ id: "province", title: "province"},
		{ id: "languages", title: "languages"},
	]
});

const url = "https://tikkaa.ir/_next/data/tyYoFxWzWC6TSU51Zs6DI/find-teachers.json";

const getTutorList = async ( page: string) => {
	console.log( "Getting Page:");
	console.log( page);

	const res = await axios.get( page);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const tutors = res.data.pageProps.teachersData.data.data.map( ( t: any) => {
		return {
			id: t.id,
			name: t.name,
			family: t.family,
			url: t.url,
			image: t.image,
			country: t.country,
			province: t.province,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			languages: t.languages.map( ( l: any) => l.persian_name).join( "|")
		};
	});

	await csvWriter.writeRecords( tutors);
};

const getLastPage = async () => {
	const res = await axios.get( url);

	const lastPage = res.data.pageProps.teachersData.data.last_page;

	return lastPage;
};


const listTutors = async () => {
	const totalPages = await getLastPage();
	
	console.log( `Total Pages: ${ totalPages}`);

	const urls = [];

	for( let i = 1; i <= totalPages; ++i)
		urls.push( `${ url}?page=${ i}`);

	eachSeries( urls, getTutorList, err => {
		if( err) console.error( err);
		else console.log( "Finished!");
	});
};

export default listTutors;