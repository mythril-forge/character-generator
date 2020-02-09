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

	/* HEIGHT WEIGHT & AGE */
	// identify key info
	let heightText = UserChar.info['height']
	const inFeet = Math.floor(heightText / 12)
	const inInches = heightText % 12
	heightText = `${inFeet}'`
	if (inInches > 0) {
		heightText += `${inInches}"`
	}
	const weightText = `${UserChar.info['weight']} lbs.`
	const ageText = `${UserChar.info['age']} years`
	const nameText = UserChar.info['name']
	console.warn(nameText)
	// apply to elements
	const ageEls = document.getElementsByClassName('age-info')
	const weightEls = document.getElementsByClassName('weight-info')
	const heightEls = document.getElementsByClassName('height-info')
	const nameEls = document.getElementsByClassName('name-info')
	for (const el of ageEls) {
		el.textContent = ageText
	}
	for (const el of weightEls) {
		el.textContent = weightText
	}
	for (const el of heightEls) {
		el.textContent = heightText
	}
	for (const el of nameEls) {
		el.textContent = nameText
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

	/* OTHER MECHANICS */
	// creature size
	const sizeText = UserChar.info['size']
	const sizeEls = document.getElementsByClassName('size-info')
	for (const el of sizeEls) {
		el.textContent = sizeText
	}
	// movement speed
	const movementText = UserChar.info['movement']
	const movementEls = document.getElementsByClassName('movement-info')
	for (const el of movementEls) {
		el.textContent = `${movementText} feet`
	}
	// armor class
	let armorText = UserChar.info['ability scores']['dexterity']
	armorText = 10 + Math.floor((armorText - 10) / 2)
	const armorEl = document.getElementsByClassName('armor-info')
	for (const el of armorEl) {
		el.textContent = `${armorText} AC`
	}

	/* PROFICIENCIES */
	// identify key info
	let proficiencyInfo = UserChar.info['proficiencies']
	proficiencyInfo = Object.entries(proficiencyInfo)
	.filter((data) => {
		return data[1].size != 0
	})
	const proficiencyContainerEl = document.getElementById('proficiency-container')
	// clear all container children
	while (proficiencyContainerEl.firstChild) {
		proficiencyContainerEl.removeChild(proficiencyContainerEl.firstChild)
	}
	// loop through each proficiency category
	for (const [categoryText, proficiencies] of proficiencyInfo) {
		// create new category heading & prof-list elements
		const categoryEl = document.createElement('h3')
		const proficiencyListEl = document.createElement('ul')
		// apply text & content to elements
		categoryEl.textContent = categoryText
		proficiencyContainerEl.appendChild(categoryEl)
		proficiencyContainerEl.appendChild(proficiencyListEl)
		// repeat with iterable proficiency lists
		proficiencies.forEach((proficiencyText) => {
			const proficiencyEl = document.createElement('li')
			proficiencyEl.textContent = proficiencyText
			proficiencyListEl.appendChild(proficiencyEl)
		})
	}

	/* FEATURES */
	// identify key info
	let featureInfo = UserChar.info['features']
	featureInfo = Object.entries(featureInfo)
	const featureContainerEl = document.getElementById('features-container')
	// clear all container children
	while (featureContainerEl.firstChild) {
		featureContainerEl.removeChild(featureContainerEl.firstChild)
	}
	// loop through each feature entry
	for (const [featureText, descriptionText] of featureInfo) {
		// create new feature & feature description elements
		const featureEl = document.createElement('h3')
		const descriptionEl = document.createElement('p')
		// apply text & content to elements
		featureEl.textContent = featureText
		descriptionEl.textContent = descriptionText
		featureContainerEl.appendChild(featureEl)
		featureContainerEl.appendChild(descriptionEl)
	}

	/* STARTING EQUIPMENT */
	// identify key info
	let equipmentInfo = UserChar.info['equipment']
	const equipmentContainerEl = document.getElementById('equipment-container')
	// clear all equipment children
	while (equipmentContainerEl.firstChild) {
		equipmentContainerEl.removeChild(equipmentContainerEl.firstChild)
	}
	// loop through each equipment entry
	equipmentInfo.forEach((itemText) => {
		const itemEl = document.createElement('li')
		// apply text to new element
		itemEl.textContent = itemText
		equipmentContainerEl.appendChild(itemEl)
	})

	/* CHARACTERISTICS */
	// identify key info
	let characteristicInfo = UserChar.info['characteristics']
	characteristicInfo = Object.entries(characteristicInfo)
	const characteristicContainerEl = document.getElementById('characteristics-container')
	// clear all container children
	while (characteristicContainerEl.firstChild) {
		characteristicContainerEl.removeChild(characteristicContainerEl.firstChild)
	}
	// loop through each characteristic entry
	for (const [characteristicText, descriptionText] of characteristicInfo) {
		// create new characteristic & characteristic description elements
		const characteristicEl = document.createElement('h3')
		const descriptionEl = document.createElement('p')
		// apply text & content to elements
		characteristicEl.textContent = characteristicText
		descriptionEl.textContent = descriptionText
		characteristicContainerEl.appendChild(characteristicEl)
		characteristicContainerEl.appendChild(descriptionEl)
	}

}
