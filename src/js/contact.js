const form = document.getElementById("contact-form")
const button = document.getElementById("submit-button")
const errorText = document.getElementById("error-text")

form.addEventListener("submit", async function(e) {
	console.log("SUBMITTT")
	e.preventDefault(); // prevent default form reload

	const form = e.target;
	const formData = new FormData(form);

	try {

		button.classList.add("pulse")
		const response = await fetch("http://localhost:3003/contact", {
			method: "POST",
			body: formData
		});

		const text = await response.text();

		if (response.ok) {
			form.reset(); // clear form after successful submission
			success()
		} else {
			document.getElementById("form-response").style.color = "red";
		}
	} catch (err) {
		error()
		console.error(err);
		document.getElementById("form-response").textContent = "Something went wrong.";
		document.getElementById("form-response").style.color = "red";
	}
});

const success = () => {
	button.textContent = "SENT"
	button.classList.add("text-white", "bg-green-400")
	button.classList.remove("bg-white", "text-black")
	setTimeout(() => {
		button.textContent = "SEND"
		button.classList.add("bg-white", "text-black")
		button.classList.remove("bg-green-400", "text-white")
	}, 1000)
	errorText.hidden = true
}

const error = () => {
	button.textContent = "ERROR"
	button.classList.add("text-white", "bg-red-600")
	button.classList.remove("bg-white", "text-black")
	setTimeout(() => {
		button.textContent = "SEND"
		button.classList.add("bg-white", "text-black")
		button.classList.remove("bg-red-600", "text-white")
	}, 1000)

	errorText.hidden = false
}
