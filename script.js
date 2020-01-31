class Character {
	constructor() {
		this.info = {
			'race': null,
			'subrace': null,
			'background': null,
			'abilities': {
				'strength': 0,
				'dexterity': 0,
				'constitution': 0,
				'intelligence': 0,
				'wisdom': 0,
				'charisma': 0,
			},
			'proficiencies': {
				'skills': new Set(),
				'tools': new Set(),
				'languages': new Set(),
			},
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
			this._parseFeatures()
		})
		.catch((error) => {
			console.error("Oh no! Something terrible happened.")
			new Error(error.message)
		})
	}


	_rollCharacter = () => {
		// choose race
		this.info['race'] = [...rollKeys(1, this.raceData)][0]
		this.info[this.info['race']] = new Object()

		// choose subrace if applicable
		if (this.info['race'] in this.subraceData) {
			const subraces = this.subraceData[this.info['race']]
			this.info['subrace'] = [...rollKeys(1, subraces)][0]
			this.info[this.info['subrace']] = new Object()
		} else {
			this.info['subrace'] = null
			delete this.info[this.info['subrace']]
	}

		// choose background
		this.info['background'] = [...rollKeys(1, this.backgroundData)][0]
		this.info[this.info['background']] = new Object()
	}


	_parseFeatures = () => {
		// ability scores
		// ability score bonuses
		// proficiencies
		// extra proficiencies
		// text-based features
	}
}


const rollDice = (count, size, random = Math.random) => {
	const results = []
	for (let i=0; i < count; i++) {
		const roll = 1 + Math.floor(random() * size)
		results.push(roll)
	}
	return results.sort()
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
