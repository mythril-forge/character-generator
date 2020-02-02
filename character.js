class Character {
	constructor() {
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
		})
		.catch((error) => {
			console.error("Oh no! Something terrible happened.")
			new Error(error.message)
		})
	}

	generate = () => {
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
				'armor': new Set(),
				'feats': new Set(),
				'languages': new Set(),
				'skills': new Set(),
				'tools': new Set(),
				'weapons': new Set(),
			},
			'features': new Object(),
		}

		// now call helper functions
		this._rollForStats()
		this._rollCharacter()
		this._parseFeatures()
	}

	/* Generates the basic 3 options for a new character. */
	_rollCharacter = () => {
		// choose race
		const races = Object.keys(this.raceData)
		this.info['race'] = [...rollKeys(1, races)][0]

		// choose subrace if applicable
		if (this.info['race'] in this.subraceData) {
			const subraces = Object.keys(
				this.subraceData[this.info['race']]
			)
			this.info['subrace'] = [...rollKeys(1, subraces)][0]
		} else {
			this.info['subrace'] = null
			delete this.info[this.info['subrace']]
	}

		// choose background
		const backgrounds = Object.keys(this.backgroundData)
		this.info['background'] = [...rollKeys(1, backgrounds)][0]
	}

	/* Rolling for stats is always fun, including in JavaScript :) */
	_rollForStats = () => {
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
	}

	_parseFeatures = () => {
		let datasets
		const race = this.info['race']
		const subrace = this.info['subrace']
		const background = this.info['background']

		{ // Block scoped to forget unneeded constants.
			const raceData = this.raceData[race]
			const backgroundData = this.backgroundData[background]
			let subraceData
			// Sometimes there exists no subrace for a race.
			if (race in this.subraceData) {
				subraceData = this.subraceData[race][subrace]
			} else {
				subraceData = new Object()
			}
			// "datasets" is all we needed out of this block.
			datasets = [raceData, subraceData, backgroundData]
		}

		// ability score bonuses
		datasets.forEach((data) => {
			const key = 'ability score bonuses'
			if (key in data) {
				const entries = Object.entries(data[key])
				for (const [ability, bonus] of entries) {
					this.info['ability scores'][ability] += bonus
				}
			}
		})

		// extra ability score bonuses
		datasets.forEach((data) => {
			// shorten this all-to-needed phrase
			const key = 'extra ability score bonuses'
			if (key in data) {
				const amount = data[key][0]
				let bonuses = new Set(data[key].slice(1))

				// roll for ability score bonuses
				bonuses = rollKeys(amount, bonuses)

				// add bonuses to ability scores
				bonuses.forEach((bonus) => {
					this.info['ability scores'][bonus] += 1
				})
			}
		})

		// proficiencies
		datasets.forEach((data) => {
			// shorten this all-too-needed phrase
			const key = 'proficiencies'

			// check if there is any proficiencies to take
			if (key in data) {

				// loop through all the proficiency types
				const entries = Object.entries(data[key])
					entries.forEach(([type, profs]) => {
					const old = this.info[key][type]

					// check for duplicates between old and profs
					let intersection = new Set(
						[...profs].filter(prof => old.has(prof))
					)
					if (intersection.size !== 0) {
						console.warn("you have redundant skills!")
						console.info(intersection)
					}

					// add contents to proficiency type
					this.info[key][type] = new Set([...old, ...profs])
				})
			}
		})

		// extra proficiencies
		datasets.forEach((data) => {
			const key = 'extra proficiencies'

			// check if there is any proficiencies to take
			if (key in data) {
				const entries = Object.entries(data[key])
				// loop through all the proficiency types
				entries.forEach(([type, entry]) => {
					const old = this.info['proficiencies'][type]
					const amount = entry[0]
					let profs = new Set(entry.slice(1))

					// remove proficiency choices that are in old
					profs = new Set(
						[...profs].filter(prof => !old.has(prof))
					)

					// roll for proficiency choices
					profs = rollKeys(amount, profs)

					// check for duplicates between old and profs
					let intersection = new Set(
						[...profs].filter(prof => old.has(prof))
					)
					if (intersection.size !== 0) {
						console.warn("you have redundant skills!")
						console.info(intersection)
					}

					// add contents to proficiency type
					this.info['proficiencies'][type] = new Set([...old, ...profs])
				})
			}
		})

		// text-based features
		datasets.forEach((data) => {
			const key = 'features'
			console.warn("CHECKING KEY")
			console.log(data[key])
			let entries
			if (data[key] == undefined) {
				entries = new Array()
			} else {
				entries = Object.entries(data[key])
			}
			// loop through all the proficiency types
			entries.forEach(([feature, description]) => {
				this.info['features'][feature] = description
			})
		})
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


const rollKeys = (count, array, random = Math.random) => {
	const keys = [...array] // create copy
	const results = new Set()
	for (let i=0; i<count; i++) {
		const roll = Math.floor(random() * keys.length)
		results.add(keys[roll])
		keys.splice(roll, 1)
	}
	return results
}
