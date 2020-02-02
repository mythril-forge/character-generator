const UserChar = new Character()

const displayInfo = () => {
	// reroll character
	UserChar.generate()

	/* RACE & SUBRACE */
	// generate race text
	let raceText = ''
	if (UserChar.info['subrace'] !== null) {
		raceText += UserChar.info['subrace']
		raceText += ' '
	}
	raceText += UserChar.info['race']
	// apply to elements
	const raceEls = document.getElementsByClassName('race-info')
	for (const el of raceEls) {
		el.textContent = raceText
	}

	/* BACKGROUND */
	// generate background text
	let backText = UserChar.info['background']
	// apply to elements
	const backEls = document.getElementsByClassName('background-info')
	for (const el of backEls) {
		el.textContent = backText
	}

	/* ABILITY SCORES */
	// identify key info
	let abilityInfo = UserChar.info['ability scores']
	abilityInfo = Object.entries(abilityInfo)
	for (const [ability, score] of abilityInfo) {
		// generate ability score text
		let bonusText = Math.floor((score - 10) / 2)
		if (bonusText > 0) {
			bonusText = `+${bonusText.toString()}`
		} else if (bonusText < 0) {
			bonusText = `−${Math.abs(bonusText).toString()}`
		} else {
			bonusText = `±${bonusText.toString()}`
		}
		const abilityText = `${score.toString()} (${bonusText})`
		// apply to elements
		const classKey = `${ability}-score-info`
		const abilityEls = document.getElementsByClassName(classKey)
		for (const el of abilityEls) {
			el.textContent = abilityText
		}
	}

	/* PROFICIENCIES */
	// identify key info
	let proficiencyInfo = UserChar.info['proficiencies']
	proficiencyInfo = Object.entries(proficiencyInfo)
	for (const [category, categoryInfo] of proficiencyInfo) {
		// generate proficiency text
		let proficiencyText = ''
		categoryInfo.forEach((prof) => {
			if (proficiencyText === '') {
				proficiencyText = prof
			} else {
				proficiencyText += `, ${prof}`
			}
		})
		// apply to elements
		const classKey =  `proficient-${category}-info`
		const proficiencyEls = document.getElementsByClassName(classKey)
		for (const el of proficiencyEls) {
			el.textContent = proficiencyText
		}
	}
}
