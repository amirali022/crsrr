const modeHelper = ( ops: { [ key: number]: string}) => {
	console.log( "List of Available Operations:");
	Object.entries( ops).forEach( ( [ key, info]) => {
		console.log( `${ key}: ${ info}`);
	});
};

export default modeHelper;