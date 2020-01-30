class Character {
	constructor() {
		Promise.all([
			fetch('./races.json').then(res => res.json()),
			fetch('./subraces.json').then(res => res.json()),
			fetch('./backgrounds.json').then(res => res.json()),
		])
		// .then(responses => responses.map(res => res.json()))
		.then((data) => {
			[ // set class attributes via deconstruction
				this.raceJSON,
				this.subraceJSON,
				this.backgroundJSON,
			] = data
			// this is where the "true" constructor begins
			this._rollCharacter()
		})
		.catch((error) => {
			console.error("Oh no! Something terrible happened.")
			new Error(error.message)
		})
	}

	_rollCharacter = () => {
		console.warn(this.raceJSON)
		console.warn(this.raceJSON["human"])
	}
}

const Vlanljorg = new Character
