import { createObjectCsvWriter} from "csv-writer";
import axios from "axios";
import { eachSeries} from "async";
import { getSlugs} from "../utils/faradars";

const csvWriter = createObjectCsvWriter( {
	path: `data/faradars/instructorList/list-${ Date.now()}.csv`,
	header: [
		{ id: "id", title: "id"},
		{ id: "first_name", title: "first_name"},
		{ id: "last_name", title: "last_name"},
		{ id: "first_name_en", title: "first_name_en"},
		{ id: "last_name_en", title: "last_name_en"},
		{ id: "gender", title: "gender"},
		{ id: "photo", title: "photo"},
		{ id: "field", title: "field"},
		{ id: "profile_picture", title: "profile_picture"},
		{ id: "degree", title: "degree"},
		{ id: "categories", title: "categories"},
		{ id: "categories_fa", title: "categories_fa"},
		{ id: "price", title: "price"},
		{ id: "sold_n", title: "sold_n"},
		{ id: "type", title: "type"},
		{ id: "duration", title: "duration"},
		{ id: "createdAt", title: "createdAt"},
		{ id: "rating", title: "rating"},
		{ id: "rating_n", title: "rating_n"}
	]
});

const getDetail = async ( slug: string) => {
	console.log( `Fetching ${ slug}`);

	const res = await axios.get( `https://faradars.org/api/v1.1/product/${ slug}`);

	const data = res.data.data;
	
	if( data.instructors && data.instructors.length) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const instructors = data.instructors.map( ( inst: any) => {
			return {
				id: data.id,
				first_name: inst.first_name || "",
				last_name: inst.last_name || "",
				first_name_en: inst.first_name_en || "",
				last_name_en: inst.last_name_en || "",
				gender: inst.gender || "",
				photo: inst.photo || "",
				field: inst.field || "",
				profile_picture: inst.profile_picture || "",
				degree: inst.degree || "",
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				categories: data.categories.map( ( cat:any) => cat.slug).join( "|") || "",
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				categories_fa: data.categories.map( ( cat:any) => cat.name.replace( ",", " ")).join( "|") || "",
				price: data.price,
				sold_n: data.sold_count,
				type: data.type,
				duration: data.total_duration_minute,
				createdAt: data.created_at,
				rating: data.rating,
				rating_n: data.rating_count
			};
		});
	
		await csvWriter.writeRecords( instructors);
	} 

};

const instructor = async ( list: string) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const slugs = await getSlugs( list) as any;

	eachSeries( slugs, getDetail, err => {
		if( err) console.error( err);
		else console.log( "Finished");
	});
};

export default instructor;