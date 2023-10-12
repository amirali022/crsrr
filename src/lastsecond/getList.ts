import axios from "axios";
import { eachSeries} from "async";
import { createObjectCsvWriter} from "csv-writer";
import clean from "../utils/clean";

const LOCATION = 328;

const PERPAGE = 50;

const url = "https://api.lastsecond.ir";

const FILTERS = {
	facilities: {
		cuisines: [],
		dietary: [],
		features: [],
		reservations: []
	},
	keywords: [],
	locations: [],
	mealTypes: [],
	priceRanges: [],
	restaurantTypes: [],
	reviewScore: 0
};

const csvWriter = createObjectCsvWriter( {
	path: `data/lastsecond/list-${ LOCATION}-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "titleFa", title: "titleFa"},
		{ id: "titleEn", title: "titleEn"},
		{ id: "addressFa", title: "addressFa"},
		{ id: "addressEn", title: "addressEn"},
		{ id: "phones", title: "phones"}
	]
});

const getTotalPage = async () => {
	const res = await axios.post( `${ url}/spots/restaurants/index`, {
		filters: FILTERS,
		location: LOCATION,
		page: 1,
		perPage: PERPAGE,
		sort: 1
	});

	const total = res.data.pagination?.last;

	return total;
};

const getOverview = async ( n: number) => {
	// eslint-disable-next-line no-async-promise-executor, @typescript-eslint/no-explicit-any
	return new Promise<any[]>( async ( resolve, reject) => {
		const arr = [];
		for( let i = 1; i <= n; ++i)
			arr.push( i);
	
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const results: any[] = [];
	
		const getPage = async ( i: number) => {
			const res = await axios.post( `${ url}/spots/restaurants/index`, {
				filters: FILTERS,
				location: LOCATION,
				page: i,
				perPage: PERPAGE,
				sort: 1
			});
	
			results.push( ...res.data.items);
		};
	
		eachSeries( arr, getPage, err => {
			if( err) reject( err);
			else resolve( results);
		});
	});
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getDetail = async ( item: any) => {
	console.log( `Getting Item: ${ item.titleEn}`);

	const res = await axios.post( `${ url}/spots/restaurants/show`, {
		restaurant: item.id
	});

	const detail = {
		id: item.id,
		titleFa: clean( res.data.restaurant?.titleFa),
		titleEn: clean( res.data.restaurant?.titleEn),
		addressFa: clean( res.data.restaurant?.addressFa),
		addressEn: clean( res.data.restaurant?.addressEn),
		phones: clean( res.data.restaurant?.telephones?.join( "|")),
	};

	await csvWriter.writeRecords( [ detail]);
};

const getList = async () => {
	const pages = await getTotalPage();

	if( !pages)
		throw new Error( "Unable to get total number of items");

	console.log( `Pages: ${ pages}`);

	const overview = await getOverview( pages);

	console.log( `Total Data: ${ overview.length}`);

	eachSeries( overview, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default getList;