document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('reportForm');
    const submitButton = document.getElementById('submitButton');
    const responseMessage = document.getElementById('responseMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const text = btoa(document.getElementById('text').value);
        submitButton.disabled = true;

        try {
            const response = await fetch('/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (response.ok) {
                responseMessage.textContent = data.msg;
                responseMessage.style.color = 'green';
            } else {
                responseMessage.textContent = data.msg;
                responseMessage.style.color = 'red';
            }
        } catch (error) {
            responseMessage.textContent = 'An error occurred. Please try again later.';
            responseMessage.style.color = 'red';
        }

        submitButton.disabled = false;
    });
});