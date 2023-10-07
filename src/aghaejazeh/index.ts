import { statSync} from "fs";
import listTutors from "./listTutors";
import tutorDetail from "./TutorDetail";
import modeHelper from "../utils/modeHelper";

const ops = {
	1: "Get list of teachers and save them in a CSV file",
	2: "Get detail of teachers and save them in a CSV file",
};

const op = parseInt( process.argv[ 2]);
let list = process.argv[ 3];

if( !op) {
	console.error( "Please Specify The Operation Code!");
	modeHelper( ops);
	process.exit( 1);
}

if( Object.keys( ops).indexOf( op.toString()) === -1) {
	console.error( "Invalid Operation Code!");
	modeHelper( ops);
	process.exit( 1);
}

if( op > 1) {
	if( !list) {
		console.error( "List name is required!");
		process.exit( 1);
	}

	list = `data/aghaejazeh/tutorsList/${ list}`;

	if( !statSync( list, { throwIfNoEntry: false})) {
		console.error( "List file does not exist!");
		process.exit( 1);
	}
}

( async () => {
	switch( op) {
	case 1:
		await listTutors();
		break;
	default:
		await tutorDetail( list);
		break;
	}
})();
