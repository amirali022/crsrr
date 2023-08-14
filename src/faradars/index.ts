import { statSync} from "fs";
import listCourses from "./listCourses";
import courseDetail from "./courseDetail";

const ops = {
	1: "Get list of courses and save them in a CSV file",
	2: "Get detail of courses and save them in a CSV file"
};

const modeHelper = () => {
	console.log( "List of Available Operations:");
	Object.entries( ops).forEach( ( [ key, info]) => {
		console.log( `${ key}: ${ info}`);
	});
};

const op = parseInt( process.argv[ 2]);
let list = process.argv[ 3];

if( !op) {
	console.error( "Please Specify The Operation Code!");
	modeHelper();
	process.exit( 1);
}

if( Object.keys( ops).indexOf( op.toString()) === -1) {
	console.log( "Invalid Operation Code!");
	modeHelper();
	process.exit( 1);
}

if( op === 2) {
	if( !list) {
		console.error( "List name is required!");
		process.exit( 1);
	}

	list = `data/faradars/courseList/${ list}`;

	if( !statSync( list, { throwIfNoEntry: false})) {
		console.error( "List file does not exist!");
		process.exit( 1);
	}
}

( async () => {
	switch( op) {
	case 1:
		await listCourses( 100);
		break;
	default:
		await courseDetail( list);
		break;
	}
})();
