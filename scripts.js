const UserChar = new Character()

const displayInfo = () => {
	UserChar.generate()
	const raceEl = document.getElementById('race')
	raceEl.textContent = UserChar.info['race']
	console.log(UserChar.info['race'])
}
