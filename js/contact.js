(() => {
  "use strict";

  const form = document.querySelector(".contact-form");
  if (!form) return;

  // To receive enquiries by email, set this to your form endpoint, e.g.
  //   const ENDPOINT = "https://formspree.io/f/yourformid";
  // Until then the form opens the visitor's email app instead, so no
  // enquiry is ever silently lost.
  const ENDPOINT = "";

  const submitButton = form.querySelector("button[type=submit]");
  const status = document.createElement("p");
  status.className = "form-status";
  status.setAttribute("role", "status");
  form.appendChild(status);

  function show(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
    status.classList.toggle("is-success", !isError);
  }

  function buildMailto() {
    const subject = encodeURIComponent("Enquiry from the academy website");
    const body = encodeURIComponent(
      "Name: " + form.name.value +
      "\nEmail: " + form.email.value +
      "\nInterest: " + form.interest.value +
      "\nMessage: " + form.message.value
    );
    return "mailto:hello@ajaycricketacademy.com?subject=" + subject + "&body=" + body;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending…";

    try {
      if (ENDPOINT) {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Form endpoint rejected the request");
        show("Thanks — your enquiry has been sent. We will reply shortly.", false);
        form.reset();
      } else {
        window.location.href = buildMailto();
        show("Your email app should have opened. If not, email hello@ajaycricketacademy.com directly.", false);
      }
    } catch (error) {
      show("Sorry, sending failed. Please email hello@ajaycricketacademy.com instead.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
})();