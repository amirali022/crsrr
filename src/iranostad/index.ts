import listTutors from "./listTutors";
import modeHelper from "../utils/modeHelper";

const ops = {
	1: "Get list of tutors and save them in a CSV file"
};

const op = parseInt( process.argv[ 2]);

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

( async () => {
	switch( op) {
	default:
		await listTutors();
		break;
	}
})();
