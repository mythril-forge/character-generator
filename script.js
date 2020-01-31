class Character {
	constructor() {
		/* This info represents all that is needed for a "Level 0" character. */
		this.info = {
			'race': null,
			'subrace': null,
			'background': null,
			'ability scores': {
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

		/* The data-getting promise is currently executed whenever the class is made. */
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

	/* Generates the basic 3 options for a new character. */
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
		/* These functions see little use other than being helpers here. */
		// Roll ability scores using virtual dice.
		// Rules support the standard "4d6 drop lowest" method.
		const _rollAbilityScores = () => {
			const results = []
			for (let i=0; i<6; i++) {
				const roll = rollDice(4, 6).slice(1)
				const score = roll.reduce((sum, die) => sum + die)
				results.push(score)
			}
			return results
		}

		// The standard array is a pregenerated set of scores.
		// The ordered values are scrambled.
		const _rollStandardArray = () => {
			const standard = [8, 10, 12, 13, 14, 15]
			const results = []
			for (let i=6; i>0; i--) {
				const roll = rollDice(1, i) - 1
				results.push(standard[roll])
				standard.splice(roll, 1)
			}
			return results
		}

		// The scores on there own mean little.
		// Mapping to self.info makes scores official!
		const _mapAbilityScores = (scores) => {
			const abilities = [
				'strength',
				'dexterity',
				'constitution',
				'intelligence',
				'wisdom',
				'charisma',
			]
			const abilityScores = new Object()
			abilities.forEach((ability, index) => {
				abilityScores[ability] = scores[index]
			})
			return abilityScores
		}

		/* Resolve initial ability scores. */
		// Flip a coin...
		// Heads, roll the ability scores randomly.
		// Tails, assign the standard array.
		let abilityScores
		if (rollDice(1, 2) == 2) {
			abilityScores = _rollAbilityScores()
		} else {
			abilityScores = _rollStandardArray()
		}
		this.info['ability scores'] = _mapAbilityScores(abilityScores)

		// ability score bonuses
		// proficiencies
		// extra proficiencies
		// text-based features
	}
}


const rollDice = (count, size, random = Math.random) => {
	const results = new Array()
	for (let i=0; i<count; i++) {
		const roll = 1 + Math.floor(random() * size)
		results.push(roll)
	}
	return results.sort()
}


const rollKeys = (count, object, random = Math.random) => {
	const keys = Object.keys(object)
	const results = new Set()
	for (let i=0; i<count; i++) {
		const roll = Math.floor(random() * keys.length)
		results.add(keys[roll])
		keys.splice(roll, 1)
	}
	return results
}


const Vlanljorg = new Character
