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
			console.error('Oh no! Something terrible happened.')
			new Error(error.message)
		})
	}

	generate = () => {
		/* This info represents all that is needed for a 'Level 0' character. */
		this.info = {
			'race': null,
			'subrace': null,
			'background': null,
			'size': null,
			'movement': null,
			'name': null,
			'age': null,
			'weight': null,
			'height': null,
			'ability scores': {
				'strength': 0,
				'dexterity': 0,
				'constitution': 0,
				'intelligence': 0,
				'wisdom': 0,
				'charisma': 0,
			},
			'proficiencies': {
				'armors': new Set(),
				'feats': new Set(),
				'languages': new Set(),
				'skills': new Set(),
				'tools': new Set(),
				'weapons': new Set(),
			},
			'characteristics': new Object(),
			'features': new Object(),
			'equipment': new Array(),
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
		// Rules support the standard '4d6 drop lowest' method.
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
			// 'datasets' is all we needed out of this block.
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
					let extra = new Set()
					if (intersection.size !== 0) {
						console.warn('you have redundant skills!')
						console.info(intersection)
						extra.add('+1 skill of your choice')
					}

					// add contents to proficiency type
					this.info[key][type] = new Set([...old, ...profs, ...extra])
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
					let extra = new Set()
					if (intersection.size !== 0) {
						console.warn('you have redundant skills!')
						console.info(intersection)
						extra.add('+1 skill of your choice')
					}

					// add contents to proficiency type
					this.info['proficiencies'][type] = new Set([...old, ...profs, ...extra])
				})
			}
		})

		// equipment
		datasets.forEach((data) => {
			const key = 'equipment'
			// ensure entries is a loopable item
			let entries = new Array()
			if (data[key] != undefined) {
				entries = data[key]
			}
			// loop through each equipment entry.
			// an entry is an array with one or more items.
			// one of those items should be randomly selected.
			entries.forEach((entry) => {
				const item = [...rollKeys(1, entry)][0]
				this.info['equipment'].push(item)
			})
		})

		// miscellaneous character details
		datasets.forEach((data) => {
			if (data['size']) {
				this.info['size'] = data['size']
			}
			if (data['movement']) {
				this.info['movement'] = data['movement']
			}
		})

		// text-based features
		datasets.forEach((data) => {
			const key = 'features'
			// ensure entries is a loopable item
			let entries = new Array()
			if (data[key] != undefined) {
				entries = Object.entries(data[key])
			}
			// loop through all the proficiency types
			entries.forEach(([feature, description]) => {
				this.info['features'][feature] = description
			})
		})

		// characteristics
		datasets.forEach((data) => {
			const key = 'characteristics'
			// ensure entries is a loopable item
			let entries = new Array()
			if (data[key] != undefined) {
				entries = Object.entries(data[key])
			}
			// loop through all the proficiency types
			entries.forEach(([characteristic, info]) => {
				// determine description from random choice
				const description = [...rollKeys(1, info)][0]
				this.info['characteristics'][characteristic] = description
			})
		})

		// names
		datasets.forEach((data) => {
			if (data['names'] !== undefined) {
				// setup
				let names = new Array()
				let nameData
				let key

				// get nameData
				const keys = Object.keys(data['names'])
				key = [...rollKeys(1, keys)][0]
				nameData = data['names'][key]

				// roll gender
				if ([...rollDice(1, 2)][0] === 1) {
					key = 'first-female'
				} else {
					key = 'first-male'
				}
				// roll first-name
				if (key in nameData) {
					names.push([...rollKeys(1, nameData[key])][0])
				}

				// roll middle-name
				key = 'middle'
				if (key in nameData) {
					names.push([...rollKeys(1, nameData[key])][0])
				}

				// roll last-name
				key = 'last'
				if (key in nameData) {
					names.push([...rollKeys(1, nameData[key])][0])
				}

				this.info['name'] = names.join(' ')
			}
		})

		// age, height, & weight
		let maxAge = 0
		let adultAge = 0
		let weight = 0
		let height = 0
		let weightMod = 0
		let heightMod = 0
		datasets.forEach((data) => {
			if (data['base height'] != undefined) {
				height = data['base height']
			}
			if (data['height modifier'] != undefined) {
				heightMod = data['height modifier']
			}
			if (data['base weight'] != undefined) {
				weight = data['base weight']
			}
			if (data['weight modifier'] != undefined) {
				weightMod = data['weight modifier']
			}
			if (data['max age'] != undefined) {
				maxAge = data['max age']
			}
			if (data['adult age'] != undefined) {
				adultAge = data['adult age']
			}
		})
		heightMod = [...rollDice(...heightMod)][0]
		weightMod = [...rollDice(...weightMod)][0]

		const randAge = () => {
			const minAge = Math.floor(adultAge * 3 / 4)
			const ageRoll = [...rollDice(1, maxAge - minAge + 1)][0]
			const result = ageRoll + minAge - 1
			return ageRoll + minAge - 1
		}

		let age = new Array()
		for(let i = 0; i < 20; i += 1) {
				age.push(randAge())
		}
		age = age.sort((a, b) => a - b)

		this.info['weight'] = weight + heightMod
		this.info['height'] = height + (heightMod + weightMod)
		this.info['age'] = age[2]
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
