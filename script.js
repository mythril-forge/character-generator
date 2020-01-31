class Character {
	constructor() {
		this.abilities = {
			'strength': 0,
			'dexterity': 0,
			'constitution': 0,
			'intelligence': 0,
			'wisdom': 0,
			'charisma': 0,
		}

		Promise.all([
			fetch('./races.json').then(res => res.json()),
			fetch('./subraces.json').then(res => res.json()),
			fetch('./backgrounds.json').then(res => res.json()),
		])
		.then((data) => {
			[ // set class attributes via deconstruction
				this.raceData,
				this.subraceData,
				this.backgroundData,
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
		// choose race
		this.race = [...rollKeys(1, this.raceData)][0]
		// choose subrace if applicable
		if (this.race in this.subraceData) {
			const subraces = this.subraceData[this.race]
			this.subrace = [...rollKeys(1, subraces)][0]
		} else {
			this.subrace = null
		}
		// choose background
		this.background = [...rollKeys(1, this.backgroundData)][0]

		console.log(this.subrace, this.race, this.background)
	}
}

const rollDice = (count, size, random = Math.random) => {
	const results = []
	for (let i=0; i < count; i++) {
		const roll = 1 + Math.floor(random() * size)
		results.push(roll)
	}
	return results
}

const rollKeys = (count, object, random = Math.random) => {
	const keys = Object.keys(object)
	const results = new Set()
	for (let i=0; i < count; i+=1) {
		const roll = Math.floor(random() * keys.length)
		results.add(keys[roll])
		keys.splice(roll, 1)
	}
	return results
}

const Vlanljorg = new Character